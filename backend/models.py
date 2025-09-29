
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


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default='USD')
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))


    def serialize(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "currency": self.currency,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
class Account(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    balance: Mapped[float] = mapped_column(nullable=False, default=0.0)
    type: Mapped[AccountType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

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
    amount: Mapped[float] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    date: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))
    is_recurring: Mapped[bool] = mapped_column(nullable=False, default=False)

    def serialize(self):
        return {
            "id": self.id,
            "account_id": self.account_id,
            "user_id": self.user_id,
            "amount": self.amount,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "is_recurring": self.is_recurring
        }