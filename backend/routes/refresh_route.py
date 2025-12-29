from flask import Blueprint, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import logging
from datetime import timedelta


refresh_bp = Blueprint("refresh_bp", __name__)



@refresh_bp.route("/user/refresh_token", methods=["POST"])
@jwt_required(refresh=True)
def refresh_access_token():
    try:
        user_id = get_jwt_identity()

        new_access_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(minutes=15)
        )
        
        logging.info(f"Access token refreshed for user : {user_id}")

        return jsonify({
            "msg": "Access token refreshed",
            "access_token": new_access_token
        }), 200

    except Exception as e:
        logging.error(f"Error refreshing token: {str(e)}")
        return jsonify({"msg": "Failed to refresh token"}), 401