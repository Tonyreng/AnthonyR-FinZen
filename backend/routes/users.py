from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """
    Obtener lista de todos los usuarios (solo para usuarios autenticados)
    """
    users = User.query.all()
    return jsonify({
        "users": [user.serialize() for user in users]
    }), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Obtener un usuario específico por ID
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    return jsonify({"user": user.serialize()}), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Actualizar un usuario específico
    """
    current_user_id = get_jwt_identity()
    
    # Solo permitir que los usuarios actualicen su propio perfil
    if current_user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Actualizar campos permitidos
    data = request.get_json()
    if 'email' in data:
        # Verificar que el email no esté en uso por otro usuario
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({"msg": "Email already in use"}), 400
        user.email = data['email']
    
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    # TODO: Implementar actualización de password con hash
    if 'password' in data:
        user.password = data['password']  # En producción usar hash
    
    db.session.commit()
    return jsonify({"user": user.serialize()}), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Eliminar un usuario específico
    """
    current_user_id = get_jwt_identity()
    
    # Solo permitir que los usuarios eliminen su propio perfil
    if current_user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "User deleted successfully"}), 200
