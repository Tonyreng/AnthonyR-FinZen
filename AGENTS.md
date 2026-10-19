# Guía operativa para agentes

Este archivo aplica a todo el repositorio. FinZen maneja información financiera: prioriza corrección, aislamiento entre usuarios, trazabilidad y seguridad sobre cambios rápidos o amplios.

## Antes de modificar

1. Revisa `git status --short`. El árbol de trabajo puede contener cambios del usuario; no los reviertas, reformatees ni mezcles sin necesidad.
2. Lee [Arquitectura](docs/ARCHITECTURE.md), [API](docs/API.md) y [Estado del proyecto](docs/PROJECT_STATUS.md) según el área afectada.
3. Confirma el comportamiento en código. La documentación describe el estado observado, pero el código y las migraciones son la fuente final de verdad.
4. Mantén el alcance solicitado. No aproveches una tarea para corregir toda la deuda registrada.

## Mapa rápido

- `backend/app.py`: configuración Flask, extensiones, CORS, JWT, logging y registro de rutas.
- `backend/models.py`: entidades, relaciones, enums, serialización y validaciones de dominio.
- `backend/routes/`: endpoints HTTP organizados por capacidad.
- `backend/migrations/`: historial Alembic; debe acompañar todo cambio persistente.
- `frontend/src/main.tsx`: proveedores globales de React.
- `frontend/src/routes.tsx`: rutas públicas y protegidas.
- `frontend/src/api/axiosInstance.ts`: cliente HTTP e intento de renovación del access token.
- `frontend/src/hooks/`: consultas y mutaciones de TanStack Query.
- `frontend/src/types/`: contratos TypeScript de la API.
- `frontend/src/i18n/`: recursos español/inglés.

## Arquitectura y contratos

- El frontend React consume la API Flask bajo `/api`; en producción Nginx sirve el SPA y actúa como proxy.
- PostgreSQL es la base funcional esperada. No asumas que el fallback SQLite cubre el dashboard.
- Los blueprints se registran en `backend/routes/__init__.py`. Si agregas una ruta, registra su blueprint y actualiza `docs/API.md`.
- No existe generación automática de tipos. Si cambia una respuesta JSON, actualiza en el mismo cambio los serializadores/rutas, `frontend/src/types`, consumidores y documentación.
- Las respuestas de error actuales usan principalmente `{ "msg": string }`. Conserva el contrato salvo que la tarea incluya una migración explícita.
- La API no implementa paginación ni versionado. No inventes esos contratos de forma unilateral.

## Reglas financieras y de datos

- Usa `Decimal` y columnas `Numeric(10, 2)` para dinero en Python. Nunca introduzcas cálculos persistentes con `float`.
- Los montos se serializan como strings para evitar pérdida de precisión; los tipos TypeScript deben reflejarlo.
- Una transacción general pertenece a un usuario, una cuenta y una categoría. Verifica siempre que las entidades relacionadas pertenezcan al usuario autenticado.
- Crear un ingreso incrementa el balance; crear un gasto lo reduce y actualmente se rechaza si no hay saldo suficiente.
- Mantén la creación de transacción y la actualización de balance dentro de una sola transacción de base de datos.
- Las fechas se crean en UTC y se exponen como ISO 8601. Decide explícitamente cómo interpretar una fecha recibida sin zona horaria.
- Los enums se persisten desde Python. Cambiarlos requiere revisar migraciones, datos existentes, validación de API, tipos, traducciones y UI.
- No edites migraciones ya aplicadas para representar un cambio nuevo; crea una revisión Alembic posterior.

## Autenticación y seguridad

- El access token dura 15 minutos y vive solo en `window.__ACCESS_TOKEN__`.
- El refresh token vive en una cookie configurada por Flask-JWT-Extended; `withCredentials` debe mantenerse en el cliente.
- No muevas tokens a `localStorage` o `sessionStorage` sin una decisión explícita de seguridad.
- La refresh cookie usa doble envío CSRF: Axios lee `csrf_refresh_token` y envía `X-CSRF-TOKEN`. Mantén ambos nombres alineados con Flask-JWT-Extended y pruébalos al tocar autenticación.
- Toda ruta financiera debe usar `@jwt_required()` y filtrar por `get_jwt_identity()`; conocer un ID nunca debe permitir acceder a recursos de otro usuario.
- No registres tokens, contraseñas, cookies, cabeceras completas, datos financieros o payloads sensibles.
- El admin debe permanecer desactivado por defecto y exigir credenciales configuradas. Las rutas de diagnóstico deben permanecer detrás de `ENABLE_DEBUG_ROUTES` y fuera de producción.
- No uses valores de `.env` en documentación, fixtures ni ejemplos. Usa marcadores inequívocos.
- Evalúa HTTPS, cookies `Secure`, CSRF, CORS restringido, CSP y cabeceras de seguridad para cualquier cambio de despliegue.

## Frontend

- Usa `api` de `frontend/src/api/axiosInstance.ts`; no crees clientes Axios paralelos salvo una necesidad documentada.
- TanStack Query administra estado remoto. Define query keys estables e invalida todas las vistas afectadas después de una mutación; una transacción afecta al menos transacciones, cuentas y dashboard.
- El reducer global se reserva para sesión/usuario. No dupliques allí datos remotos de React Query.
- Las rutas privadas deben pasar por `ProtectedRoute`; las pantallas de autenticación usan `PublicRoute`.
- Todo texto visible nuevo debe tener claves equivalentes en `es.json` y `en.json`. No uses el texto traducido como identificador de negocio.
- Usa imports `type` cuando `verbatimModuleSyntax` lo exige y evita parámetros/imports sin uso.
- Mantén estados de carga, error, vacío y reintento en las vistas que dependen de red.
- No presentes las recomendaciones actuales como inteligencia artificial generativa: son reglas deterministas del backend.

## Backend

- Valida presencia, tipo, rango y pertenencia del usuario antes de mutar datos.
- Ante una excepción después de tocar la sesión, ejecuta `db.session.rollback()` antes de responder.
- No devuelvas detalles internos en errores 500; registra contexto no sensible con `app.logger` o `logging.exception`.
- Evita `except Exception` para errores esperables nuevos; usa errores de validación y base de datos específicos cuando sea posible.
- Ten en cuenta que Flask-Limiter usa almacenamiento en memoria y no coordina límites entre procesos.
- El dashboard emplea `date_trunc`, por lo que las consultas nuevas deben probarse con PostgreSQL.
- Si una operación modifica balances concurrentemente, considera bloqueo de fila o una actualización atómica.

## Archivos generados y datos locales

No agregues ni modifiques intencionalmente:

- `.env` o variantes con secretos.
- `node_modules/`, `frontend/dist/`, caches o archivos `*.tsbuildinfo`.
- `__pycache__/`, `*.pyc`, bases SQLite locales o entornos virtuales.
- `logs/`, coberturas o artefactos temporales.

Algunos artefactos pueden estar presentes o incluso rastreados por el historial. Si una comprobación los cambia, exclúyelos de tu entrega sin descartar cambios previos del usuario.

## Validación antes de entregar

Ejecuta lo pertinente al alcance y comunica tanto éxitos como fallos preexistentes:

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
docker compose -f compose.yaml up --build --wait
CI=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --dir frontend test:e2e
```

Para backend, construye el target `test` o instala `backend/requirements-dev.txt`; valida migraciones y endpoints afectados en PostgreSQL. En cambios de esquema comprueba `flask db upgrade` y, si es reversible, `flask db downgrade`.

Estado base: typecheck, lint, build, auditoría frontend, pruebas unitarias y smoke Docker pasan. La suite todavía no cubre exhaustivamente permisos ni concurrencia financiera; los detalles están en [Estado del proyecto](docs/PROJECT_STATUS.md).

## Actualización documental

- Cambios de instalación, configuración o despliegue: actualiza `README.md` y `docs/DEVELOPMENT.md`.
- Cambios de capas, flujos o modelo: actualiza `docs/ARCHITECTURE.md`.
- Cambios de endpoints o payloads: actualiza `docs/API.md`.
- Funcionalidades terminadas, riesgos resueltos o nuevas limitaciones: actualiza `docs/PROJECT_STATUS.md`.
