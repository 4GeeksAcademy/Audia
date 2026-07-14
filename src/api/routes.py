"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Review
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from api.utils import generate_sitemap, APIException
import json
import os
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from werkzeug.utils import secure_filename
from api.models import db, User, Favorite


class APIException(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

class APIException(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

# 2. ¡ESTA ES LA LÍNEA QUE FALTABA! Inicializamos el Blueprint.
api = Blueprint('api', __name__)

LASTFM_BASE_URL = os.getenv("LASTFM_API_URL", "https://ws.audioscrobbler.com/2.0/")


def _lastfm_request(method, **params):
    api_key = os.getenv("LASTFM_API_KEY", "")
    if not api_key:
        raise APIException(message="LASTFM_API_KEY no configurada", status_code=500)

    query_params = {
        "method": method,
        "api_key": api_key,
        "format": "json",
        **params,
    }
    url = f"{LASTFM_BASE_URL}?{urlencode(query_params)}"
    print(f"Making request to Last.fm URL: {url}")

    request_obj = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "Audia/1.0",
        },
    )

    try:
        with urlopen(request_obj, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", "ignore")
        try:
            details = json.loads(body)
            message = details.get("message") or details.get("error") or body
        except Exception:
            message = body or "Last.fm devolvió un error"
        raise APIException(message=message, status_code=exc.code)
    except URLError:
        raise APIException(message="No se pudo conectar con Last.fm", status_code=502)
    except TimeoutError:
        raise APIException(message="La búsqueda tardó demasiado en responder", status_code=504)
    except Exception:
        raise APIException(message="No se pudo completar la búsqueda en Last.fm", status_code=502)

    if isinstance(payload, dict) and "error" in payload:
        raise APIException(
            message=payload.get("message", "Last.fm devolvió un error"),
            status_code=502,
        )

    return payload


def _lastfm_image_url(item):
    for size in ("extralarge", "mega", "large", "medium", "small"):
        for image in item.get("image", []):
            if image.get("size") == size:
                url = (image.get("#text") or "").strip()
                if url:
                    return url
    return None


def _normalize_lastfm_album(item):
    if not isinstance(item, dict):
        return None

    artist_name = (item.get("artist") or "").strip() or "Desconocido"

    name = item.get("name") or ""
    mbid = (item.get("mbid") or "").strip()

    tags_data = item.get("tags", {})

    if isinstance(tags_data, dict):
        tags = tags_data.get("tag", [])
    else:
        tags = []

    if isinstance(tags, dict):
        tags = [tags]
    elif not isinstance(tags, list):
        tags = []

    tag_list = []
    for tag in tags:
        tag_list.append(tag.get("name"))


    tracks_data = item.get("tracks", {})
    if isinstance(tracks_data, dict):
        tracks = tracks_data.get("track", [])
    else:
        tracks = []

    if isinstance(tracks, dict):
        tracks = [tracks]
    elif not isinstance(tracks, list):
        tracks = []

    summary = item.get("wiki", {}).get("summary", "")

    normalized_tracks = []
    for track in tracks:
        normalized_tracks.append({
            "name": track.get("name"),
        })

    return {
        "id": mbid or f"{artist_name}/{name}",
        "name": name,
        "cover": _lastfm_image_url(item),
        "artist": artist_name,
        "summary": summary,
        "tags": tag_list,
        "link": item.get("url"),
        "tracks": normalized_tracks,
    }


def _normalize_lastfm_results(payload):
    normalized = []

    # 1. Accedemos a la lista real que está dentro de 'albummatches'
    items = payload.get("results", {}).get("albummatches", {}).get("album", [])

    for item in items:
        # 2. Extraemos el nombre del artista (Last.fm lo devuelve como string)
        artist_name = (item.get("artist") or "").strip()
        name = (item.get("name") or "").strip()
        if not artist_name or not name:
            continue

        # 3. Formateamos el objeto para que tu frontend lo entienda bien
        mbid = (item.get("mbid") or "").strip()
        cover = _lastfm_image_url(item)

        normalized.append({
            "mbid": mbid or None,
            "name": name,
            "artist": artist_name,
            "link": item.get("url"),
            "cover": cover,
        })

    return normalized


def _normalize_lastfm_top_albums(payload):
    # tag.gettopalbums: la lista está en albums.album (no en results.albummatches.album
    # como album.search) y artist viene como objeto {"name": "..."}, no como string. No reutilizamos _normalize_lastfm_results
    normalized = []

    items = payload.get("albums", {}).get("album", [])
    if isinstance(items, dict):
        items = [items]
    elif not isinstance(items, list):
        items = []

    for item in items:
        if not isinstance(item, dict):
            continue

        name = (item.get("name") or "").strip()
        artist_data = item.get("artist")
        if isinstance(artist_data, dict):
            artist_name = (artist_data.get("name") or "").strip()
        else:
            artist_name = (artist_data or "").strip()

        if not name or not artist_name:
            continue

        mbid = (item.get("mbid") or "").strip()
        normalized.append({
            "mbid": mbid or None,
            "name": name,
            "artist": artist_name,
            "link": item.get("url"),
            "cover": _lastfm_image_url(item),
        })

    return normalized


# 4. Las rutas usando el decorador del Blueprint
@api.route("/lastfm/search", methods=["GET"])
def lastfm_search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "El parámetro query es obligatorio"}), 400

    page = request.args.get("page", "1")
    limit = request.args.get("limit", "50")

    try:
        payload = _lastfm_request(
            "album.search",
            album=query,
            page=page,
            limit=limit,
        )
    except APIException as exc:
        return jsonify({"error": str(exc)}), exc.status_code

    return jsonify({
        "query": query,
        "results": _normalize_lastfm_results(payload),
    }), 200


@api.route("/lastfm/featured-albums", methods=["GET"])
def lastfm_featured_albums():
    tag = request.args.get("tag", "disco").strip()
    limit = request.args.get("limit", "12")

    if not tag:
        return jsonify({"error": "El tag es obligatorio"}), 400

    try:
        payload = _lastfm_request(
            "tag.gettopalbums",
            tag=tag,
            limit=limit,
        )
    except APIException as exc:
        return jsonify({"error": str(exc)}), exc.status_code

    return jsonify({
        "tag": tag,
        "results": _normalize_lastfm_top_albums(payload),
    }), 200


@api.route("/lastfm/album", methods=["GET"])
def lastfm_album_detail():
    artist = request.args.get("artist", "").strip()
    album = request.args.get("album", "").strip()
    mbid = request.args.get("mbid", "").strip()

    try:
        if artist and album:
            payload = _lastfm_request(
                "album.getInfo",
                artist=artist,
                album=album,
            )
        elif mbid:
            payload = _lastfm_request("album.getInfo", mbid=mbid)
        else:
            return jsonify({
                "error": "Indica artist y album, o mbid",
            }), 400
    except APIException as exc:
        return jsonify({"error": str(exc)}), exc.status_code

    normalized_album = _normalize_lastfm_album(payload.get("album", {}))
    if not normalized_album or not normalized_album.get("name"):
        return jsonify({"error": "No se encontró el álbum"}), 404

    return jsonify({"album": normalized_album}), 200


@api.route("/reviews", methods=["GET"])
@jwt_required()
def get_user_reviews():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    reviews = (
        Review.query
        .filter_by(user_id=user_id)
        .order_by(Review.id.desc())
        .all()
    )

    reviews_data = []
    for review in reviews:
        data = review.serialize()
        album_id = data["album_id"]

        # album_id puede ser un mbid de Last.fm o "Artista/Álbum"
        artist = None
        album = None
        if "/" in album_id:
            artist, album = album_id.split("/", 1)

        normalized_album_data = None
        # Intentamos obtener el álbum de Last.fm con el mbid o "Artista/Álbum"
        try:
            if artist and album:
                payload = _lastfm_request(
                    "album.getInfo",
                    artist=artist,
                    album=album,
                )
            else:
                payload = _lastfm_request("album.getInfo", mbid=album_id)

            # Normalizamos los datos del álbum de Last.fm
            normalized_album_data = _normalize_lastfm_album(payload.get("album", {}))
        except APIException:
            pass
        # Agregamos los datos del álbum de Last.fm a la respuesta
        data["album"] = (normalized_album_data or {}).get("name") or album or album_id
        data["artist"] = (normalized_album_data or {}).get("artist") or artist or "Desconocido"
        data["cover"] = (normalized_album_data or {}).get("cover")
        reviews_data.append(data)

    return jsonify({"reviews": reviews_data}), 200


@api.route("/reviews/album", methods=["GET"])
def get_album_reviews():
    album_id = request.args.get("album_id", "").strip()
    if not album_id:
        return jsonify({"error": "El álbum es obligatorio"}), 400

    reviews = (
        Review.query
        .filter_by(album_id=album_id)
        .order_by(Review.id.desc())
        .all()
    )

    return jsonify({
        "reviews": [review.serialize() for review in reviews],
    }), 200


@api.route("/review", methods=["GET", "POST", "PUT"])
@jwt_required(optional=True)
def review():
    if request.method == "GET":
        album_id = request.args.get("album_id", "").strip()
        if not album_id:
            return jsonify({"error": "El álbum es obligatorio"}), 400
            
        # Si se proporciona user_id, se obtiene la reseña del usuario especificado,
        # sino, se obtiene la reseña del usuario autenticado
        requested_user_id = request.args.get("user_id", "").strip()
        if requested_user_id:
            user_id = int(requested_user_id)
        else:
            jwt_user = get_jwt_identity()
            if not jwt_user:
                return jsonify({"error": "No autorizado"}), 401
            user_id = int(jwt_user)

        existing_review = Review.query.filter_by(
            album_id=album_id,
            user_id=user_id,
        ).first()

        if not existing_review:
            return jsonify({"review": None}), 200

        return jsonify({"review": existing_review.serialize()}), 200

    jwt_user = get_jwt_identity()
    if not jwt_user:
        return jsonify({"error": "No autorizado"}), 401

    user_id = int(jwt_user)
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    review_text = data.get("review", "")
    rating = data.get("rating", None)
    album_id = data.get("album_id", None)

    if not review_text or not rating:
        return jsonify({"error": "La reseña y el puntaje son obligatorios"}), 400
    if not album_id:
        return jsonify({"error": "El álbum es obligatorio"}), 400

    if request.method == "PUT":
        existing_review = Review.query.filter_by(album_id=album_id, user_id=user_id).first()
        if not existing_review:
            return jsonify({"error": "No tienes una reseña para este álbum"}), 404
        try:
            existing_review.text = review_text
            existing_review.rating = rating
            db.session.commit()

            return jsonify({"review": existing_review.serialize()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    if request.method == "POST":
        existing_review = Review.query.filter_by(album_id=album_id, user_id=user_id).first()
        if existing_review:
            return jsonify({"error": "Ya has reseñado este álbum"}), 400
        try:
            new_review = Review(
                text=review_text,
                rating=rating,
                album_id=album_id,
                user_id=user_id
            )

            db.session.add(new_review)
            db.session.commit()

            return jsonify({"review": new_review.serialize()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@api.route("/profile", methods=["GET", "PUT"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if request.method == "PUT":
        data = request.get_json() or {}

        user.display_name = data.get(
            "display_name",
            user.display_name
        )
        user.description = data.get(
            "description",
            user.description
        )
        user.profile_image = data.get(
            "profile_image",
            user.profile_image
        )

        db.session.commit()

    return jsonify({"user": user.serialize()}), 200


@api.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({
            "error": "Username, email y password son obligatorios"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "La contraseña debe tener al menos 8 caracteres"
        }), 400

    existing_user = User.query.filter(
        (User.email == email) | (User.username == username)
    ).first()

    if existing_user:
        return jsonify({
            "error": "El correo o nombre de usuario ya está registrado"
        }), 409

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Cuenta creada correctamente",
        "user": new_user.serialize()
    }), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Correo y contraseña son obligatorios"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "error": "Correo o contraseña incorrectos"
        }), 401

    if not user.is_active:
        return jsonify({
            "error": "La cuenta está desactivada"
        }), 403

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Inicio de sesión correcto",
        "token": token,
        "user": user.serialize()
    }), 200


@api.route("/profile/image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    image = request.files.get("image")

    if not image or not image.filename:
        return jsonify({"error": "No se recibió una imagen"}), 400

    extension = image.filename.rsplit(".", 1)[-1].lower()
    allowed = {"jpg", "jpeg", "png", "webp"}

    if extension not in allowed:
        return jsonify({
            "error": "Formato no permitido"
        }), 400

    filename = secure_filename(
        f"{uuid.uuid4().hex}.{extension}"
    )

    upload_folder = os.path.join(
        current_app.static_folder,
        "uploads"
    )

    os.makedirs(upload_folder, exist_ok=True)
    image.save(os.path.join(upload_folder, filename))

    return jsonify({
        "image_path": f"/static/uploads/{filename}"
    }), 201


@api.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    data = request.get_json() or {}

    current_password = data.get("current_password")
    confirm_password = data.get("confirm_password")
    new_password = data.get("new_password")

    if not current_password or not confirm_password or not new_password:
        return jsonify({
            "error": "Todos los campos son obligatorios"
        }), 400

    if current_password != confirm_password:
        return jsonify({
            "error": "Las contraseñas actuales no coinciden"
        }), 400

    if not check_password_hash(
        user.password_hash,
        current_password
    ):
        return jsonify({
            "error": "La contraseña actual es incorrecta"
        }), 401

    if len(new_password) < 8:
        return jsonify({
            "error": "La nueva contraseña debe tener mínimo 8 caracteres"
        }), 400

    user.password_hash = generate_password_hash(new_password)

    db.session.commit()

    return jsonify({
        "message": "Contraseña actualizada correctamente"
    }), 200

@api.route("/favorites", methods=["GET"])
@jwt_required()
def get_favorites():

    user_id = int(get_jwt_identity())

    favorites = Favorite.query.filter_by(
        user_id=user_id
    ).all()

    return jsonify({
        "favorites": [
            favorite.serialize()
            for favorite in favorites
        ]
    }), 200

@api.route("/favorites", methods=["POST"])
@jwt_required()
def add_favorite():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    existing = Favorite.query.filter_by(
        user_id=user_id,
        album_id=data["album_id"]
    ).first()

    if existing:
        return jsonify({
            "message": "Ya está guardado"
        }), 200

    favorite = Favorite(
        user_id=user_id,
        album_id=data["album_id"],
        album_name=data["album_name"],
        artist=data["artist"],
        cover=data["cover"]
    )

    db.session.add(favorite)
    db.session.commit()

    return jsonify({
        "message": "Favorito guardado"
    }), 201


@api.route("/favorites/<path:album_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(album_id):

    user_id = int(get_jwt_identity())

    favorite = Favorite.query.filter_by(
        user_id=user_id,
        album_id=album_id
    ).first()

    if not favorite:
        return jsonify({
            "error": "Favorito no encontrado"
        }), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({
        "message": "Favorito eliminado"
    }), 200

@api.route("/reviews/recent", methods=["GET"])
def recent_reviews():

    reviews = (
        Review.query
        .order_by(Review.id.desc())
        .limit(6)
        .all()
    )

    reviews_data = []

    for review in reviews:

        album_id = review.album_id

        artist = None
        album = None

        if "/" in album_id:
            artist, album = album_id.split("/", 1)

        try:
            if artist and album:
                payload = _lastfm_request(
                    "album.getInfo",
                    artist=artist,
                    album=album,
                )
            else:
                payload = _lastfm_request(
                    "album.getInfo",
                    mbid=album_id,
                )

            album_info = _normalize_lastfm_album(
                payload.get("album", {})
            )

        except APIException:
            album_info = {}

        reviews_data.append({
            "id": review.id,
            "text": review.text,
            "rating": review.rating,
            "user": review.user.display_name or review.user.username,
            "album": album_info.get("name") or album,
            "artist": album_info.get("artist") or artist,
            "cover": album_info.get("cover"),
        })

    return jsonify({
        "reviews": reviews_data
    }), 200