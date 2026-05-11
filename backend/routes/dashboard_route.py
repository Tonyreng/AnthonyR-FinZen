from datetime import datetime, timedelta, timezone
import logging
from models import Account, Transaction, Category, Subscription, CategoryType, TransactionType
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, select
from database import db
import locale

dashboard_bp = Blueprint("dashboard_bp", __name__)


def safe_division(numerator, denominator):
    if not denominator:
        return 0
    return numerator / denominator


@dashboard_bp.route("/user/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_summary():
    try:
        user_id = int(get_jwt_identity())

        now = datetime.now(timezone.utc)
        start_month = now.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0)
        end_month = now

        total_balance = (
            db.session.query(func.coalesce(func.sum(Account.balance), 0))
            .filter(Account.user_id == user_id)
            .scalar()
        )

        income_month = (
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

        # ── Fechas ─────────────────────────────────────────────
        start_prev_month = (start_month - timedelta(days=1)).replace(day=1)
        days_elapsed = now.day
        end_prev_month_partial = start_prev_month + \
            timedelta(days=days_elapsed - 1)

        end_prev_month_full = start_month - timedelta(days=1)
        start_prev2_full = (start_prev_month -
                            timedelta(days=1)).replace(day=1)
        end_prev2_full = start_prev_month - timedelta(days=1)
        # ── Helpers ────────────────────────────────────────────

        def get_totals(start, end=None):
            q = (
                db.session.query(
                    func.coalesce(func.sum(Transaction.amount),
                                  0).label("total")
                )
                .join(Category, Transaction.category_id == Category.id)
                .filter(Transaction.user_id == user_id)
            )
            if start:
                q = q.filter(Transaction.date >= start)
            if end:
                q = q.filter(Transaction.date <= end)
            return float(q.scalar() or 0)

        def get_income_expense(start, end=None):
            income = (
                db.session.query(func.coalesce(
                    func.sum(Transaction.amount), 0))
                .join(Category)
                .filter(
                    Transaction.user_id == user_id,
                    Category.type == CategoryType.income,
                    Transaction.date >= start
                )
            )
            expense = (
                db.session.query(func.coalesce(
                    func.sum(Transaction.amount), 0))
                .join(Category)
                .filter(
                    Transaction.user_id == user_id,
                    Category.type == CategoryType.expense,
                    Transaction.date >= start
                )
            )
            if end:
                income = income.filter(Transaction.date <= end)
                expense = expense.filter(Transaction.date <= end)

            return float(income.scalar() or 0), float(expense.scalar() or 0)

        def get_subscription_expense(start, end=None):
            q = (
                db.session.query(func.coalesce(
                    func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.subscription,
                    Transaction.date >= start
                )
            )
            if end:
                q = q.filter(Transaction.date <= end)
            return float(q.scalar() or 0)

        def get_top_category(start, end=None):
            q = (
                db.session.query(
                    Category.name,
                    func.sum(Transaction.amount).label("total")
                )
                .join(Category)
                .filter(
                    Transaction.user_id == user_id,
                    Category.type == CategoryType.expense,
                    Transaction.date >= start
                )
                .group_by(Category.name)
                .order_by(func.sum(Transaction.amount).desc())
            )
            if end:
                q = q.filter(Transaction.date <= end)
            return q.first()

        # ── Métricas ───────────────────────────────────────────
        inc_now, exp_now = get_income_expense(start_month)
        inc_prev_part, exp_prev_part = get_income_expense(
            start_prev_month, end_prev_month_partial)
        inc_prev, exp_prev = get_income_expense(
            start_prev_month, end_prev_month_full)
        inc_prev2, exp_prev2 = get_income_expense(
            start_prev2_full, end_prev2_full)

        net_now = inc_now - exp_now
        net_prev = inc_prev - exp_prev
        porc_exp_now = safe_division(exp_now, inc_now)
        porc_exp_prev_month_part = safe_division(exp_prev_part, inc_prev_part)
        porc_exp_prev_month_full = safe_division(exp_prev, inc_prev)
        porc_exp_prev_month_full2 = safe_division(exp_prev2, inc_prev2)

        savings_rate = (net_prev / inc_prev) if inc_prev else 0

        sub_prev = get_subscription_expense(
            start_prev_month, end_prev_month_full)

        sub_ratio = (sub_prev / exp_prev) if exp_prev else 0

        top_cat = get_top_category(start_prev_month, end_prev_month_full)
        top_cat_ratio = (float(top_cat.total) /
                         exp_prev) if top_cat and exp_prev else 0

        # ── Reglas ─────────────────────────────────────────────
        score = 0
        alerts = []
        recommendations = []
        net_now_formatted = f"{net_now:,.2f}"
        net_now_formatted = (
            net_now_formatted.replace(",", "X").replace(
                ".", ",").replace("X", ".")
        )

        has_current_income_basis = inc_now > 0
        has_partial_previous_income_basis = inc_prev_part > 0
        has_previous_income_basis = inc_prev > 0
        has_previous2_income_basis = inc_prev2 > 0
        has_spending_trend_basis = (
            has_current_income_basis and
            has_partial_previous_income_basis and
            has_previous_income_basis and
            has_previous2_income_basis
        )

        if has_spending_trend_basis:
            if porc_exp_now > porc_exp_prev_month_part and porc_exp_prev_month_full > porc_exp_prev_month_full2:
                score += 35
                alerts.append(
                    "Your spending trend, percentage-wise, has been increasing over the last 3 months.")
            elif porc_exp_now > porc_exp_prev_month_part:
                score += 30
                alerts.append(
                    "This month, percentage-wise, you are spending more money than last month.")
            else:
                alerts.append(
                    f"You are managing your money well month after month, your net balance is {net_now_formatted}")
                recommendations.append(
                    "Keep tracking your expenses and try to maintain or increase your net balance.")

            if savings_rate < 0:
                score += 20
                alerts.append("You are spending more than you earn.")
                recommendations.append("Reduce expenses or increase income.")
            elif savings_rate < 0.10:
                score += 10
                alerts.append(
                    f"Your savings rate is low, you are saving {round(savings_rate * 100, 2)}% of your income.")
                recommendations.append("Aim to save at least 15%.")
            elif savings_rate < 0.20:
                score += 5
                alerts.append(
                    f"Your savings rate is acceptable; you are saving {round(savings_rate * 100, 2)}% of your income.")
                recommendations.append("Ideally, you should always save 20%.")
            else:
                alerts.append(
                    f"Your savings rate is excellent; you are saving {round(savings_rate * 100, 2)}% of your income.")
                recommendations.append("Keep up the good work saving money.")

            if sub_ratio > 0.25:
                score += 15
                alerts.append(
                    "Your subscriptions make up a large portion of your expenses.")
                recommendations.append("Cancel non-essential subscriptions.")
            alerts.append(
                "Your subscription expenses are under control compared to your total expenses.")
            recommendations.append(
                "Review your subscriptions regularly to ensure they still provide value.")

            if top_cat_ratio > 0.4:
                score += 10
                alerts.append(
                    f"High concentration of spending in {top_cat.name}.")
                recommendations.append(
                    f"Consider reducing expenses in {top_cat.name}.")

        elif not has_spending_trend_basis:
            logging.info(
                "Skipping spending trend comparison for user %s due to missing income basis: "
                "inc_now=%s inc_prev_part=%s inc_prev=%s inc_prev2=%s",
                user_id,
                inc_now,
                inc_prev_part,
                inc_prev,
                inc_prev2,
            )

        # ── Clasificación ─────────────────────────────────────
        if score >= 61:
            status = "critical"
        elif score >= 31:
            status = "warning"
        else:
            status = "healthy"

        ai_recomendations_data = {
            "health_score": score,
            "status": status,
            "alerts": alerts,
            "recommendations": recommendations
        }

        logging.info(
            "Dashboard summary fetched for user %s with balances: inc_now=%s exp_now=%s inc_prev=%s exp_prev=%s",
            user_id,
            inc_now,
            exp_now,
            inc_prev,
            exp_prev,
        )

        return jsonify({
            "total_balance": str(total_balance),
            "income_month": str(income_month),
            "income_trend": income_trend_data,
            "expense_month": str(expense_month),
            "expense_trend": expense_trend_data,
            "upcoming_payments": upcoming_subscriptions_data,
            "ai_recommendations": ai_recomendations_data
        }), 200
    except Exception as e:
        logging.exception(f"Error fetching dashboard summary: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500
