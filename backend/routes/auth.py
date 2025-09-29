from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint para autenticación de usuarios
    """
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400
    
    # TODO: Implementar verificación de password hasheada
    user = User.query.filter_by(email=email).first()
    
    if user and user.password == password:  # En producción usar hash
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "access_token": access_token,
            "user": user.serialize()
        }), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Endpoint para registro de nuevos usuarios
    """
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400
    
    # Verificar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400
    
    # TODO: Hashear password antes de guardar
    user = User(email=email, password=password, is_active=True)
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "access_token": access_token,
        "user": user.serialize()
    }), 201

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """
    Endpoint para obtener perfil del usuario autenticado
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    return jsonify({"user": user.serialize()}), 200
