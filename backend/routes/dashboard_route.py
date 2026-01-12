from datetime import datetime, timedelta, timezone
import logging
from models import Account, Transaction, Category, Subscription, CategoryType
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from database import db

dashboard_bp = Blueprint("dashboard_bp", __name__)

@dashboard_bp.route("/user/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_summary():
    try:
        user_id = int(get_jwt_identity())
        
        now = datetime.now(timezone.utc)
        start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_month = now

        total_balance = (
            db.session.query(func.coalesce(func.sum(Account.balance), 0))
            .filter(Account.user_id == user_id)
            .scalar()
        )

        income_month =(
            db.session.query(func.coalesce(func.sum(Transaction.amount), 0))
            .join(Category)
            .filter(
                Transaction.user_id == user_id,
                Category.type == CategoryType.income,
                Transaction.date >= start_month,
                Transaction.date <= end_month
            )
            .scalar()
        )

        expense_month = (
            db.session.query(func.coalesce(func.sum(Transaction.amount), 0))
            .join(Category)
            .filter(
                Transaction.user_id == user_id,
                Category.type == CategoryType.expense,
                Transaction.date >= start_month,
                Transaction.date <= end_month
            )
            .scalar()
        )

        upcoming_limit = now + timedelta(days=30)

        upcoming_subscriptions = (
            Subscription.query
            .filter(
                Subscription.user_id == user_id,
                Subscription.is_active == True,
                Subscription.payment_date <= upcoming_limit
            )
            .order_by(Subscription.payment_date.asc())
            .limit(5)
            .all()
        )
        logging.info(f"Dashboard summary fetched for user : {user_id}")

        return jsonify({
            "total_balance": str(total_balance),
            "income_month": str(income_month),
            "expense_month": str(expense_month),
            "upcoming_payments": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "price": str(sub.price),
                    "payment_date": sub.payment_date.isoformat()
                }
                for sub in upcoming_subscriptions
            ]
        }), 200
    except Exception as e:
        logging.error(f"Error fetching dashboard summary: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
