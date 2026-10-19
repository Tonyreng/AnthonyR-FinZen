@echo off
setlocal EnableExtensions

where docker >nul 2>&1 || (
    echo [finzen-setup] ERROR: Docker is not installed.
    exit /b 1
)

docker info >nul 2>&1 || (
    echo [finzen-setup] ERROR: Docker is not running.
    exit /b 1
)

docker compose version >nul 2>&1 || (
    echo [finzen-setup] ERROR: Docker Compose v2 is required.
    exit /b 1
)

if not exist "%~dp0.env" (
    echo [finzen-setup] ERROR: Create .env from .env.example and replace every placeholder.
    exit /b 1
)

pushd "%~dp0" || exit /b 1
docker compose config --quiet || goto :error
docker compose up --build --wait || goto :error
echo [finzen-setup] FinZen is ready at http://localhost:3000
popd
exit /b 0

:error
echo [finzen-setup] ERROR: Setup failed.
popd
exit /b 1
