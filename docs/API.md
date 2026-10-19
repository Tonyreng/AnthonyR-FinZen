# Referencia de la API

Esta referencia documenta los contratos implementados en el árbol de trabajo analizado. Todos los blueprints usan el prefijo `/api`. La API no está versionada y sus errores usan generalmente:

```json
{
  "msg": "Descripción del error"
}
```

## Autenticación

Las rutas marcadas como protegidas esperan:

```http
Authorization: Bearer <access-token>
```

El access token se devuelve en JSON. El refresh token se instala como cookie HttpOnly mediante Flask-JWT-Extended y requiere que el cliente envíe credenciales. Los callbacks JWT responden `401` con uno de estos mensajes:

- `Token has expired`
- `Invalid token`
- `Missing token`

El interceptor frontend solo intenta renovar automáticamente ante el primero.

## Resumen de endpoints

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Estado básico de la API. |
| `GET` | `/api/ready` | No | Comprueba que PostgreSQL responde. |
| `POST` | `/api/user/login` | No | Inicia sesión y crea tokens. |
| `POST` | `/api/user/refresh_token` | Refresh cookie | Renueva el access token. |
| `POST` | `/api/user/logout` | No | Elimina cookies JWT. |
| `GET` | `/api/user/accounts` | Access token | Lista cuentas del usuario. |
| `POST` | `/api/user/accounts` | Access token | Crea una cuenta. |
| `GET` | `/api/user/categories` | Access token | Lista categorías del usuario. |
| `GET` | `/api/user/transactions` | Access token | Lista y filtra transacciones. |
| `POST` | `/api/user/transactions` | Access token | Crea ingreso/gasto general y actualiza balance. |
| `GET` | `/api/user/dashboard` | Access token | Devuelve el resumen financiero. |

No existe un endpoint de registro, perfil, edición o eliminación. Los modelos de suscripciones, deudas, préstamos, recordatorios y reportes tampoco tienen endpoints públicos.

## Salud

### `GET /api/health`

Respuesta `200`:

```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### `GET /api/ready`

Ejecuta `SELECT 1` contra la base configurada. Responde `200` cuando está disponible:

```json
{
  "status": "ready",
  "database": "ok"
}
```

Si la conexión falla hace rollback y responde `503` sin exponer el error interno:

```json
{
  "status": "not_ready",
  "database": "error"
}
```

## Sesión

### `POST /api/user/login`

Límite específico: 5 solicitudes por minuto según IP. El limiter global también aplica 200 por día y 50 por hora, usando almacenamiento en memoria.

Cuerpo:

```json
{
  "email": "usuario@example.com",
  "password": "contraseña-del-usuario",
  "rememberMe": true
}
```

- El correo se normaliza con `trim` y minúsculas.
- `rememberMe=true` da al refresh token una duración de 30 días; en otro caso dura 6 horas.
- El access token dura 15 minutos.

Respuesta `200` y cabecera `Set-Cookie`:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": 1,
    "full_name": "Nombre de ejemplo",
    "email": "usuario@example.com",
    "currency": "COP",
    "created_at": "2026-01-01T12:00:00+00:00"
  },
  "msg": "Login successful"
}
```

Errores observables:

- `400`: faltan correo o contraseña.
- `401`: credenciales inválidas.
- `429`: se excedió el límite.
- `500`: error no controlado de infraestructura o aplicación. Un cuerpo ausente se trata como credenciales faltantes (`400`).

### `POST /api/user/refresh_token`

Requiere una refresh cookie JWT válida. No recibe cuerpo funcional.

Respuesta `200`:

```json
{
  "msg": "Access token refreshed",
  "access_token": "<jwt>",
  "user": {
    "id": 1,
    "full_name": "Nombre de ejemplo",
    "email": "usuario@example.com",
    "currency": "COP",
    "created_at": "2026-01-01T12:00:00+00:00"
  }
}
```

Posibles respuestas: `401` para refresh inválido/ausente o fallo capturado, y `404` si el usuario ya no existe.

Con `JWT_COOKIE_CSRF_PROTECT=true`, Flask exige doble envío: la cookie legible `csrf_refresh_token` y el encabezado `X-CSRF-TOKEN` con el mismo valor. Axios está configurado con esos nombres. Sin el encabezado, la respuesta esperada es `401`.

### `POST /api/user/logout`

Elimina las cookies JWT del response. No exige token.

```json
{
  "msg": "Logout successful"
}
```

## Cuentas

### Forma de una cuenta

```json
{
  "id": 10,
  "user_id": 1,
  "name": "Cuenta principal",
  "balance": "1250.50",
  "type": "bank",
  "created_at": "2026-01-01T12:00:00+00:00"
}
```

Valores de `type`: `bank`, `cash`, `credit_card`, `savings`, `virtual_wallet`, `investment`, `pension`, `other`.

### `GET /api/user/accounts`

Protegido. Devuelve únicamente cuentas cuyo `user_id` corresponde al JWT, ordenadas por creación descendente.

```json
{
  "accounts": []
}
```

### `POST /api/user/accounts`

Protegido. Cuerpo:

```json
{
  "name": "Cuenta principal",
  "type": "bank",
  "balance": "1250.50"
}
```

- `name` no puede quedar vacío.
- `type` debe pertenecer al enum anterior.
- `balance` es opcional y toma `0`; debe ser decimal válido y no negativo.
- La base de datos exige nombre único dentro de cada usuario.

Respuesta `201`:

```json
{
  "msg": "Account created successfully",
  "account": {
    "id": 10,
    "user_id": 1,
    "name": "Cuenta principal",
    "balance": "1250.50",
    "type": "bank",
    "created_at": "2026-01-01T12:00:00+00:00"
  }
}
```

Validaciones conocidas responden `400`; conflictos de unicidad terminan actualmente en `500` porque no tienen manejo específico.

## Categorías

### `GET /api/user/categories`

Protegido. Ordena por tipo y nombre.

```json
{
  "categories": [
    {
      "id": 5,
      "user_id": 1,
      "name": "Alimentación",
      "type": "expense"
    }
  ]
}
```

`type` solo puede ser `income` o `expense`. No hay endpoint para crear categorías; deben existir previamente en la base de datos.

## Transacciones

### Forma de una transacción listada

```json
{
  "id": 25,
  "account_id": 10,
  "user_id": 1,
  "category_id": 5,
  "subscription_id": null,
  "type": "general",
  "amount": "45.90",
  "description": "Compra de ejemplo",
  "date": "2026-01-15T00:00:00+00:00",
  "is_recurring": false,
  "account": {
    "id": 10,
    "user_id": 1,
    "name": "Cuenta principal",
    "balance": "1204.60",
    "type": "bank",
    "created_at": "2026-01-01T12:00:00+00:00"
  },
  "category": {
    "id": 5,
    "user_id": 1,
    "name": "Alimentación",
    "type": "expense"
  },
  "subscription": null,
  "debt": null,
  "loan_given": null
}
```

`type` puede ser `general`, `subscription`, `debt_payment` o `loan_payment`, aunque el endpoint de creación actual siempre genera `general`.

### `GET /api/user/transactions`

Protegido. Parámetros opcionales:

| Parámetro | Formato | Comportamiento |
| --- | --- | --- |
| `search` | string | Coincidencia parcial, sin distinguir mayúsculas, sobre `description`. |
| `category_id` | entero | Filtra por categoría. |
| `date` | `YYYY-MM-DD` | Compara la parte de fecha. |
| `type` | `income` o `expense` | Filtra por el tipo de la categoría, no por `Transaction.type`. |

Devuelve todas las coincidencias sin paginación, ordenadas por fecha e ID descendentes:

```json
{
  "transactions": []
}
```

Filtros inválidos responden `400`.

### `POST /api/user/transactions`

Protegido. Cuerpo usado por el frontend:

```json
{
  "amount": "45.90",
  "category_id": 5,
  "date": "2026-01-15",
  "description": "Compra de ejemplo",
  "category_type": "expense",
  "account_id": 10
}
```

Reglas:

- `category_id` es obligatorio, debe existir y pertenecer al usuario.
- `account_id` debe existir y pertenecer al usuario. Si se omite, se usa la cuenta más antigua del usuario.
- `amount` debe ser decimal y mayor que cero.
- `date` es opcional; acepta `YYYY-MM-DD` y se interpreta a medianoche UTC. Si falta se usa el instante actual UTC.
- `description` es opcional para la API aunque el formulario actual la exige.
- `category_type` es opcional; si contiene `income` o `expense`, debe coincidir con la categoría. Otros valores se ignoran en vez de rechazarse.
- Un gasto no puede superar el balance actual de la cuenta.

Efecto atómico pretendido:

- Ingreso: suma `amount` al balance.
- Gasto: resta `amount` al balance.
- Crea una transacción `general`, no recurrente, y confirma ambos cambios juntos.

Respuesta `201`:

```json
{
  "msg": "Transaction created successfully",
  "transaction": {}
}
```

El objeto `transaction` usa la forma completa mostrada arriba. Validaciones responden `400`, recursos ajenos o inexistentes responden `404` y errores inesperados responden `500` tras rollback.

## Dashboard

### `GET /api/user/dashboard`

Protegido. Respuesta `200`:

```json
{
  "total_balance": "1204.60",
  "income_month": "3000.00",
  "income_trend": [
    { "month": "Jan", "total": "3000.00" }
  ],
  "expense_month": "1795.40",
  "expense_trend": [
    { "month": "Jan", "total": "1795.40" }
  ],
  "upcoming_payments": [
    {
      "id": 3,
      "name": "Servicio de ejemplo",
      "price": "25.00",
      "payment_date": "2026-01-25T00:00:00+00:00"
    }
  ],
  "ai_recommendations": {
    "health_score": 10,
    "status": "healthy",
    "alerts": [],
    "recommendations": []
  }
}
```

Notas del contrato:

- Tendencias agrupan aproximadamente los últimos cinco meses y usan abreviaturas de mes producidas por Python.
- Próximos pagos devuelve como máximo cinco suscripciones activas con `payment_date` anterior al límite de 30 días; no excluye explícitamente vencidas.
- `health_score` es un puntaje de riesgo: mayor implica peor estado.
- `ai_recommendations` se calcula mediante reglas deterministas, no mediante un servicio de IA.
- Las consultas de tendencia requieren PostgreSQL por el uso de `date_trunc`.

## Rutas condicionales y no contractuales

Con `ENABLE_DEBUG_ROUTES=true` existen:

- `GET /api/debug/token`: refleja información de cabeceras y no debe habilitarse en producción.
- `GET /api/debug/protected`: comprueba un access token.

`GET /` devuelve JSON informativo en desarrollo. En producción, `/` y cualquier ruta GET no encontrada intentan servir el SPA desde un directorio estático del backend; el despliegue Docker actual sirve el SPA mediante Nginx.

Flask-Admin usa `/admin/` cuando `ENABLE_ADMIN=true`, pero no forma parte de la API pública.
