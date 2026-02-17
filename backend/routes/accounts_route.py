import logging
from decimal import Decimal, InvalidOperation
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import db
from models import Account, AccountType

accounts_bp = Blueprint("accounts_bp", __name__)


@accounts_bp.route("/user/accounts", methods=["GET"])
@jwt_required()
def get_user_accounts():
    try:
        user_id = int(get_jwt_identity())

        accounts = (
            Account.query
            .filter(Account.user_id == user_id)
            .order_by(Account.created_at.desc())
            .all()
        )
        logging.info(f"Fetched {len(accounts)} accounts for user : {user_id}")

        return jsonify({
            "accounts": [account.serialize() for account in accounts]
        }), 200
    except Exception as e:
        logging.error(f"Error fetching accounts: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@accounts_bp.route("/user/accounts", methods=["POST"])
@jwt_required()
def create_account():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        name = str(data.get("name", "")).strip()
        type_value = str(data.get("type", "")).strip().lower()
        balance_raw = data.get("balance", "0")

        if not name:
            return jsonify({"msg": "Account name is required"}), 400

        try:
            account_type = AccountType(type_value)
        except ValueError:
            return jsonify({"msg": "Invalid account type"}), 400

        try:
            balance = Decimal(str(balance_raw))
        except (InvalidOperation, TypeError, ValueError):
            return jsonify({"msg": "Invalid balance value"}), 400

        if balance < 0:
            return jsonify({"msg": "Balance must be non-negative"}), 400

        account = Account(
            user_id=user_id,
            name=name,
            type=account_type,
            balance=balance,
        )

        db.session.add(account)
        db.session.commit()
        logging.info(
            f"Creating account for user : {user_id} with data: {data}")

        return jsonify({
            "msg": "Account created successfully",
            "account": account.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating account: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
