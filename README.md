# FinZen

FinZen es una aplicación web para organizar las finanzas personales y observar su evolución. Permite autenticar usuarios, administrar cuentas, registrar ingresos y gastos y consultar un panel con saldos, tendencias, próximos pagos y recomendaciones financieras basadas en reglas.

> Estado actual: el núcleo de autenticación, cuentas, transacciones y dashboard está implementado. Registro, suscripciones, deudas, préstamos, reportes y notificaciones todavía no tienen un flujo completo de producto. Consulta [Estado del proyecto](docs/PROJECT_STATUS.md) antes de ampliar una funcionalidad.

## Documentación

- [Guía para agentes](AGENTS.md): reglas de trabajo, convenciones y validaciones.
- [Arquitectura](docs/ARCHITECTURE.md): componentes, flujos y modelo de datos.
- [Referencia de la API](docs/API.md): endpoints y contratos existentes.
- [Desarrollo y despliegue](docs/DEVELOPMENT.md): instalación, configuración y operaciones.
- [Estado del proyecto](docs/PROJECT_STATUS.md): capacidades, deuda técnica y prioridades.

## Funcionalidades disponibles

- Inicio y cierre de sesión con access token JWT en memoria y refresh token en cookie.
- Restauración de sesión al cargar la aplicación.
- Listado y creación de cuentas financieras.
- Listado, filtrado y creación de transacciones de ingreso o gasto.
- Actualización del balance de la cuenta al crear una transacción.
- Dashboard con balance total, ingresos, gastos, tendencias y próximos pagos.
- Recomendaciones financieras deterministas según los datos del usuario.
- Interfaz en español e inglés.
- Panel Flask-Admin opcional, protegido con autenticación básica cuando se habilita.

## Tecnologías

| Área | Tecnologías principales |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, TanStack Query, Axios, React Hook Form, i18next, Recharts |
| Backend | Python 3.11, Flask 3, SQLAlchemy 2, Flask-Migrate, Flask-JWT-Extended, Flask-Limiter, Flask-Admin |
| Datos | PostgreSQL 15 y migraciones Alembic |
| Infraestructura | Docker Compose y Nginx |

## Inicio rápido con Docker

Requisitos: Docker con Compose v2 y Git.

```bash
cp .env.example .env
```

Edita `.env` y reemplaza todos los valores de ejemplo, especialmente las claves y credenciales. Después inicia el entorno de desarrollo:

```bash
docker compose up --build --wait
```

Compose combina automáticamente `compose.yaml` con `compose.override.yaml`: PostgreSQL queda saludable, el servicio one-shot `migrate` aplica Alembic y luego arrancan Flask con hot reload y Vite. Para simular producción usa únicamente el archivo base:

```bash
docker compose -f compose.yaml up --build --wait
```

Servicios disponibles:

- Frontend: <http://localhost:3000>
- API: <http://localhost:5001/api/health>
- PostgreSQL: `localhost:5432`
- Administración: <http://localhost:5001/admin/> solo si `ENABLE_ADMIN=true`

El stack de producción local usa Nginx y publica el frontend en <http://localhost:3000>. Las llamadas a `/api` se envían internamente al backend:

Las migraciones se ejecutan automáticamente antes del backend. Los reinicios conservan datos en `postgres_data`.

## Desarrollo sin Docker

La base de datos soportada para el flujo completo es PostgreSQL. Aunque Flask configura SQLite cuando falta `DATABASE_URL`, el dashboard utiliza funciones específicas de PostgreSQL como `date_trunc`.

Backend:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
export FLASK_APP=backend/app.py
flask db upgrade --directory backend/migrations
flask run --host=127.0.0.1 --port=5001
```

Frontend:

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Para una configuración local completa y las diferencias entre entornos consulta [Desarrollo y despliegue](docs/DEVELOPMENT.md).

## Variables de entorno

La referencia versionada es [.env.example](.env.example). No confirmes `.env` ni valores reales.

| Variable | Propósito |
| --- | --- |
| `FLASK_DEBUG` | Activa el modo de desarrollo cuando vale `1`. |
| `DATABASE_URL` | Conexión SQLAlchemy; en Docker apunta al servicio `db`. |
| `JWT_SECRET_KEY` | Firma los JWT; debe ser aleatoria y secreta. |
| `JWT_COOKIE_SECURE` | Exige HTTPS para enviar la refresh cookie. |
| `JWT_COOKIE_CSRF_PROTECT` | Activa la protección CSRF de cookies JWT. |
| `JWT_COOKIE_SAMESITE` | Política SameSite de la cookie. |
| `CORS_ORIGINS` | Orígenes permitidos, separados por comas. |
| `ENABLE_ADMIN` | Habilita Flask-Admin explícitamente. |
| `FLASK_APP_KEY` | Clave de sesión de Flask usada por el admin. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales de autenticación básica del admin. |
| `ENABLE_DEBUG_ROUTES` | Habilita endpoints de diagnóstico JWT; solo para desarrollo. |
| `VITE_API_URL` | URL del backend para el navegador; vacío usa el mismo origen. |

En Docker también se requieren `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. En producción se requieren `JWT_SECRET_KEY` y `CORS_ORIGINS`; si se habilita el admin también hacen falta `FLASK_APP_KEY`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`. El frontend envía el token CSRF de doble envío para renovar la sesión.

## Migraciones y datos de desarrollo

Con Docker de desarrollo:

```bash
docker compose exec backend flask db upgrade
docker compose exec backend flask db current
```

Para crear una migración después de modificar modelos:

```bash
docker compose exec backend flask db migrate -m "descripcion-del-cambio"
docker compose exec backend flask db upgrade
```

Los comandos `insert-test-users` e `insert-test-data` son parametrizados y el segundo exige `--email`; no contienen identidades ni contraseñas reales. Úsalos solo en una base descartable. Consulta [Desarrollo y despliegue](docs/DEVELOPMENT.md#datos-de-prueba).

## Comprobaciones

```bash
cd frontend
pnpm lint
pnpm exec tsc --noEmit --incremental false -p tsconfig.app.json
pnpm test:run
pnpm build
pnpm audit --audit-level moderate
```

```bash
docker compose -f compose.yaml config --quiet
docker compose -f compose.yaml -f compose.override.yaml config --quiet
docker build --file backend/Dockerfile --target test --tag finzen-backend-test .
docker run --rm -e FLASK_DEBUG=1 -e DATABASE_URL=sqlite:///:memory: \
  -e JWT_SECRET_KEY=test-only -e CORS_ORIGINS=http://localhost:3000 \
  finzen-backend-test
```

La CI repite lint, typecheck, unit tests, auditoría, builds, Compose y un smoke test Playwright. La cobertura inicial todavía es pequeña; consulta [Estado del proyecto](docs/PROJECT_STATUS.md#validaciones-observadas).

## Reglas de contribución

1. Lee [AGENTS.md](AGENTS.md) y el estado técnico antes de modificar código.
2. No mezcles una migración de esquema con cambios no relacionados.
3. Mantén montos como `Decimal` en Python y strings en JSON/TypeScript.
4. Conserva fechas internas en UTC y serialízalas como ISO 8601.
5. Actualiza la documentación cuando cambie un endpoint, variable, modelo o flujo operativo.
6. Nunca confirmes secretos, bases de datos, logs, builds ni credenciales de prueba.
