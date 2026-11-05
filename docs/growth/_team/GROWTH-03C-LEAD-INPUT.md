# GROWTH-03C — Input de notificación de leads (visibilidad operativa, solo lectura)

**Tarea:** `t2` · **Rol:** growth-engineer · **Fecha de captura:** 2026-11-05 (UTC) · **Repo:** `webtecnoria`
**Ruta asignada:** `MODEL_ASSIGNMENT class: L2 · primary: openrouter-minimax/minimax-m3.1-flash · escalation: deepseek-official/deepseek-v4-pro`
**Restricciones respetadas:** **no** se ha contactado con ningún lead, **no** se ha modificado ninguna fila, **no** se ha enviado ningún correo, **no** se ha ejecutado ningún `sendEmail` ni `notifyLead`, **no** se ha impreso ni registrado ningún PII, **no** se ha ejecutado ningún build ni suite de tests, **no** se ha escrito en `apps/**`.
**Único archivo escrito por esta tarea (además del informe GSC):** este.

---

## 0. Resumen ejecutivo

1. **La capacidad administrativa EXISTE y está desplegada en código**: `GET /api/v1/contact/messages` (lista paginada) y `GET /api/v1/contact/messages/:id` (detalle), ambos con `requireAdmin`, exponiendo `notification_status`, `notification_attempts`, `notified_at` y `notification_error`.
2. **Esa capacidad SÍ expone PII** (nombre, email, teléfono, empresa, mensaje). No es una fuga: es el diseño. **No existe hoy ningún endpoint ni CLI que liste notificaciones fallidas SIN PII.**
3. **Existe una CLI de recuperación** (`apps/api/src/scripts/renotify-leads.ts`) con `--dry-run` y `--limit`, con guardas de reintento, pero **su `--dry-run` solo imprime contadores**: no dice *qué* lead falló (ni id). Para identificar filas concretas hay que usar la API autenticada o SQL.
4. **El panel admin NO ve los leads del formulario web.** `/dashboard/leads` lee la tabla CRM `leads`; el formulario web escribe en `contact_messages`. `grep "contact/messages" apps/web` → **0 coincidencias**. Hoy la visibilidad es API + CLI + SQL.
5. **BLOCKED: la entrega de correo no se puede restaurar sin una acción externa con credenciales.** `EAUTH / 534-5.7.9 WebLoginRequired` es un rechazo de credencial de Google, no un defecto de código. Ninguna modification de este repositorio lo arregla.

---

## 1. Esquema real (no inferido)

`apps/api/migrations/009_contact_reliability.sql` (idempotente, sin `UPDATE` de datos):

| Columna | Tipo | Origen | Significado operativo |
|---|---|---|---|
| `source_page` | `text` | `:10` | página de origen del formulario |
| `idempotency_key` | `text` | `:13` | evita filas duplicadas por doble envío |
| **`notification_status`** | `text NOT NULL DEFAULT 'legacy'` | `:18` | `legacy` \| `pending` \| `sent` \| `failed` |
| **`notification_attempts`** | `int NOT NULL DEFAULT 0` | `:21` | nº de intentos de notificación |
| **`notified_at`** | `timestamptz` | `:24` | instante del **envío aceptado** (NULL si no se envió) |
| **`notification_error`** | `text` | `:27` | **clase** de error (p. ej. `EAUTH`), nunca el texto SMTP |
| `client_hash` | `text` | `:30` | HMAC de la IP (16 hex), no IP |
| `privacy_accepted` | `boolean NOT NULL DEFAULT false` | `:33` | marca de consentimiento (flag, no registro) |
| `user_agent_class` | `text` | `:36` | `desktop`\|`mobile`\|`automated`\|`unknown` |

Índice de operador: `idx_contact_messages_notification ON contact_messages (notification_status, created_at)` (`:45-46`) — existe **exactamente** para la consulta "qué falta notificar, primero lo más antiguo".

**Camino de escritura (medido en el código):** `apps/api/src/routes/v1/contact.ts:207-228` inserta con `notification_status='pending'`; el resultado de la notificación se persiste **después**, en `:295-303` (`notification_status`, `notification_attempts+1`, `notified_at = NOW()` **solo si** `sent`, `notification_error = <clase>` si falló). El `UPDATE` va envuelto en `try/catch` (`:304-311`): si falla, el lead sigue guardado y la respuesta sigue siendo `201`.

**Semántica de estados (medida):**

| `notification_status` | Quem lo escribe | Significado |
|---|---|---|
| `legacy` | DEFAULT de la migración 009 | fila anterior a las notificaciones → **nunca** notificar ni re-notificar |
| `pending` | `contact.ts:211` (literal en el `INSERT`) | guardada, notificación sin resolver |
| `sent` | `contact.ts:299` / `renotify-leads.ts:105` | el transporte aceptó el mensaje |
| `failed` | ídem | el transporte lo rechazó; solo se guarda la **clase** |

**Categoría de error:** `apps/api/src/services/notification.ts:70-82` (`errorClassOf`) acepta `code` o `name` si cumple `/^[A-Za-z0-9_]{1,48}$/`; si no, `UnknownError`. La ruta re-sanitiza lo que devuelve el notificador (`contact.ts:126-128`, `:283`). **Nunca** se guarda el texto de respuesta SMTP (que puede citar direcciones y detalles del servidor).

---

## 2. Capacidad administrativa existente hoy

### 2.1 Endpoint de lista

```
GET /api/v1/contact/messages?limit=20&before=<ISO-8601>
```
`apps/api/src/routes/v1/contact.ts:328-368`

- Autenticación: `requireAdmin` → `requireAuth` (cookie de sesión `env.COOKIE_NAME`) → **`401 {code:"UNAUTHENTICATED"}`** sin sesión, **`403 {code:"FORBIDDEN"}`** si el rol no es `admin` ni `editor` (`apps/api/src/auth/middleware.ts:15-45`). **`editor` también lee PII.**
- `limit`: clamp **1..100**, por defecto **20**. `before`: `created_at < $1`; si la fecha no parsea → `400 {code:"INVALID_INPUT", fields:{before}}`.
- Orden `created_at DESC`. Respuesta: `{ items, nextBefore }`; `nextBefore` = `created_at` del último elemento **solo** si la página vino llena (paginación por cursor).
- **Columnas devueltas:** `id, created_at, name, email, phone, company, service_1, service_2, message, source_page, notification_status, notification_attempts, notified_at, notification_error, privacy_accepted, user_agent_class, client_hash`.
- **No hay filtro por `notification_status`** en el endpoint: el operador debe paginar y filtrar del lado del cliente.

### 2.2 Endpoint de detalle

```
GET /api/v1/contact/messages/:id
```
`contact.ts:370-390` · `requireAdmin` · `200` con la misma fila o `404 {code:"NOT_FOUND"}`.

### 2.3 CLI de recuperación (la que ejecuta el operador autorizado)

`apps/api/src/scripts/renotify-leads.ts`

```bash
node --import tsx apps/api/src/scripts/renotify-leads.ts --dry-run --limit 10   # 1) mirar primero
node --import tsx apps/api/src/scripts/renotify-leads.ts --limit 20              # 2) enviar, por lotes
```

| Guarda | Valor | Ancla |
|---|---|---|
| Corte | `NOTIFY_SINCE = "2026-11-05T00:00:00.000Z"` — nada anterior puede notificarse jamás | `:20` |
| Tope de intentos | `MAX_ATTEMPTS = 3`; con `notification_attempts >= 3` la fila **nunca** se vuelve a seleccionar | `:21`, `:59` |
| Selección | `notification_status IN ('pending','failed') AND notification_attempts < $1 AND created_at >= $2 ORDER BY created_at ASC LIMIT $3` | `:54-64` |
| Lote | `--limit` por defecto **20**, clamp **100** | `:30-37` |
| Un intento por fila y ejecución | `Set` `attempted` | `:78-84` |
| SMTP roto = no-op, no caída | captura → log `renotify_error` → `exitCode 1` → cierra el pool | `:123-138` |
| **Qué imprime el `--dry-run`** | `renotify_scan {count}` y `renotify_would_send {count: notification_attempts}` → **solo contadores, ningún identificador y ningún PII** | `:67-72` |

> **Limitación operativa real:** el `--dry-run` **no identifica qué lead** está pendiente/fallido. Para eso hay que usar §2.1 (API autenticada) o §2.4 (SQL). No existe un modo `--list` sin PII.

### 2.4 SQL de solo lectura equivalente (para el operador del servidor)

```bash
sudo -u postgres psql -d tecnoria -c \
  "select id, created_at, notification_status, notification_attempts, notification_error, notified_at
     from contact_messages
    where notification_status in ('pending','failed')
      and notification_attempts < 3
      and created_at >= '2026-11-05T00:00:00.000Z'
    order by created_at asc;"
```

*(Añadir `name`/`email` solo si el operador lo necesita; no pegar el resultado en tickets, chats ni reports — contiene PII.)*

### 2.5 ¿Está esto desplegado?

- `git ls-tree -r --name-only 894e7c6 -- apps/api` → el commit que **producción ejecuta** (`894e7c6`) **ya contiene** `apps/api/src/services/notification.ts`, `apps/api/src/scripts/renotify-leads.ts` y `apps/api/migrations/009_contact_reliability.sql`.
- El deploy aplica migraciones antes de reiniciar la API (`273fc3f fix(deploy): run migrations inside the permitted script and default MIGRATE to 1`, anterior a `894e7c6`).
- **No he podido verificar el esquema real de la BD de producción** desde esta estación (sin acceso a BD): que las columnas `notification_*` existan en producción debe confirmarlo el operador con la consulta de §2.4. Hasta esa confirmación: **no dar por hecho que las columnas están**.

### 2.6 Lo que NO existe (verificado por ausencia, no por suposición)

| Ausencia | Cómo se verificó | Consecuencia |
|---|---|---|
| **Panel admin de `contact_messages`** | `grep "contact/messages\|notification_status" apps/web` → **0 coincidencias** | Los leads del formulario web **no aparecen** en `/dashboard/leads` (esa pantalla lee la tabla CRM `leads`, alimentada solo por `POST /api/v1/leads`) |
| **Endpoint agregado / sin PII** | `contact.ts` solo expone las dos rutas de §2.1/§2.2, con PII | No hay forma de obtener "cuántas notificaciones fallan" sin exponer datos personales |
| **Alertas** | Ninguna: el logger es de stdout/journald (`apps/api/src/services/logger.ts`) y nada pagina sobre `notification_status='failed'` | Fallo silencioso |
| **Job de retención/borrado** | No existe sobre `contact_messages` | Las filas se acumulan indefinidamente |
| **Seguimiento de envío en `access_requests`** | `apps/api/migrations/002_auth_upgrade.sql:13-23`: la tabla tiene `status` de **revisión** (`pending\|reviewed\|accepted\|rejected`), **ninguna** columna de notificación/entrega | No hay visibilidad de si el email de solicitud de acceso se entregó |

---

## 3. Las cinco preguntas del encargo, respondidas con anclas

| Pregunta | ¿Existe hoy? | Dónde / cómo | ¿Expone PII? |
|---|---|---|---|
| **Leads cuya notificación nunca tuvo éxito** | **Sí** | `notification_status IN ('pending','failed')` + `notified_at IS NULL` + `notification_attempts < 3` + `created_at >= 2026-11-05T00:00:00Z` (índice `idx_contact_messages_notification`). Visible en `GET /api/v1/contact/messages` (§2.1) y en la selección de la CLI (§2.3) | **Sí** en la API y en SQL; **no** en el `--dry-run` (solo contadores) |
| **Intentos de notificación fallidos** | **Sí** | columna `notification_attempts` (contador) y `notification_status='failed'` | Sí (misma fila) |
| **Elegibilidad para reintento** | **Sí, y está codificada** | `MAX_ATTEMPTS = 3` + `created_at >= NOTIFY_SINCE` + `status IN ('pending','failed')` (`renotify-leads.ts:54-64`). Además, 1 intento por fila y ejecución | No por separado (se deduce de la fila) |
| **Categoría del error de notificación** | **Sí** | `notification_error` = **clase** sanitizada (`EAUTH`, `ETIMEDOUT`, `MissingRecipient`, `UnknownError`…) — `notification.ts:70-82`, `contact.ts:107-128` | No (no contiene texto SMTP) |
| **Estado de entrega** | **Sí, con una salvedad** | `sent` **y** `notified_at IS NOT NULL` **y** `notification_error IS NULL` (los tres). `sent` significa "el transporte aceptó el mensaje", **no** "el destinatario lo leyó". En producción **hoy no puede existir `sent`** mientras el SMTP esté roto: la respuesta honesta es `failed` + `EAUTH` | No por separado |

**Respuesta corta a "estado de entrega":** hay **estado de envío aceptado**, no de entrega confirmada. No hay acuse, ni rebote, ni registro de apertura. `sin datos` de entrega real.

---

## 4. Evaluación de exposición de PII (explícita)

| Superficie | PII que devuelve | Control de acceso | Veredicto |
|---|---|---|---|
| `GET /api/v1/contact/messages` | `name`, `email`, `phone`, `company`, `message` (+ `client_hash`, `source_page`, `privacy_accepted`) | `requireAdmin` (rol `admin` **o** `editor`), cookie de sesión | **Expone PII a cualquiera con rol admin o editor.** Diseño intencionado (es el canal de lectura del lead). **Riesgo residual:** `editor` es un rol de contenido, no necesariamente comercial; y **no hay registro de auditoría de quién leyó qué lead**. |
| `GET /api/v1/contact/messages/:id` | la fila completa | `requireAdmin` | Igual. |
| CLI `renotify-leads --dry-run` | **ninguna** (solo `count`) | acceso al servidor + `DATABASE_URL` | **Sin PII.** Pero **sin identificadores**: no permite saber *qué* lead. |
| CLI `renotify-leads` (live) | **no imprime PII** (`renotify_sent`/`renotify_failed` con `count` y `errorClass`), pero **envía** el contenido almacenado del lead al destinatario configurado | requiere credenciales SMTP válidas | Sin PII en consola; envío a `ADMIN_NOTIFICATION_EMAIL`. |
| Logger (`services/logger.ts`) | **Nunca** email, teléfono, mensaje, empresa, nombre, IP cruda ni User-Agent crudo | lista blanca de campos | Correcto por diseño (verificado en el repo: `LEAD-RELIABILITY.md` §6 y sus pruebas). |
| `access_requests` / `password_reset_tokens` | PII propia | `access_requests` **no tiene ninguna API de lectura** en el repo | Sin superficie de lectura; **pero tampoco de entrega** (§2.6). |

**Recomendación de mínimo privilegio (GROWTH-04, no aplicada aquí):** decidir si `editor` debe ver PII de leads; y añadir un endpoint de **agregado sin PII** (`count(*) group by notification_status, notification_error`) para que el operador pueda ver el estado sin abrir filas.

---

## 5. Estado del gate de entrega — BLOCKED

> **BLOCKED: la entrega de notificaciones de leads y de recuperación de contraseña no puede restaurarse desde el repositorio.** El fallo es `EAUTH` / `responseCode 534` / `534-5.7.9 WebLoginRequired` sobre `AUTH PLAIN`: **Google rechaza la credencial**, no la conexión. Verificado el 2026-11-05T01:07:54.464Z con `transporter.verify()` (envío 0 mensajes, sin imprimir credenciales) — `docs/growth/LEAD-RELIABILITY.md` §4.
>
> - El código de transporte (`apps/api/src/services/email.ts:18-26`) coincide **línea por línea** con la línea de sondeo que falla: no hay defecto de código que corregir.
> - **No se puede eliminar el bloqueo desde esta tarea**: la credencial vive fuera del repositorio y solo su propietario puede rotarla o reemplazarla. Referenciar **solo nombres de variable de entorno** (§6).
> - Mientras siga bloqueado: cada lead nuevo se guarda con `notification_status='failed'`, `notification_error='EAUTH'`, `notification_attempts=1`, `notified_at=NULL`. **El lead no se pierde; la notificación sí.**

**Defectos adyacentes, ambos con la misma causa raíz (SMTP), registrados y **no** corregidos aquí:**

| ID | Defecto | Ancla | Efecto |
|---|---|---|---|
| **D1** | `POST /api/v1/auth/access-request` inserta la fila y **después** espera dos `sendEmail`; el fallo cae en el `catch` y la ruta responde **`502`** — **con la fila ya persistida** | `apps/api/src/routes/v1/auth.ts:119-169` (insert + 2 envíos), `:180-183` (502) | El usuario ve un error, reintenta y **crea una fila duplicada**. Sin estado de entrega en `access_requests` → **ceguera total**. |
| **D2** | `POST /api/v1/auth/password-recovery` responde **`202`** tanto si el correo salió como si falló | `auth.ts:209` (`await sendEmail`), `:225-229` (`202`) | **Fallo silencioso**: ni el usuario ni el operador se enteran de que el correo no salió. La recuperación de contraseña está muerta mientras SMTP esté roto. |

---

## 6. Checklist de remediación para el propietario autorizado de SMTP

> Todas las referencias son **nombres de variable de entorno**. **No** registrar ni pegar valores. Entorno del servidor: `/etc/tecnoria/api.env` (cargado por `apps/api/src/config/env.ts`, que valida la presencia de todas al arrancar: si falta una, la API no arranca).

| # | Paso | Acción | Verificación | Resultado esperado |
|---|---|---|---|---|
| 1 | Diagnosticar | Confirmar en el servidor los **nombres** presentes: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_NOTIFICATION_EMAIL` (declarados en `apps/api/src/config/env.ts:13-18`) | `sudo grep -E '^(SMTP_HOST\|SMTP_PORT\|SMTP_USER\|SMTP_FROM\|ADMIN_NOTIFICATION_EMAIL)=' /etc/tecnoria/api.env` — **sin leer ni mostrar `SMTP_PASS`** | Los 6 nombres presentes |
| 2 | Rotar credencial (vía A, Gmail) | El propietario habilita verificación en 2 pasos y genera una **contraseña de aplicación**; actualiza el **valor** de `SMTP_PASS` en `/etc/tecnoria/api.env` | Mantener `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_FROM`/`ADMIN_NOTIFICATION_EMAIL` | Credencial nueva |
| 3 | Rotar credencial (vía B, proveedor transaccional) | Migrar a un proveedor transaccional con API keys y configurar **SPF + DKIM + DMARC** para `tecnoriasl.com`; actualizar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Registros DNS publicados | Entrega con trazabilidad |
| 4 | **Reiniciar** la API | `sudo systemctl restart tecnoria-api` (acción programada y aprobada; nunca reiniciar Postgres/nginx/Cloudflare) | `systemctl is-active tecnoria-api` | `active` |
| 5 | Verificar **sin enviar** | `transporter.verify()` con `SMTP_USER`/`SMTP_PASS` — envía 0 mensajes | Salida esperada: `VERIFY_RESULT=OK` (hoy: `FAILED`, `error_code=EAUTH`, `responseCode=534`) | Credencial aceptada |
| 6 | Enviar **una** prueba controlada | Un único envío al buzón de `ADMIN_NOTIFICATION_EMAIL` | Confirmación de recepción por el operador | Correo recibido |
| 7 | Re-lanzar notificaciones pendientes | Primero `node --import tsx apps/api/src/scripts/renotify-leads.ts --dry-run --limit 10` (sin escrituras); después `--limit 20` en lotes | Logs `renotify_sent` / `renotify_failed`; en BD: `notification_status='sent'`, `notified_at IS NOT NULL`, `notification_error IS NULL` | Notificaciones entregadas |
| 8 | Confirmar cobertura | `GET /api/v1/contact/messages` (autenticado) y comprobar `notification_status`/`notified_at` de las filas posteriores al corte | Sin filas en `failed`/`pending` con `attempts < 3` | Cola vacía |
| 9 | Cerrar D1 / D2 | Con SMTP sano, verificar que `POST /api/v1/auth/access-request` deja de devolver `502` y que `password-recovery` entrega el enlace | Pruebas sobre un buzón de control | Sin errores |
| 10 | **No** notificar las filas históricas | Las filas anteriores al corte son `legacy` y están excluidas por diseño (DEFAULT de 009 + `created_at >= NOTIFY_SINCE`). La evidencia del repo fija **17 filas** (`docs/growth/LEAD-RELIABILITY.md` §5.3): confirmarlo en vivo, no darlo por hecho | `select count(*) from contact_messages where notification_status='legacy'` | 17 según la evidencia del repo; confirmar en la BD |
| 11 | Registrar | Anotar fecha, variables **cambiadas por nombre**, resultado de `verify()` y del envío de prueba | En el runbook del operador | Trazabilidad |

> **Ningún paso de esta lista se ha ejecutado en esta tarea.** La tarea es de lectura; ejecutar los pasos 2, 4 y 7 **modifica producción y envía correo a leads reales** → requiere autorización explícita del propietario.

---

## 7. Backlog técnico derivado (GROWTH-04 decide; nada implementado aquí)

| # | Gap | Evidencia | Nota de riesgo |
|---|---|---|---|
| L1 | No existe vista de estado **sin PII** (agregado por `notification_status`/`notification_error`) | `contact.ts` solo expone filas completas | Cambio pequeño, solo lectura; reduce la necesidad de abrir PII |
| L2 | El panel admin **no** muestra los leads del formulario web | `grep` → 0 coincidencias con `contact_messages` en `apps/web` | **Decisión de negocio**: ¿el lead web debe entrar en el pipeline CRM (`leads`)? Hoy son dos planos separados |
| L3 | Sin auditoría de quién leyó qué lead | No hay tabla/registro de acceso a `contact/messages` | Relevante para datos personales |
| L4 | `access_requests` sin estado de entrega (y `D1` devuelve 502 tras insertar) | `002_auth_upgrade.sql:13-23`, `auth.ts:180` | Reutilizar el patrón `notification_*` de `contact_messages` |
| L5 | `password-recovery` responde `202` aunque el envío falle (`D2`) | `auth.ts:225` | Al menos registrar el resultado; idealmente el mismo esquema de estados |
| L6 | Sin alerta alguna sobre `notification_status='failed'` | `LEAD-RELIABILITY.md` §10.4 | Alertado = credenciales/canal nuevos → **BLOCKED** sin autorización |
| L7 | `editor` puede leer PII de leads | `auth/middleware.ts:37-45` | Decisión de mínimo privilegio |
| L8 | Sin job de retención sobre `contact_messages` | `LEAD-RELIABILITY.md` §6.2 | Implica política de privacidad; bloqueada por H-2 (aprobación legal) |

---

## 8. Registro de comandos y lecturas (todos de solo lectura)

| # | Acción | Resultado |
|---|---|---|
| 1 | `read apps/api/src/services/notification.ts` | Semántica de estados, sanitización de clase de error (`EAUTH`…), `LEAD_SUBJECT` constante, import diferido del transporte |
| 2 | `read apps/api/src/routes/v1/contact.ts` | Inserción con `pending` → notificación → persistencia del resultado → `201`; las dos rutas admin (`/messages`, `/messages/:id`) con sus columnas y clamps |
| 3 | `read apps/api/src/auth/middleware.ts` | `requireAuth` (cookie) → `401`; `requireAdmin` → `403`; roles `admin`/`editor` |
| 4 | `read apps/api/src/scripts/renotify-leads.ts` | Guardas de reintento, corte, tope de intentos, eventos de log, y que el `--dry-run` **no** imprime identificadores |
| 5 | `read apps/api/src/routes/v1/auth.ts` (`:110-237`) | `access-request` (insert + 2 `sendEmail` + `502`) y `password-recovery` (`202` incondicional) |
| 6 | `read apps/api/src/services/email.ts` + `apps/api/src/config/env.ts` | Transporte nodemailer con `SMTP_HOST/PORT/USER/PASS/FROM` + `ADMIN_NOTIFICATION_EMAIL`; validación de entorno al arrancar |
| 7 | `read apps/api/migrations/009_contact_reliability.sql` | Las 9 columnas de fiabilidad + 2 índices; **sin** `UPDATE` de datos |
| 8 | `read apps/api/migrations/002_auth_upgrade.sql` (`:13-23`) | `access_requests` sin columnas de entrega |
| 9 | `grep "contact/messages\|notification_status" apps/web` | **0 coincidencias** → no hay panel admin de leads del formulario |
| 10 | `git ls-tree -r --name-only 894e7c6 -- apps/api` | El commit de producción contiene `notification.ts`, `renotify-leads.ts` y `009_contact_reliability.sql` |
| 11 | `read docs/growth/LEAD-RELIABILITY.md` | Evidencia SMTP verbatim (`EAUTH`/`534`/`534-5.7.9`), runbook, postura de PII, ausencia de alertas y de retención |

**No ejecutado (y no permitido aquí):** `sendEmail`, `notifyLead`, `renotify-leads` (ni en `--dry-run`, porque abre la BD de producción), `psql` sobre producción, cualquier build o suite de tests.

---

## 9. Nota de honestidad

- Ninguna cifra de este informe procede de la base de datos de producción: **no hay acceso a ella desde esta estación**. Los únicos números son los del código, del esquema y de la evidencia ya registrada en el repo.
- Ningún PII aparece en este documento (ni nombres, ni emails, ni teléfonos, ni mensajes).
- `SMTP_PASS` y cualquier otro valor de credencial **no** se imprime, no se cita y no se escribe; solo se nombran las variables.
- Estado final de la capacidad de entrega: **BLOCKED** hasta que el propietario autorizado ejecute la §6.
