from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, set_refresh_cookies, unset_jwt_cookies
from models import User
import logging
from datetime import timedelta
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

login_bp = Blueprint("login_bp", __name__)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)


@login_bp.route("/user/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        password = data.get("password")
        remember_me = data.get("rememberMe")
        expires = timedelta(days=30) if remember_me else timedelta(hours=6)

        if not data or not email or not password:
            logging.warning(f"Login attempt with missing credentials.")
            return jsonify({"msg": "Missing email or password"}), 400

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            access_token = create_access_token(identity=str(
                user.id), expires_delta=timedelta(minutes=15))
            refresh_token = create_refresh_token(
                identity=str(user.id), expires_delta=expires)
            logging.info(f"User logged in successfully: {email}")

            resp = jsonify({
                "access_token": access_token,
                "user": user.serialize(),
                "msg": "Login successful"
            })

            set_refresh_cookies(resp, refresh_token)

            return resp, 200
        else:
            logging.warning(f"Failed login attempt for email: {email}.")
            return jsonify({"msg": "Invalid credentials. Please verify your email and password."}), 401
    except Exception as e:
        logging.error(f"Database error during login: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@login_bp.route("/user/logout", methods=["POST"])
def logout():
    try:
        logging.info("User logged out successfully.")
        resp = jsonify({"msg": "Logout successful"})
        unset_jwt_cookies(resp)
        return resp, 200
    except Exception as e:
        logging.error(f"Error during logout: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
