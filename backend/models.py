
from datetime import datetime, timezone
import enum
from sqlalchemy import ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from database import db

class AccountType(enum.Enum):
    bank = "bank"
    cash = "cash"
    credit_card = "credit_card"
    savings = "savings"
    virtual_wallet = "virtual_wallet"
    investment = "investment"
    pension = "pension"
    other = "other"

class CategoryType(enum.Enum):
    income = "income"
    expense = "expense"

class frequencyType(enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    full_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default='USD')
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    accounts: Mapped[list["Account"]] = db.relationship("Account", back_populates="user")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="user")
    categories: Mapped[list["Category"]] = db.relationship("Category", back_populates="user")
    subscriptions: Mapped[list["Subscription"]] = db.relationship("Subscription", back_populates="user")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "full_name": self.full_name,
                "email": self.email,
                "currency": self.currency,
                "created_at": self.created_at.isoformat() if self.created_at else None
            } 
        else:
            return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "currency": self.currency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "accounts": [account.serialize() for account in self.accounts],
            "transactions": [transaction.serialize() for transaction in self.transactions],
            "categories": [category.serialize() for category in self.categories],
            "subscriptions": [subscription.serialize() for subscription in self.subscriptions]
        }
    
class Account(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    balance: Mapped[float] = mapped_column(nullable=False, default=0.0)
    type: Mapped[AccountType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="account")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "balance": self.balance,
            "type": self.type.value,
            "created_at": self.created_at.isoformat() if self.created_at else None
        } 
    
class Transaction(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"), nullable=True)
    subscription_id: Mapped[int] = mapped_column(ForeignKey("subscription.id"), nullable=True)

    amount: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    date: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))
    is_recurring: Mapped[bool] = mapped_column(nullable=False, default=False)

    user = db.relationship("User", back_populates="transactions")
    account = db.relationship("Account", back_populates="transactions")
    category = db.relationship("Category", back_populates="transactions")
    subscription = db.relationship("Subscription", back_populates="transactions")

    def serialize(self , large=False):
        if not large:
            return {
                "id": self.id,
                "account_id": self.account_id,
                "user_id": self.user_id,
                "category_id": self.category_id,
                "subscription_id": self.subscription_id,
                "amount": self.amount,
                "description": self.description,
                "date": self.date.isoformat() if self.date else None,
                "is_recurring": self.is_recurring
            }
        else:           
            return {
                "id": self.id,
                "account_id": self.account_id,
                "user_id": self.user_id,
                "category_id": self.category_id,
                "subscription_id": self.subscription_id,
                "amount": self.amount,
                "description": self.description,
                "date": self.date.isoformat() if self.date else None,
                "is_recurring": self.is_recurring,
                "account": self.account.serialize() if self.account else None,
                "category": self.category.serialize() if self.category else None,
                "subscription": self.subscription.serialize() if self.subscription else None
            }
    
class Category(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[CategoryType] = mapped_column(nullable=False)

    user = db.relationship("User", back_populates="categories")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="category")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "name": self.name,
                "type": self.type.value
            }
        else:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "name": self.name,
                "type": self.type.value,
                "transactions": [transaction.serialize(large=True) for transaction in self.transactions]
            }

class Subscription(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    frequency: Mapped[frequencyType] = mapped_column(nullable=False)
    payment_date: Mapped[datetime] = mapped_column(nullable=False)
    last_payment_date: Mapped[datetime] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="subscriptions")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="subscription")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "name": self.name,
                "price": self.price,
                "frequency": self.frequency.value,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "is_active": self.is_active,
                "created_at": self.created_at.isoformat() if self.created_at else None
            }
        else:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "name": self.name,
                "price": self.price,
                "frequency": self.frequency.value,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "is_active": self.is_active,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "transactions": [transaction.serialize(large=True) for transaction in self.transactions]
            }
