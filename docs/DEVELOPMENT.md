# Desarrollo y despliegue

## Requisitos y configuración

La ruta soportada usa Git, Docker Engine/Desktop y Compose v2. La ejecución nativa requiere Python 3.11, Node 24, pnpm 10.28.2 y PostgreSQL 15. SQLite solo sirve para pruebas pequeñas: el dashboard usa `date_trunc` de PostgreSQL.

```bash
cp .env.example .env
```

Sustituye todos los marcadores. Nunca confirmes `.env`. Compose exige `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET_KEY` y `CORS_ORIGINS`. Usa secretos diferentes por entorno. En producción configura HTTPS, `JWT_COOKIE_SECURE=true`, `JWT_COOKIE_CSRF_PROTECT=true`, orígenes exactos y deja admin/debug desactivados salvo necesidad explícita.

`VITE_API_URL` es público y nunca debe contener secretos. En desarrollo apunta normalmente a `http://localhost:5001`; en producción queda vacío para usar el origen de Nginx y `/api`.

## Docker de desarrollo

Compose carga automáticamente el override:

```bash
docker compose up --build --wait
```

El flujo es `db healthy → migrate completado → backend healthy → frontend healthy`. El override usa `flask run`, Vite, bind mounts y publica:

| Servicio | URL/puerto |
| --- | --- |
| Frontend Vite | <http://localhost:3000> |
| Backend Flask | <http://localhost:5001/api/health> |
| PostgreSQL | `localhost:5432` |

Comandos frecuentes:

```bash
docker compose ps
docker compose logs -f backend
docker compose exec backend flask db current
docker compose down
```

No uses `down --volumes` salvo que quieras borrar de forma irreversible los datos locales.

## Docker cercano a producción

El archivo base no expone PostgreSQL ni Flask. Gunicorn y Nginx se ejecutan como usuarios no root; Nginx publica el puerto `3000` y sirve SPA más proxy same-origin:

```bash
docker compose -f compose.yaml up --build --wait
curl --fail http://localhost:3000/api/ready
```

`migrate` es one-shot y se ejecuta antes del backend. `postgres_data` persiste entre recreaciones. Para comprobar el usuario del proceso:

```bash
docker compose -f compose.yaml exec backend id
docker compose -f compose.yaml exec frontend id
```

Las imágenes incluyen etiquetas OCI para versión y SHA cuando se pasan `VERSION` y `VCS_REF`. La CI publica tags semánticos y `sha-*` para `linux/amd64` y `linux/arm64` en GHCR.

## Ejecución nativa

Backend, desde la raíz:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements-dev.txt
cd backend
flask --app app.py db upgrade
flask --app app.py run --host=127.0.0.1 --port=5001
```

La `DATABASE_URL` del host debe apuntar a `localhost`, no al hostname Docker `db`.

Frontend:

```bash
cd frontend
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Migraciones

En desarrollo, el arranque aplica migraciones existentes. Para cambiar el esquema:

```bash
docker compose exec backend flask db heads
docker compose exec backend flask db current
docker compose exec backend flask db migrate -m "descripcion-del-cambio"
docker compose exec backend flask db upgrade
```

Revisa la revisión generada, especialmente enums, constraints y migraciones de datos. No edites una migración posiblemente aplicada. Prueba downgrade solo sobre datos descartables y cuando sea seguro.

## Datos de prueba

Los comandos están parametrizados y no contienen credenciales ni identidades reales:

```bash
docker compose exec backend flask insert-test-users --count 3 --prefix demo --currency COP
docker compose exec backend flask insert-test-data --email demo1@example.test
```

`insert-test-users` solicita contraseña. `insert-test-data` se niega a reemplazar información existente salvo `--replace`; usa esa opción solo en bases descartables. También puedes crear un usuario individual:

```bash
docker compose exec backend python create_user.py \
  --email user@example.test --full-name "FinZen User" --currency COP
```

## Validaciones

```bash
pnpm --dir frontend lint
pnpm --dir frontend exec tsc --noEmit --incremental false -p tsconfig.app.json
pnpm --dir frontend test:run
pnpm --dir frontend audit --audit-level moderate
pnpm --dir frontend build
```

```bash
docker build --file backend/Dockerfile --target test --tag finzen-backend-test .
docker run --rm -e FLASK_DEBUG=1 -e DATABASE_URL=sqlite:///:memory: \
  -e JWT_SECRET_KEY=test-only -e CORS_ORIGINS=http://localhost:3000 \
  finzen-backend-test
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml -f compose.override.yaml config --quiet
```

Con el stack productivo levantado:

```bash
CI=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --dir frontend test:e2e
```

La suite inicial no sustituye pruebas de permisos y concurrencia sobre PostgreSQL. GitHub Actions repite estas puertas en cada push/PR y el smoke levanta el stack completo.

## Resolución de problemas

- Si Compose rechaza variables, compara nombres con `.env.example`; no copies valores reales a incidencias o logs.
- Si el frontend no llega a la API, en desarrollo revisa `VITE_API_URL`; en producción debe estar vacío y `/api/health` debe responder desde el puerto de Nginx.
- Si refresh devuelve `401`, confirma las cookies `refresh_token_cookie` y `csrf_refresh_token`, el encabezado `X-CSRF-TOKEN`, `Secure`, `SameSite`, dominio y HTTPS.
- Si el dashboard falla con SQLite, cambia a PostgreSQL.
- Si no hay categorías, usa el seed sobre una base descartable; todavía no existe CRUD público de categorías.
- Un conflicto de unicidad aún puede terminar como error genérico porque no todas las rutas traducen `IntegrityError` a `409`.
- El primer pull de imágenes o navegador Playwright necesita red y puede reintentarse ante un timeout del registro.

## Lista de despliegue

1. Ejecutar CI completa y auditorías de dependencias.
2. Probar login, refresh CSRF, logout, expiración y permisos sobre HTTPS.
3. Verificar migración, backup y rollback del volumen PostgreSQL.
4. Restringir CORS, puertos, admin y debug; añadir CSP y HSTS en el proxy TLS real.
5. Sustituir el rate limiting en memoria antes de escalar a varias réplicas.
6. Configurar observabilidad, backups, alertas y rotación de secretos sin registrar datos financieros.
