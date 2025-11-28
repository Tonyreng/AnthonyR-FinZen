"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from routes import register_routes
from database import db
from models import *
from admin import setup_admin
import logging
from logging.handlers import RotatingFileHandler
import os


# Load environment variables
load_dotenv()

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
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
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
app.config['JWT_COOKIE_SECURE'] = False  # True en producción con HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Activar en producción
app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
jwt = JWTManager(app)

# Enable CORS with credentials support
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:3000'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Setup admin
setup_admin(app)

# Register Blueprints
register_routes(app)

# Initialize rate limiter (after registering blueprints)
from routes.user_routes import limiter
limiter.init_app(app)  

# Basic route for testing
@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "Backend is running"})

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
    PORT = int(os.environ.get('PORT', 5000))
    app.run(host='127.0.0.1', port=PORT, debug=False)