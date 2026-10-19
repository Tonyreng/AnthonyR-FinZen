"""Interactive development-only user creation utility."""

import argparse
from getpass import getpass

from app import app
from database import db
from models import User
from utils import validate_email, validate_password


def parse_args():
    parser = argparse.ArgumentParser(
        description="Create a FinZen user without embedding credentials in source."
    )
    parser.add_argument("--email", required=True)
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--currency", default="USD")
    return parser.parse_args()


def main():
    args = parse_args()
    email = args.email.strip().lower()
    currency = args.currency.strip().upper()

    if not validate_email(email):
        raise SystemExit("Invalid email address.")
    if len(currency) != 3:
        raise SystemExit("Currency must use a three-letter code.")

    password = getpass("Password: ")
    is_valid, message = validate_password(password)
    if not is_valid:
        raise SystemExit(message)

    with app.app_context():
        if User.query.filter_by(email=email).first():
            raise SystemExit("A user with this email already exists.")

        user = User(
            full_name=args.full_name.strip(),
            email=email,
            currency=currency,
        )
        user.set_password_hash(password)
        db.session.add(user)
        db.session.commit()
        print(f"Created user with id {user.id}.")


if __name__ == "__main__":
    main()
