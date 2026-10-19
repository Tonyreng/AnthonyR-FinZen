"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import logging
import os
from logging.handlers import RotatingFileHandler

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended import get_jwt_identity as get_jwt_id
from flask_jwt_extended import jwt_required as jwt_req
from flask_migrate import Migrate
from sqlalchemy import text

from admin import setup_admin
from commands import setup_commands
from database import db
from models import *
from routes import register_routes
from routes.login_route import limiter


# Load environment variables from the project root first.
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
load_dotenv()


def get_bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def get_list_env(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(',') if item.strip()]

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(BASE_DIR, '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False


# Crear carpeta de logs si no existe
if not os.path.exists("logs"):
    os.makedirs("logs")

# Configurar formato de log
formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    "%Y-%m-%d %H:%M:%S"
)

# Archivo de log (rotativo para evitar que crezca demasiado)
file_handler = RotatingFileHandler(
    "logs/app.log", maxBytes=2_000_000, backupCount=5
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Log en consola (útil para Docker)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# Agregar ambos handlers al logger principal de Flask
app.logger.addHandler(file_handler)
app.logger.addHandler(console_handler)
app.logger.setLevel(logging.INFO)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# JWT Configuration
jwt_secret_key = os.getenv('JWT_SECRET_KEY')

if not jwt_secret_key:
    if ENV == 'production':
        raise RuntimeError('JWT_SECRET_KEY is required in production')
    jwt_secret_key = 'dev-only-secret-key'

app.config['JWT_SECRET_KEY'] = jwt_secret_key
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']  # Headers first
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_COOKIE_SECURE'] = get_bool_env(
    'JWT_COOKIE_SECURE', ENV == 'production')
app.config['JWT_COOKIE_CSRF_PROTECT'] = get_bool_env(
    'JWT_COOKIE_CSRF_PROTECT', ENV == 'production')
app.config['JWT_COOKIE_SAMESITE'] = os.getenv('JWT_COOKIE_SAMESITE', 'Lax')
jwt = JWTManager(app)


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    app.logger.warning(f"Token expired for payload: {jwt_payload}")
    return jsonify({
        "msg": "Token has expired"
    }), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    app.logger.warning(f"Invalid token error: {error}")
    return jsonify({
        "msg": "Invalid token"
    }), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    app.logger.warning(f"Missing/unauthorized token error: {error}")
    return jsonify({
        "msg": "Missing token"
    }), 401


# Enable CORS with credentials support
default_cors_origins = 'http://localhost:3000,http://localhost:5173' \
    if ENV == 'development' else ''
cors_origins = get_list_env('CORS_ORIGINS', default_cors_origins)

if not cors_origins and ENV == 'production':
    raise RuntimeError('CORS_ORIGINS is required in production')

CORS(app,
     supports_credentials=True,
     origins=cors_origins,
     allow_headers=['Content-Type', 'Authorization', 'X-CSRF-TOKEN'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Setup admin only when explicitly enabled.
if get_bool_env('ENABLE_ADMIN', False):
    setup_admin(app, ENV)

# Setup CLI commands
setup_commands(app)

# Register Blueprints
register_routes(app)

# Initialize rate limiter (after registering blueprints)
limiter.init_app(app)

# Basic route for testing


@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Backend is running"})


@app.route('/api/ready')
def ready():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "ready", "database": "ok"}), 200
    except Exception as error:
        db.session.rollback()
        app.logger.error("Readiness check failed: %s", error)
        return jsonify({"status": "not_ready", "database": "error"}), 503

if get_bool_env('ENABLE_DEBUG_ROUTES', False):
    # Debug endpoints for local JWT troubleshooting only.
    @app.route('/api/debug/token')
    def debug_token():
        auth_header = request.headers.get('Authorization', 'NONE')
        return jsonify({
            "auth_header": auth_header[:80] if auth_header else 'NONE',
            "all_headers": dict(request.headers)
        })

    @app.route('/api/debug/protected')
    @jwt_req()
    def debug_protected():
        user_id = get_jwt_id()
        return jsonify({"user_id": user_id, "msg": "JWT is valid!"})

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return jsonify({"message": "Flask API is running in development mode"})
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5001))
    app.run(host='127.0.0.1', port=PORT, debug=False)
