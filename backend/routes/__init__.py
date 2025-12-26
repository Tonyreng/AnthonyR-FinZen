# Routes package
from .login_route import login_bp
from .refresh_route import refresh_bp


def register_routes(app):
    app.register_blueprint(login_bp, url_prefix='/api')
    app.register_blueprint(refresh_bp, url_prefix='/api')