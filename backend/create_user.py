from werkzeug.security import generate_password_hash
from database import db
from models import User
from app import app

with app.app_context():
    # Verificar si el usuario ya existe
    existing_user = User.query.filter_by(email='tonyreng01@gmail.com').first()
    if existing_user:
        print('Error: User with this email already exists')
        print(f'Existing user ID: {existing_user.id}')
    else:
        # Crear nuevo usuario
        new_user = User(
            full_name='Anthony Rengifo',
            email='tonyreng01@gmail.com',
            password_hash=generate_password_hash('1234'),
            currency='USD'
        )
        db.session.add(new_user)
        db.session.commit()
        print('✅ User created successfully!')
        print(f'ID: {new_user.id}')
        print(f'Full Name: {new_user.full_name}')
        print(f'Email: {new_user.email}')
        print(f'Currency: {new_user.currency}')
        print(f'Created at: {new_user.created_at}')
