import os
from hmac import compare_digest

from flask import Response, request
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from models import Account, Category, Debt, Installment, InstallmentTransaction, LoanGiven, Reminder, Report, Subscription, Transaction, db, User


class SecureModelView(ModelView):
    def is_accessible(self):
        auth = request.authorization
        admin_username = os.getenv('ADMIN_USERNAME')
        admin_password = os.getenv('ADMIN_PASSWORD')

        if not auth or not admin_username or not admin_password:
            return False

        return compare_digest(auth.username, admin_username) and compare_digest(
            auth.password,
            admin_password,
        )

    def inaccessible_callback(self, name, **kwargs):
        return Response(
            'Authentication required',
            401,
            {'WWW-Authenticate': 'Basic realm="FinZen Admin"'},
        )


def setup_admin(app, env='production'):
    flask_app_key = os.getenv('FLASK_APP_KEY')

    if not flask_app_key:
        if env == 'production':
            raise RuntimeError(
                'FLASK_APP_KEY is required when admin is enabled in production'
            )
        flask_app_key = 'dev-only-flask-app-key'

    if env == 'production' and (not os.getenv('ADMIN_USERNAME') or not os.getenv('ADMIN_PASSWORD')):
        raise RuntimeError(
            'ADMIN_USERNAME and ADMIN_PASSWORD are required when admin is enabled in production'
        )

    app.secret_key = flask_app_key
    app.config['FLASK_ADMIN_SWATCH'] = 'darkly'
    admin = Admin(app, name='FinZen Admin', template_mode='bootstrap4')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(SecureModelView(User, db.session))
    admin.add_view(SecureModelView(Account, db.session))
    admin.add_view(SecureModelView(Transaction, db.session))
    admin.add_view(SecureModelView(Category, db.session))
    admin.add_view(SecureModelView(Subscription, db.session))
    admin.add_view(SecureModelView(LoanGiven, db.session))
    admin.add_view(SecureModelView(Debt, db.session))
    admin.add_view(SecureModelView(Installment, db.session))
    admin.add_view(SecureModelView(InstallmentTransaction, db.session))
    admin.add_view(SecureModelView(Reminder, db.session))
    admin.add_view(SecureModelView(Report, db.session))

    # You can duplicate that line to add new models
    # admin.add_view(ModelView(YourModelName, db.session))
