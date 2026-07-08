"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User
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


api = Blueprint('api', __name__)

RECCOBEATS_BASE_URL = os.getenv(
    "RECCOBEATS_API_URL", "https://api.reccobeats.com/v1/album")


def _reccobeats_request(path, params=None):
    params = params or {}
    query_string = urlencode(params, doseq=True)
    url = f"{RECCOBEATS_BASE_URL}{path}"
    if query_string:
        url = f"{url}?{query_string}"
    print(f"Making request to ReccoBeats URL: {url}")

    request_obj = Request(url, headers={"Accept": "application/json"})

    try:
        with urlopen(request_obj, timeout=15) as response:
            payload = response.read().decode("utf-8")
            return json.loads(payload)
    except HTTPError as exc:
        body = exc.read().decode("utf-8", "ignore")
        try:
            details = json.loads(body)
            message = details.get("message") or details.get("error") or body
        except Exception:
            message = body or "ReccoBeats devolvió un error"
        raise APIException(message=message, status_code=exc.code)
    except URLError as exc:
        raise APIException(
            message="No se pudo conectar con ReccoBeats", status_code=502)


def _normalize_reccobeats_item(item, item_type):
    if not isinstance(item, dict):
        return None

    item_id = item.get("id") or item.get("album_id") or item.get("artist_id")
    name = item.get("name") or item.get("title") or item.get("full_name")

    if item_type == "album":
        artists = item.get("artists") or []
        artist_names = []
        for artist in artists:
            if isinstance(artist, dict):
                artist_names.append(artist.get(
                    "name") or artist.get("title") or "")
            elif isinstance(artist, str):
                artist_names.append(artist)
        return {
            "id": item_id,
            "name": name or item.get("title"),
            "type": "album",
            "cover": item.get("cover") or item.get("cover_image") or item.get("image"),
            "artists": artist_names,
            "artist": ", ".join([artist for artist in artist_names if artist]),
            "year": item.get("year") or item.get("release_date"),
        }

    if item_type == "artist":
        return {
            "id": item_id,
            "name": name,
            "type": "artist",
            "image": item.get("image") or item.get("cover") or item.get("avatar"),
            "genres": item.get("genres") or [],
        }

    return {
        "id": item_id,
        "name": name,
        "type": item.get("type") or item_type,
        "image": item.get("image") or item.get("cover"),
    }


def _normalize_reccobeats_results(payload):
    if not isinstance(payload, dict):
        return []

    candidates = payload.get("results") or payload.get(
        "albums") or payload.get("artists") or payload.get("items") or []

    if isinstance(candidates, dict):
        candidates = candidates.get("items") or candidates.get("results") or []

    if not isinstance(candidates, list):
        return []

    normalized = []
    for item in candidates:
        if isinstance(item, dict):
            item_type = item.get("type")
            if item_type == "artist":
                normalized.append(_normalize_reccobeats_item(item, "artist"))
            elif item_type == "album":
                normalized.append(_normalize_reccobeats_item(item, "album"))
            else:
                inferred_type = "album" if item.get(
                    "artists") or item.get("track_count") else "artist"
                normalized.append(
                    _normalize_reccobeats_item(item, inferred_type))
    return [item for item in normalized if item is not None]


@api.route("/reccobeats/search", methods=["GET"])
def reccobeats_search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "El parámetro query es obligatorio"}), 400

    result_type = request.args.get("type", "all").lower()
    last_error = None
    payload = None

    candidates = []
    if result_type in {"all", "both"}:
        candidates = [
            ("/search", {"q": query, "type": "all"}),
            ("/search", {"query": query, "type": "all"}),
        ]
    elif result_type == "album":
        candidates = [
            ("/search/albums", {"q": query}),
            ("/search", {"q": query, "type": "album"}),
        ]
    elif result_type == "artist":
        candidates = [
            ("/search/artists", {"q": query}),
            ("/search", {"q": query, "type": "artist"}),
        ]
    else:
        return jsonify({"error": "El parámetro type debe ser all, album o artist"}), 400

    for path, params in candidates:
        try:
            print(f"Trying ReccoBeats path: {path} with params: {params}")
            payload = _reccobeats_request(path, params)
            print(f"Received payload: {payload}")
            break
        except APIException as exc:
            last_error = exc

    if payload is None:
        if last_error is not None:
            return jsonify({"error": str(last_error)}), getattr(last_error, "status_code", 502)
        return jsonify({"error": "No se pudo completar la búsqueda en ReccoBeats"}), 502

    return jsonify({
        "query": query,
        "type": result_type,
        "results": _normalize_reccobeats_results(payload),
        "source": "reccobeats",
    }), 200


def _reccobeats_item_detail(item_type, item_id):
    item_type = (item_type or "").lower()
    if item_type not in {"album", "artist"}:
        return jsonify({"error": "El tipo debe ser album o artist"}), 400

    payload = None
    last_error = None
    candidates = [f"/album/{item_id}", f"/albums/{item_id}"] if item_type == "album" else [
        f"/artist/{item_id}", f"/artists/{item_id}"]

    for path in candidates:
        try:
            payload = _reccobeats_request(path)
            break
        except APIException as exc:
            last_error = exc

    if payload is None:
        if last_error is not None:
            return jsonify({"error": str(last_error)}), getattr(last_error, "status_code", 502)
        return jsonify({"error": f"No se pudo obtener el {item_type}"}), 502

    normalized_item = _normalize_reccobeats_item(
        payload if isinstance(payload, dict) else {}, item_type)
    return jsonify({item_type: normalized_item}), 200


@api.route("/reccobeats/album/<album_id>", methods=["GET"])
def reccobeats_album_detail(album_id):
    return _reccobeats_item_detail("album", album_id)


@api.route("/reccobeats/artist/<artist_id>", methods=["GET"])
def reccobeats_artist_detail(artist_id):
    return _reccobeats_item_detail("artist", artist_id)


@api.route("/reccobeats/item/<item_type>/<item_id>", methods=["GET"])
def reccobeats_item_detail(item_type, item_id):
    return _reccobeats_item_detail(item_type, item_id)


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
