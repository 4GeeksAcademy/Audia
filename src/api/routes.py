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
import os
import uuid
from werkzeug.utils import secure_filename


api = Blueprint('api', __name__)



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