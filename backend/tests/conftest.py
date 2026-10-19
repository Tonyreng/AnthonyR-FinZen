import os
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('FLASK_DEBUG', '1')
os.environ.setdefault('DATABASE_URL', 'sqlite:///:memory:')
os.environ.setdefault('JWT_SECRET_KEY', 'test-only-secret')
os.environ.setdefault('JWT_COOKIE_SECURE', 'false')
os.environ.setdefault('JWT_COOKIE_CSRF_PROTECT', 'true')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:3000')

from app import app as flask_app  # noqa: E402


def pytest_configure():
    flask_app.config.update(TESTING=True)
