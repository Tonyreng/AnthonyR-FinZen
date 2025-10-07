
from datetime import datetime, timezone
from decimal import Decimal
import enum
from sqlalchemy import ForeignKey, Numeric, String, Boolean
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

class statusType(enum.Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"

class ReminderType(enum.Enum):
    debt = "debt"
    loan_given = "loan_given"
    subscription = "subscription"



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
    debts: Mapped[list["Debt"]] = db.relationship("Debt", back_populates="user")
    loans_given: Mapped[list["LoanGiven"]] = db.relationship("LoanGiven", back_populates="user")
    reminders: Mapped[list["Reminder"]] = db.relationship("Reminder", back_populates="user")

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
            "subscriptions": [subscription.serialize() for subscription in self.subscriptions],
            "loans_given": [loan_given.serialize() for loan_given in self.loans_given],
            "debts": [debt.serialize() for debt in self.debts],
            "reminders": [reminder.serialize() for reminder in self.reminders]
        }
    
class Account(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=0.00)
    type: Mapped[AccountType] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="account")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "balance": str(self.balance),
            "type": self.type.value,
            "created_at": self.created_at.isoformat() if self.created_at else None
        } 
    
class Transaction(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"), nullable=True)
    subscription_id: Mapped[int] = mapped_column(ForeignKey("subscription.id"), nullable=True)
    debt_id: Mapped[int] = mapped_column(ForeignKey("debt.id"), nullable=True)
    loan_given_id: Mapped[int] = mapped_column(ForeignKey("loan_given.id"), nullable=True)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    date: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))
    is_recurring: Mapped[bool] = mapped_column(nullable=False, default=False)

    user = db.relationship("User", back_populates="transactions")
    account = db.relationship("Account", back_populates="transactions")
    category = db.relationship("Category", back_populates="transactions")
    subscription = db.relationship("Subscription", back_populates="transactions")
    debt = db.relationship("Debt", back_populates="transactions")
    loan_given = db.relationship("LoanGiven", back_populates="transactions")
    installment_links: Mapped[list["InstallmentTransaction"]] = db.relationship("InstallmentTransaction", back_populates="transaction")

    def serialize(self , large=False):
        if not large:
            return {
                "id": self.id,
                "account_id": self.account_id,
                "user_id": self.user_id,
                "category_id": self.category_id,
                "subscription_id": self.subscription_id,
                "amount": str(self.amount),
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
                "amount": str(self.amount),
                "description": self.description,
                "date": self.date.isoformat() if self.date else None,
                "is_recurring": self.is_recurring,
                "account": self.account.serialize() if self.account else None,
                "category": self.category.serialize() if self.category else None,
                "subscription": self.subscription.serialize() if self.subscription else None,
                "debt": {
                    "id": self.debt.id,
                    "creditor": self.debt.creditor,
                    "remaining_amount": self.debt.remaining_amount,
                    "status": self.debt.status.value
                } if self.debt else None,
                "loan_given": {
                    "id": self.loan_given.id,
                    "debtor": self.loan_given.debtor,
                    "remaining_amount": self.loan_given.remaining_amount,
                    "status": self.loan_given.status.value
                } if self.loan_given else None,
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
                "transactions": [transaction.serialize() for transaction in self.transactions]
            }

class Subscription(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    frequency: Mapped[frequencyType] = mapped_column(nullable=False)
    payment_date: Mapped[datetime] = mapped_column(nullable=False)
    last_payment_date: Mapped[datetime] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="subscriptions")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="subscription")
    reminders: Mapped[list["Reminder"]] = db.relationship("Reminder", back_populates="subscription")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "name": self.name,
                "price": str(self.price),
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
                "price": str(self.price),
                "frequency": self.frequency.value,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "is_active": self.is_active,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "transactions": [transaction.serialize() for transaction in self.transactions],
                "reminders": [reminder.serialize() for reminder in self.reminders]
            }

class Installment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    loan_given_id: Mapped[int] = mapped_column(ForeignKey("loan_given.id"), nullable=True)
    debt_id: Mapped[int] = mapped_column(ForeignKey("debt.id"), nullable=True)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    last_payment_date: Mapped[datetime] = mapped_column(nullable=True)
    due_date: Mapped[datetime] = mapped_column(nullable=False)
    status: Mapped[statusType] = mapped_column(nullable=False, default=statusType.pending)

    
    debt = db.relationship("Debt", back_populates="installments")
    loan_given = db.relationship("LoanGiven", back_populates="installments")
    installment_links: Mapped[list["InstallmentTransaction"]] = db.relationship("InstallmentTransaction", back_populates="installment")

    def serialize(self):
        return {
            "id": self.id,
            "debt_id": self.debt_id,
            "loan_given_id": self.loan_given_id,
            "amount": str(self.amount),
            "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status.value,
            "installment_links": [link.serialize() for link in self.installment_links],
        }
    
class InstallmentTransaction(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    installment_id: Mapped[int] = mapped_column(ForeignKey("installment.id"), nullable=False)
    transaction_id: Mapped[int] = mapped_column(ForeignKey("transaction.id"), nullable=False)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    installment = db.relationship("Installment", back_populates="installment_links" )
    transaction = db.relationship("Transaction", back_populates="installment_links")

    def serialize(self):
        return {
            "id": self.id,
            "installment_id": self.installment_id,
            "transaction_id": self.transaction_id,
            "amount": str(self.amount)
        }

class Debt(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    
    creditor: Mapped[str] = mapped_column(String(100), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    remaining_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    last_payment_date: Mapped[datetime] = mapped_column(nullable=True)
    payment_date: Mapped[datetime] = mapped_column(nullable=True)
    status: Mapped[statusType] = mapped_column(nullable=False, default=statusType.pending)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="debts")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="debt")
    installments: Mapped[list["Installment"]] = db.relationship("Installment", back_populates="debt")
    reminders: Mapped[list["Reminder"]] = db.relationship("Reminder", back_populates="debt")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "creditor": self.creditor,
                "total_amount": str(self.total_amount),
                "remaining_amount": str(self.remaining_amount),
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "status": self.status.value,
                "created_at": self.created_at.isoformat() if self.created_at else None
            }
        else:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "creditor": self.creditor,
                "total_amount": str(self.total_amount),
                "remaining_amount": str(self.remaining_amount),
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "status": self.status.value,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "transactions": [transaction.serialize() for transaction in self.transactions],
                "installments": [installment.serialize() for installment in self.installments],
                "reminders": [reminder.serialize() for reminder in self.reminders]
            }
        
class LoanGiven(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    debtor: Mapped[str] = mapped_column(String(100), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    remaining_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    last_payment_date: Mapped[datetime] = mapped_column(nullable=True)
    payment_date: Mapped[datetime] = mapped_column(nullable=True)
    status: Mapped[statusType] = mapped_column(nullable=False, default=statusType.pending)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="loans_given")
    transactions: Mapped[list["Transaction"]] = db.relationship("Transaction", back_populates="loan_given")
    installments: Mapped[list["Installment"]] = db.relationship("Installment", back_populates="loan_given")
    reminders: Mapped[list["Reminder"]] = db.relationship("Reminder", back_populates="loan_given")

    def serialize(self, large=False):
        if not large:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "debtor": self.debtor,
                "total_amount": str(self.total_amount),
                "remaining_amount": str(self.remaining_amount),
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "status": self.status.value,
                "created_at": self.created_at.isoformat() if self.created_at else None
            }
        else:
            return {
                "id": self.id,
                "user_id": self.user_id,
                "debtor": self.debtor,
                "total_amount": str(self.total_amount),
                "remaining_amount": str(self.remaining_amount),
                "last_payment_date": self.last_payment_date.isoformat() if self.last_payment_date else None,
                "payment_date": self.payment_date.isoformat() if self.payment_date else None,
                "status": self.status.value,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "transactions": [transaction.serialize() for transaction in self.transactions],
                "installments": [installment.serialize() for installment in self.installments],
                "reminders": [reminder.serialize() for reminder in self.reminders]
            }

class Reminder(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    debt_id: Mapped[int] = mapped_column(ForeignKey("debt.id"), nullable=True)
    loan_given_id: Mapped[int] = mapped_column(ForeignKey("loan_given.id"), nullable=True)
    subscription_id: Mapped[int] = mapped_column(ForeignKey("subscription.id"), nullable=True)

    type: Mapped[ReminderType] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    reminder_date: Mapped[datetime] = mapped_column(nullable=False)
    is_sent: Mapped[bool] = mapped_column(nullable=False, default=False)

    user = db.relationship("User", back_populates="reminders")
    debt = db.relationship("Debt", back_populates="reminders")
    loan_given = db.relationship("LoanGiven", back_populates="reminders")
    subscription = db.relationship("Subscription", back_populates="reminders")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "debt_id": self.debt_id,
            "loan_given_id": self.loan_given_id,
            "subscription_id": self.subscription_id,
            "title": self.title,
            "description": self.description,
            "reminder_date": self.reminder_date.isoformat() if self.reminder_date else None,
            "is_sent": self.is_sent
        }