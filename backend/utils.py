from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def hash_password(password):
    """
    Hashea una contraseña usando Werkzeug
    """
    return generate_password_hash(password)

def check_password(password_hash, password):
    """
    Verifica una contraseña contra su hash
    """
    return check_password_hash(password_hash, password)

def admin_required(f):
    """
    Decorator para rutas que requieren permisos de administrador
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({"msg": "Admin access required"}), 403
        
        # TODO: Implementar campo is_admin en el modelo User
        # if not user.is_admin:
        #     return jsonify({"msg": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """
    Validar formato de email básico
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """
    Validar que la contraseña cumpla requisitos mínimos
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    return True, "Password is valid"