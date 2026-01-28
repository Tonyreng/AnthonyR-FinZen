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

        
        start_date = (now.replace(day=1) - timedelta(days=150)).replace(day=1)


        income_trend = (
            db.session.query(
                func.date_trunc('month', Transaction.date).label('month'),
                func.coalesce(func.sum(Transaction.amount), 0).label('total')
            )
            .join(Category, Transaction.category_id == Category.id)
            .filter(
                Transaction.user_id == user_id,
                Category.type == CategoryType.income,
                Transaction.date >= start_date
            )
            .group_by('month')
            .order_by('month')
            .all()
        )

        income_trend_data = [
            {
                "month": row.month.strftime("%b"),
                "total": str(row.total)
            }
            for row in income_trend
        ]

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

        expense_trend = (
            db.session.query(
                func.date_trunc('month', Transaction.date).label('month'),
                func.coalesce(func.sum(Transaction.amount), 0).label('total')
            )
            .join(Category, Transaction.category_id == Category.id)
            .filter(
                Transaction.user_id == user_id,
                Category.type == CategoryType.expense,
                Transaction.date >= start_date
            )
            .group_by('month')
            .order_by('month')
            .all()
        )

        expense_trend_data = [
            {
                "month": row.month.strftime("%b"),
                "total": str(row.total)
            }
            for row in expense_trend
        ]

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

        upcoming_subscriptions_data = [
            {
                "id": sub.id,
                "name": sub.name,
                "price": str(sub.price),
                "payment_date": sub.payment_date.isoformat()
            }
            for sub in upcoming_subscriptions
        ]

        logging.info(f"Dashboard summary fetched for user : {user_id}")

        return jsonify({
            "total_balance": str(total_balance),
            "income_month": str(income_month),
            "income_trend": income_trend_data,
            "expense_month": str(expense_month),
            "expense_trend": expense_trend_data,
            "upcoming_payments": upcoming_subscriptions_data
        }), 200
    except Exception as e:
        logging.error(f"Error fetching dashboard summary: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
