from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import logging

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from database import db
from models import (
    Account,
    Category,
    CategoryType,
    Transaction,
    TransactionType,
)


transactions_bp = Blueprint("transactions_bp", __name__)


@transactions_bp.route("/user/categories", methods=["GET"])
@jwt_required()
def get_user_categories():
    try:
        user_id = int(get_jwt_identity())

        categories = (
            Category.query
            .filter(Category.user_id == user_id)
            .order_by(Category.type.asc(), Category.name.asc())
            .all()
        )

        return jsonify({
            "categories": [category.serialize() for category in categories]
        }), 200
    except Exception as e:
        logging.error(f"Error fetching categories: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@transactions_bp.route("/user/transactions", methods=["GET"])
@jwt_required()
def get_user_transactions():
    try:
        user_id = int(get_jwt_identity())

        search = str(request.args.get("search", "")).strip()
        category_id = request.args.get("category_id")
        date_value = str(request.args.get("date", "")).strip()
        type_value = str(request.args.get("type", "")).strip().lower()

        query = (
            Transaction.query
            .join(Category, Transaction.category_id == Category.id)
            .filter(Transaction.user_id == user_id)
        )

        if search:
            query = query.filter(Transaction.description.ilike(f"%{search}%"))

        if category_id:
            try:
                parsed_category_id = int(category_id)
                query = query.filter(
                    Transaction.category_id == parsed_category_id)
            except ValueError:
                return jsonify({"msg": "Invalid category filter"}), 400

        if date_value:
            try:
                parsed_date = datetime.strptime(date_value, "%Y-%m-%d").date()
                query = query.filter(
                    func.date(Transaction.date) == parsed_date)
            except ValueError:
                return jsonify({"msg": "Invalid date filter"}), 400

        if type_value:
            if type_value not in (CategoryType.income.value, CategoryType.expense.value):
                return jsonify({"msg": "Invalid type filter"}), 400
            query = query.filter(Category.type == CategoryType(type_value))

        transactions = (
            query
            .order_by(Transaction.date.desc(), Transaction.id.desc())
            .all()
        )

        return jsonify({
            "transactions": [transaction.serialize(large=True) for transaction in transactions]
        }), 200
    except Exception as e:
        logging.error(f"Error fetching transactions: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@transactions_bp.route("/user/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        amount_raw = data.get("amount")
        description = str(data.get("description", "")).strip() or None
        date_raw = str(data.get("date", "")).strip()
        payload_type = str(data.get("category_type", "")).strip().lower()

        category_id = data.get("category_id")
        account_id = data.get("account_id")

        if category_id is None:
            return jsonify({"msg": "Category is required"}), 400

        try:
            category_id = int(category_id)
        except (TypeError, ValueError):
            return jsonify({"msg": "Invalid category"}), 400

        category = Category.query.filter(
            Category.id == category_id,
            Category.user_id == user_id,
        ).first()

        if not category:
            return jsonify({"msg": "Category not found"}), 404

        if payload_type and payload_type in (CategoryType.income.value, CategoryType.expense.value):
            if category.type.value != payload_type:
                return jsonify({"msg": "Category type does not match"}), 400

        # Si trae account_id, se valida que exista y pertenezca al usuario. Si no trae account_id, se asigna la primera cuenta del usuario (si existe).
        # Cambiar más adelante para que el usuario siempre tenga una cuenta por defecto(favorita) y no tener que lidiar con este caso.
        if account_id is None:
            account = (
                Account.query
                .filter(Account.user_id == user_id)
                .order_by(Account.created_at.asc())
                .with_for_update()
                .first()
            )
        else:
            try:
                parsed_account_id = int(account_id)
            except (TypeError, ValueError):
                return jsonify({"msg": "Invalid account"}), 400

            account = Account.query.filter(
                Account.id == parsed_account_id,
                Account.user_id == user_id,
            ).with_for_update().first()

        if not account:
            return jsonify({"msg": "Account not found"}), 404

        try:
            amount = Decimal(str(amount_raw))
        except (InvalidOperation, TypeError, ValueError):
            return jsonify({"msg": "Invalid amount"}), 400

        if amount <= 0:
            return jsonify({"msg": "Amount must be greater than zero"}), 400

        if date_raw:
            try:
                parsed_date = datetime.strptime(date_raw, "%Y-%m-%d")
                transaction_date = parsed_date.replace(tzinfo=timezone.utc)
            except ValueError:
                return jsonify({"msg": "Invalid date format"}), 400
        else:
            transaction_date = datetime.now(timezone.utc)

        if category.type == CategoryType.expense and account.balance < amount:
            return jsonify({"msg": "Insufficient account balance"}), 400

        transaction = Transaction(
            account_id=account.id,
            user_id=user_id,
            category_id=category.id,
            type=TransactionType.general,
            amount=amount,
            description=description,
            date=transaction_date,
            is_recurring=False,
        )

        if category.type == CategoryType.income:
            account.balance = account.balance + amount
        else:
            account.balance = account.balance - amount

        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            "msg": "Transaction created successfully",
            "transaction": transaction.serialize(large=True),
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating transaction: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
