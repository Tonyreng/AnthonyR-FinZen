#!/bin/bash

# Script de setup para el template fullstack
echo "🚀 Configurando Fullstack Template..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker Desktop."
    exit 1
fi

echo "✅ Docker está corriendo"

# Construir y ejecutar contenedores
echo "🏗️ Construyendo contenedores..."
docker-compose build

echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
docker-compose exec backend flask db upgrade

# Crear usuario de prueba
echo "👤 Creando usuario de prueba..."
docker-compose exec backend python -c "
from app import app
from models import db, User
from utils import hash_password
with app.app_context():
    if not User.query.filter_by(email='admin@example.com').first():
        user = User(
            email='admin@example.com', 
            password=hash_password('admin123'), 
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        print('✅ Usuario admin@example.com creado con password: admin123')
    else:
        print('ℹ️ Usuario admin ya existe')
"

echo ""
echo "🎉 ¡Setup completado!"
echo ""
echo "📍 URLs disponibles:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api/health"
echo "   Admin:    http://localhost:5000/admin/"
echo ""
echo "👤 Usuario de prueba:"
echo "   Email:    admin@example.com"
echo "   Password: admin123"
echo ""
echo "🛠️ Comandos útiles:"
echo "   Ver logs:     docker-compose logs -f"
echo "   Parar todo:   docker-compose down"
echo "   Reiniciar:    docker-compose restart"
echo ""