# Estado del proyecto

Fecha de la revisión: **18 de octubre de 2026**. Rama de estabilización: `recovery/docker-stabilization`, recuperada desde `origin/feature/Transactions` para resolver la rama local vacía causada por diferencia de mayúsculas.

## Capacidades actuales

| Área | Estado | Evidencia funcional |
| --- | --- | --- |
| Login, refresh y logout | Implementado | Access JWT en memoria, refresh HttpOnly y doble envío CSRF probado a través de Nginx. |
| Cuentas | Implementado básico | Listado y creación; no hay edición ni eliminación. |
| Categorías | Solo lectura/seed | Listado protegido y seed parametrizado; no hay CRUD público. |
| Transacciones | Implementado básico | Filtros y creación de ingresos/gastos; balance y transacción se confirman juntos con bloqueo de la cuenta. |
| Dashboard | Implementado | Totales, tendencias, próximos pagos y reglas deterministas de salud financiera. |
| Internacionalización | Implementado parcial | Español/inglés en vistas principales; quedan textos sin traducir. |
| Administración | Opcional | Flask-Admin desactivado por defecto y protegido cuando se habilita. |
| Registro | Placeholder | `/signup` no registra y no existe endpoint. |
| Suscripciones, deudas y préstamos | Dominio parcial | Modelos/migraciones, sin flujo completo de API y UI. |
| Recordatorios, reportes y notificaciones | Dominio parcial | Modelos o elementos visuales, sin producto completo. |
| “IA” | Nombre anticipado | Las recomendaciones son reglas del backend; no existe integración con modelos de IA. |

La navegación aún contiene destinos simulados y la raíz conserva contenido de ejemplo. No deben presentarse como capacidades terminadas.

## Progreso de la hoja de ruta

### Fase 0 — línea base Git

- Respaldo privado verificable creado fuera del repositorio: archivo del workspace incluyendo `.git` y `.env`, más `git bundle` completo de las referencias.
- Working tree preservado; solo se restableció el índice para recuperar un `HEAD` válido.
- `__pycache__`, `*.pyc` y `*.tsbuildinfo` dejaron de estar rastreados y están ignorados.
- Los cambios quedaron organizados en commits temáticos, el árbol quedó limpio y se creó el punto recuperable `monolith-pre-split-v1`.

### Fase 1 — Docker reproducible

Implementado:

- `compose.yaml` productivo y `compose.override.yaml` de desarrollo.
- Contextos Docker de aproximadamente cientos de KB mediante `Dockerfile.dockerignore`, frente al contexto anterior dominado por `node_modules`.
- Backend multi-stage, Gunicorn, usuario UID 10001, `/api/ready` y target de tests.
- Frontend multi-stage, pnpm fijado, rutas lazy, Nginx no privilegiado en `8080` y proxy `/api` same-origin.
- Healthchecks y dependencias por `service_healthy`/`service_completed_successfully`; migraciones Alembic one-shot.
- PostgreSQL persistente y sin credenciales fijas en YAML.
- CSRF de refresh integrado y comprobado; dashboard invalidado tras crear transacciones.
- Scripts de setup/seed parametrizados, sin credenciales ni identidades personales incrustadas.
- Pruebas mínimas con pytest, Vitest y Playwright.
- CI con acciones fijadas por SHA y publicación GHCR multi-arquitectura mediante `GITHUB_TOKEN`.

Pendiente para considerar producción real:

- Probar la workflow de publicación con un tag semántico; la CI de rama ya pasó, pero no se publicaron imágenes GHCR.
- Ampliar tests de permisos, cálculos, migraciones, concurrencia y fallos de PostgreSQL.
- Probar cookies `Secure`, HTTPS, CSP/HSTS y rollback en el proxy/host real.
- Auditar dependencias Python y definir política de actualización de imágenes base.

### Fase 2 — separación de repositorios

Ejecutada localmente desde clones limpios del tag `monolith-pre-split-v1` con `git-filter-repo`. Los repositorios hermanos `AnthonyR-FinZen-frontend`, `AnthonyR-FinZen-backend` y `AnthonyR-FinZen-infra` conservan el historial relevante, se construyen de forma aislada y pasaron el smoke integrado. Falta crear/publicar los remotos y observar CI porque GitHub CLI no está instalado/autenticado en este entorno.

### Fase 3 — Django v2

No iniciada intencionalmente. Flask v1 debe permanecer como rollback mientras Django/DRF se construye bajo `/api/v2`, con OpenAPI primero, sesión HttpOnly/CSRF estándar y una base PostgreSQL nueva sin importar datos v1. La versión LTS concreta se elegirá al comenzar esta fase.

## Hallazgos prioritarios vigentes

### Prioridad 0

- La cobertura automatizada es inicial; todavía no demuestra aislamiento estricto entre usuarios ni consistencia bajo transacciones concurrentes.
- El despliegue real carece de TLS/CSP/HSTS y de una prueba de rollback operativa. Nginx sí añade `nosniff`, referrer policy, protección contra framing y permissions policy.

### Prioridad 1

- Flask-Limiter usa `memory://`; varios workers o réplicas no comparten contadores.
- Varias rutas capturan `Exception` y algunos conflictos de integridad terminan como errores genéricos.
- La UI necesita categorías, pero un usuario nuevo depende del seed porque no hay onboarding/CRUD de categorías.
- Los textos de recomendaciones vienen acoplados desde backend en lugar de códigos estables traducibles.

### Prioridad 2

- `models.py` y el dashboard concentran demasiadas responsabilidades.
- Persisten módulos simulados, textos sin i18n y nombres de “IA” que no describen la implementación real.
- El fallback SQLite sigue siendo engañoso para el producto completo; PostgreSQL es el único motor soportado.

## Validaciones observadas

| Comprobación | Resultado |
| --- | --- |
| Sintaxis Python | Correcta para todos los archivos backend. |
| Pytest en imagen Python 3.11 | **3 passed**; hay warnings deprecados de Flask-Admin/pkg_resources. |
| ESLint | Correcto. |
| TypeScript estricto sin emitir | Correcto. |
| Vitest | **2 passed**. |
| Build Vite | Correcto; rutas y vendors se dividen en chunks. |
| `pnpm audit --audit-level moderate` | Sin vulnerabilidades conocidas. |
| Compose base y base+override | Configuración válida. |
| `docker compose -f compose.yaml up --build --wait` | Correcto después de reintentar un timeout transitorio al descargar Node. |
| Migración Alembic | Servicio finalizó correctamente; revisión actual `4592067c7a74`. |
| Health/readiness vía Nginx | `200`; PostgreSQL responde. |
| Usuarios de contenedor | Backend UID 10001; frontend nginx UID 101. |
| Refresh CSRF | Con token `200`; sin encabezado `401`. |
| Persistencia PostgreSQL | Usuario de smoke conservado tras recrear contenedores sin borrar volumen. |
| Playwright contra Docker | **1 passed**. |
| GitHub Actions en `recovery/docker-stabilization` | **Correcta** en backend, frontend y smoke Docker tras alinear Node 24. |

Los resultados son una fotografía local; CI debe confirmarlos desde un clon limpio. El volumen usado en smoke contiene solo datos descartables de prueba y no debe confundirse con datos productivos.

## Próximos pasos recomendados

1. Publicar la rama/tag, ejecutar CI y corregir cualquier diferencia del runner Linux/GHCR.
2. Añadir pruebas PostgreSQL de autorización y concurrencia antes de declarar la Fase 1 cerrada.
3. Crear y publicar los tres repositorios GitHub y validar sus workflows.
4. Archivar el monorepo solo cuando frontend, backend e infraestructura funcionen aislados y el rollback esté documentado.
5. Diseñar y aprobar OpenAPI v2 antes de iniciar Django.
