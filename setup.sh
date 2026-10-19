#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
readonly ENV_FILE="${SCRIPT_DIR}/.env"

log() {
    printf '[finzen-setup] %s\n' "$*"
}

fail() {
    printf '[finzen-setup] ERROR: %s\n' "$*" >&2
    exit 1
}

command -v docker >/dev/null 2>&1 || fail 'Docker is not installed.'
docker info >/dev/null 2>&1 || fail 'Docker is not running.'
docker compose version >/dev/null 2>&1 || fail 'Docker Compose v2 is required.'
[[ -f "$ENV_FILE" ]] || fail 'Create .env from .env.example and replace every placeholder.'

cd -- "$SCRIPT_DIR"
log 'Validating Compose configuration.'
docker compose config --quiet

log 'Building and starting FinZen. The migrate service applies database migrations.'
docker compose up --build --wait

log 'FinZen is ready at http://localhost:${FRONTEND_PORT:-3000}'
