import click
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import random
from models import (
    db, User, Account, AccountType, Category, CategoryType,
    Transaction, TransactionType, Subscription, frequencyType
)

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are useful to run cronjobs or tasks outside of the API but still in integration 
with your database, for example: Import the price of bitcoin every night at 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        """Insert mock data for testing the application"""
        
        # Find existing user
        user = User.query.filter_by(email="tonyreng01@gmail.com").first()
        if not user:
            print("❌ User tonyreng01@gmail.com not found. Please create the user first.")
            return
        
        print(f"✅ Found user: {user.full_name} ({user.email})")
        
        # Clear existing data for this user (except the user itself)
        Transaction.query.filter_by(user_id=user.id).delete()
        Subscription.query.filter_by(user_id=user.id).delete()
        Account.query.filter_by(user_id=user.id).delete()
        Category.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        print("🗑️  Cleared existing mock data")
        
        # ==================== ACCOUNTS ====================
        accounts_data = [
            {"name": "Cuenta Corriente Bancolombia", "type": AccountType.bank, "balance": Decimal("2450000.00")},
            {"name": "Cuenta de Ahorros Davivienda", "type": AccountType.savings, "balance": Decimal("8500000.00")},
            {"name": "Tarjeta de Crédito Visa", "type": AccountType.credit_card, "balance": Decimal("1200000.00")},
            {"name": "Tarjeta de Crédito Mastercard", "type": AccountType.credit_card, "balance": Decimal("850000.00")},
            {"name": "CDT Bancolombia", "type": AccountType.investment, "balance": Decimal("15000000.00")},
            {"name": "Ahorro en Efectivo", "type": AccountType.cash, "balance": Decimal("320000.00")},
            {"name": "Billetera Nequi", "type": AccountType.virtual_wallet, "balance": Decimal("180000.00")},
            {"name": "Billetera Daviplata", "type": AccountType.virtual_wallet, "balance": Decimal("95000.00")},
        ]
        
        accounts = {}
        for acc_data in accounts_data:
            account = Account(
                user_id=user.id,
                name=acc_data["name"],
                type=acc_data["type"],
                balance=acc_data["balance"]
            )
            db.session.add(account)
            db.session.flush()
            accounts[acc_data["name"]] = account
            print(f"  💳 Created account: {acc_data['name']}")
        
        # ==================== CATEGORIES ====================
        income_categories = [
            "Salario",
            "Freelance",
            "Intereses CDT",
            "Reembolsos",
            "Ventas",
            "Bonificaciones"
        ]
        
        expense_categories = [
            "Alimentación",
            "Transporte",
            "Entretenimiento",
            "Servicios",
            "Salud",
            "Educación",
            "Hogar",
            "Ropa",
            "Tecnología",
            "Restaurantes",
            "Suscripciones",
            "Otros gastos"
        ]
        
        categories = {}
        for cat_name in income_categories:
            cat = Category(user_id=user.id, name=cat_name, type=CategoryType.income)
            db.session.add(cat)
            db.session.flush()
            categories[cat_name] = cat
        
        for cat_name in expense_categories:
            cat = Category(user_id=user.id, name=cat_name, type=CategoryType.expense)
            db.session.add(cat)
            db.session.flush()
            categories[cat_name] = cat
        
        print(f"  📁 Created {len(categories)} categories")
        
        # ==================== SUBSCRIPTIONS ====================
        now = datetime.now(timezone.utc)
        subscriptions_data = [
            {"name": "Netflix", "price": Decimal("44900.00"), "frequency": frequencyType.monthly, "days_offset": 5},
            {"name": "Spotify Premium", "price": Decimal("16900.00"), "frequency": frequencyType.monthly, "days_offset": 10},
            {"name": "Amazon Prime", "price": Decimal("29900.00"), "frequency": frequencyType.monthly, "days_offset": 15},
            {"name": "HBO Max", "price": Decimal("24900.00"), "frequency": frequencyType.monthly, "days_offset": 8},
            {"name": "YouTube Premium", "price": Decimal("22900.00"), "frequency": frequencyType.monthly, "days_offset": 20},
            {"name": "iCloud 200GB", "price": Decimal("12900.00"), "frequency": frequencyType.monthly, "days_offset": 1},
            {"name": "Gimnasio SmartFit", "price": Decimal("89900.00"), "frequency": frequencyType.monthly, "days_offset": 1},
            {"name": "Disney+", "price": Decimal("27900.00"), "frequency": frequencyType.monthly, "days_offset": 12},
        ]
        
        subscriptions = []
        for sub_data in subscriptions_data:
            payment_date = now.replace(day=min(sub_data["days_offset"], 28))
            if payment_date < now:
                payment_date = payment_date + timedelta(days=30)
            
            sub = Subscription(
                user_id=user.id,
                name=sub_data["name"],
                price=sub_data["price"],
                frequency=sub_data["frequency"],
                payment_date=payment_date,
                last_payment_date=payment_date - timedelta(days=30),
                is_active=True
            )
            db.session.add(sub)
            db.session.flush()
            subscriptions.append(sub)
            print(f"  🔔 Created subscription: {sub_data['name']}")
        
        # ==================== TRANSACTIONS ====================
        # Generate transactions for the last 2 months
        
        # Fixed income transactions
        income_transactions = [
            # December salary
            {"date_offset": -35, "amount": Decimal("5800000.00"), "category": "Salario", 
             "account": "Cuenta Corriente Bancolombia", "description": "Salario Diciembre 2025"},
            # January salary
            {"date_offset": -5, "amount": Decimal("5800000.00"), "category": "Salario", 
             "account": "Cuenta Corriente Bancolombia", "description": "Salario Enero 2026"},
            # Freelance work
            {"date_offset": -45, "amount": Decimal("1200000.00"), "category": "Freelance", 
             "account": "Billetera Nequi", "description": "Proyecto web cliente externo"},
            {"date_offset": -20, "amount": Decimal("850000.00"), "category": "Freelance", 
             "account": "Billetera Nequi", "description": "Diseño logo empresa"},
            # CDT interests
            {"date_offset": -30, "amount": Decimal("187500.00"), "category": "Intereses CDT", 
             "account": "CDT Bancolombia", "description": "Intereses CDT Diciembre"},
            # Reimbursement
            {"date_offset": -15, "amount": Decimal("350000.00"), "category": "Reembolsos", 
             "account": "Cuenta de Ahorros Davivienda", "description": "Reembolso gastos médicos EPS"},
            # Bonus
            {"date_offset": -38, "amount": Decimal("2900000.00"), "category": "Bonificaciones", 
             "account": "Cuenta Corriente Bancolombia", "description": "Prima de Navidad"},
        ]
        
        # Variable expense transactions
        expense_transactions = [
            # Alimentación (groceries)
            {"date_offset": -2, "amount": Decimal("285000.00"), "category": "Alimentación", 
             "account": "Tarjeta de Crédito Visa", "description": "Mercado Éxito"},
            {"date_offset": -9, "amount": Decimal("156000.00"), "category": "Alimentación", 
             "account": "Billetera Daviplata", "description": "Mercado D1"},
            {"date_offset": -16, "amount": Decimal("312000.00"), "category": "Alimentación", 
             "account": "Tarjeta de Crédito Visa", "description": "Mercado Jumbo"},
            {"date_offset": -23, "amount": Decimal("198000.00"), "category": "Alimentación", 
             "account": "Ahorro en Efectivo", "description": "Mercado plaza"},
            {"date_offset": -32, "amount": Decimal("267000.00"), "category": "Alimentación", 
             "account": "Tarjeta de Crédito Visa", "description": "Mercado Carulla"},
            {"date_offset": -40, "amount": Decimal("289000.00"), "category": "Alimentación", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Mercado Éxito"},
            {"date_offset": -48, "amount": Decimal("145000.00"), "category": "Alimentación", 
             "account": "Billetera Nequi", "description": "Mercado Ara"},
            {"date_offset": -55, "amount": Decimal("321000.00"), "category": "Alimentación", 
             "account": "Cuenta Corriente Bancolombia", "description": "Mercado mensual"},
            
            # Transporte
            {"date_offset": -1, "amount": Decimal("45000.00"), "category": "Transporte", 
             "account": "Billetera Nequi", "description": "Uber semana"},
            {"date_offset": -8, "amount": Decimal("52000.00"), "category": "Transporte", 
             "account": "Billetera Nequi", "description": "Uber y transporte"},
            {"date_offset": -15, "amount": Decimal("180000.00"), "category": "Transporte", 
             "account": "Tarjeta de Crédito Visa", "description": "Tanque gasolina"},
            {"date_offset": -25, "amount": Decimal("38000.00"), "category": "Transporte", 
             "account": "Billetera Daviplata", "description": "DiDi viajes"},
            {"date_offset": -35, "amount": Decimal("175000.00"), "category": "Transporte", 
             "account": "Cuenta Corriente Bancolombia", "description": "Tanque gasolina"},
            {"date_offset": -45, "amount": Decimal("62000.00"), "category": "Transporte", 
             "account": "Billetera Nequi", "description": "Uber diciembre"},
            
            # Restaurantes
            {"date_offset": -3, "amount": Decimal("85000.00"), "category": "Restaurantes", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Cena Crepes & Waffles"},
            {"date_offset": -10, "amount": Decimal("45000.00"), "category": "Restaurantes", 
             "account": "Billetera Nequi", "description": "Almuerzo Rappi"},
            {"date_offset": -17, "amount": Decimal("120000.00"), "category": "Restaurantes", 
             "account": "Tarjeta de Crédito Visa", "description": "Cena cumpleaños"},
            {"date_offset": -28, "amount": Decimal("67000.00"), "category": "Restaurantes", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Brunch domingo"},
            {"date_offset": -38, "amount": Decimal("92000.00"), "category": "Restaurantes", 
             "account": "Tarjeta de Crédito Visa", "description": "Cena fin de año"},
            {"date_offset": -50, "amount": Decimal("55000.00"), "category": "Restaurantes", 
             "account": "Ahorro en Efectivo", "description": "Almuerzo con amigos"},
            
            # Servicios
            {"date_offset": -5, "amount": Decimal("185000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Factura luz EPM"},
            {"date_offset": -5, "amount": Decimal("75000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Factura agua"},
            {"date_offset": -5, "amount": Decimal("95000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Internet Claro"},
            {"date_offset": -5, "amount": Decimal("65000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Plan celular"},
            {"date_offset": -35, "amount": Decimal("172000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Factura luz Diciembre"},
            {"date_offset": -35, "amount": Decimal("68000.00"), "category": "Servicios", 
             "account": "Cuenta Corriente Bancolombia", "description": "Factura agua Diciembre"},
            
            # Entretenimiento
            {"date_offset": -7, "amount": Decimal("45000.00"), "category": "Entretenimiento", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Cine Procinal"},
            {"date_offset": -21, "amount": Decimal("180000.00"), "category": "Entretenimiento", 
             "account": "Tarjeta de Crédito Visa", "description": "Concierto"},
            {"date_offset": -42, "amount": Decimal("85000.00"), "category": "Entretenimiento", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Salida bar"},
            {"date_offset": -52, "amount": Decimal("250000.00"), "category": "Entretenimiento", 
             "account": "Tarjeta de Crédito Visa", "description": "Fiesta año nuevo"},
            
            # Salud
            {"date_offset": -12, "amount": Decimal("85000.00"), "category": "Salud", 
             "account": "Cuenta de Ahorros Davivienda", "description": "Consulta médica particular"},
            {"date_offset": -30, "amount": Decimal("125000.00"), "category": "Salud", 
             "account": "Tarjeta de Crédito Visa", "description": "Medicamentos"},
            {"date_offset": -45, "amount": Decimal("280000.00"), "category": "Salud", 
             "account": "Cuenta de Ahorros Davivienda", "description": "Exámenes de laboratorio"},
            
            # Hogar
            {"date_offset": -18, "amount": Decimal("1850000.00"), "category": "Hogar", 
             "account": "Cuenta Corriente Bancolombia", "description": "Arriendo Enero"},
            {"date_offset": -48, "amount": Decimal("1850000.00"), "category": "Hogar", 
             "account": "Cuenta Corriente Bancolombia", "description": "Arriendo Diciembre"},
            {"date_offset": -22, "amount": Decimal("320000.00"), "category": "Hogar", 
             "account": "Tarjeta de Crédito Visa", "description": "Artículos de aseo"},
            {"date_offset": -55, "amount": Decimal("450000.00"), "category": "Hogar", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Decoración navideña"},
            
            # Tecnología
            {"date_offset": -14, "amount": Decimal("89000.00"), "category": "Tecnología", 
             "account": "Tarjeta de Crédito Visa", "description": "Cable USB-C"},
            {"date_offset": -40, "amount": Decimal("1250000.00"), "category": "Tecnología", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Audífonos Sony"},
            
            # Ropa
            {"date_offset": -26, "amount": Decimal("285000.00"), "category": "Ropa", 
             "account": "Tarjeta de Crédito Visa", "description": "Ropa Zara"},
            {"date_offset": -47, "amount": Decimal("420000.00"), "category": "Ropa", 
             "account": "Tarjeta de Crédito Mastercard", "description": "Compras navideñas ropa"},
            
            # Educación
            {"date_offset": -8, "amount": Decimal("149000.00"), "category": "Educación", 
             "account": "Tarjeta de Crédito Visa", "description": "Curso Udemy"},
            {"date_offset": -33, "amount": Decimal("450000.00"), "category": "Educación", 
             "account": "Cuenta de Ahorros Davivienda", "description": "Libros técnicos Amazon"},
        ]
        
        # Create income transactions
        for tx_data in income_transactions:
            tx_date = now + timedelta(days=tx_data["date_offset"])
            tx = Transaction(
                user_id=user.id,
                account_id=accounts[tx_data["account"]].id,
                category_id=categories[tx_data["category"]].id,
                type=TransactionType.general,
                amount=tx_data["amount"],
                description=tx_data["description"],
                date=tx_date,
                is_recurring=False
            )
            db.session.add(tx)
        
        print(f"  💰 Created {len(income_transactions)} income transactions")
        
        # Create expense transactions
        for tx_data in expense_transactions:
            tx_date = now + timedelta(days=tx_data["date_offset"])
            tx = Transaction(
                user_id=user.id,
                account_id=accounts[tx_data["account"]].id,
                category_id=categories[tx_data["category"]].id,
                type=TransactionType.general,
                amount=tx_data["amount"],
                description=tx_data["description"],
                date=tx_date,
                is_recurring=False
            )
            db.session.add(tx)
        
        print(f"  💸 Created {len(expense_transactions)} expense transactions")
        
        # Create subscription transactions (last 2 months)
        subscription_tx_count = 0
        for sub in subscriptions:
            for month_offset in [-1, 0]:  # Last month and this month
                tx_date = now + timedelta(days=month_offset * 30)
                tx = Transaction(
                    user_id=user.id,
                    account_id=accounts["Tarjeta de Crédito Visa"].id,
                    category_id=categories["Suscripciones"].id,
                    subscription_id=sub.id,
                    type=TransactionType.subscription,
                    amount=sub.price,
                    description=f"Pago {sub.name}",
                    date=tx_date,
                    is_recurring=True
                )
                db.session.add(tx)
                subscription_tx_count += 1
        
        print(f"  🔄 Created {subscription_tx_count} subscription transactions")
        
        # Commit all changes
        db.session.commit()
        
        # Summary
        total_accounts = Account.query.filter_by(user_id=user.id).count()
        total_categories = Category.query.filter_by(user_id=user.id).count()
        total_subscriptions = Subscription.query.filter_by(user_id=user.id).count()
        total_transactions = Transaction.query.filter_by(user_id=user.id).count()
        
        print("\n" + "="*50)
        print("📊 MOCK DATA SUMMARY")
        print("="*50)
        print(f"  👤 User: {user.full_name}")
        print(f"  💳 Accounts: {total_accounts}")
        print(f"  📁 Categories: {total_categories}")
        print(f"  🔔 Subscriptions: {total_subscriptions}")
        print(f"  📝 Transactions: {total_transactions}")
        print("="*50)
        print("✅ Mock data inserted successfully!")