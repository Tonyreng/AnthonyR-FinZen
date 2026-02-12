@echo off
REM Script de setup para Windows

echo 🚀 Configurando FinZen Fullstack Template...

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker no está corriendo. Por favor, inicia Docker Desktop.
    exit /b 1
)

echo ✅ Docker está corriendo

REM Construir y ejecutar contenedores
echo 🏗️ Construyendo contenedores...
docker-compose build

echo 🚀 Iniciando servicios...
docker-compose up -d

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

REM Ejecutar migraciones
echo 📊 Ejecutando migraciones de base de datos...
docker-compose exec backend flask db upgrade

REM Crear usuario de prueba
echo 👤 Creando usuario de prueba...
docker-compose exec backend python -c "from app import app; from models import db, User; from utils import hash_password; app.app_context().push(); user = User.query.filter_by(email='admin@example.com').first() or User(email='admin@example.com', password=hash_password('admin123'), is_active=True); db.session.add(user) if not User.query.filter_by(email='admin@example.com').first() else None; db.session.commit(); print('✅ Usuario admin@example.com configurado')"

echo.
echo 🎉 ¡Setup completado!
echo.
echo 📍 URLs disponibles:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5001/api/health
echo    Admin:    http://localhost:5001/admin/
echo.
echo 👤 Usuario de prueba:
echo    Email:    admin@example.com
echo    Password: admin123
echo.
echo 🛠️ Comandos útiles:
echo    Ver logs:     docker-compose logs -f
echo    Parar todo:   docker-compose down
echo    Reiniciar:    docker-compose restart
echo.
pause