# GROWTH-03C — Riesgo de entrega de leads

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Fecha:** 2026-11-05 · Análisis de sólo lectura sobre `apps/api` (detalle en
`docs/growth/_team/GROWTH-03C-LEAD-INPUT.md`).

> **Estado del gate de entrega de correo: BLOQUEADO.** No lo arregla ningún cambio en el
> repositorio. `EAUTH 534-5.7.9 WebLoginRequired` es un **rechazo de credencial** del proveedor
> SMTP, no un defecto de código.

---

## 1. Qué está roto y qué no

| Aspecto | Estado real |
|---|---|
| Persistencia del lead | **Funciona.** El formulario escribe la fila con idempotencia y protección anti-abuso |
| Notificación por correo | **Fallando.** El transporte rechaza la autenticación; el lead queda guardado y sin avisar |
| Recuperación de contraseña por correo | **Fallando** por la misma causa |
| Datos de leads existentes | **Intactos.** No se ha modificado, duplicado ni contactado a ningún lead |
| PII en logs, informes o artefactos | **Ninguna.** Verificado en los entregables de este hito |

**Crear una fila no significa que el negocio haya recibido el aviso.** El estado `sent` con
`notified_at` significa que el transporte **aceptó** el mensaje; no hay confirmación de entrega.

## 2. Capacidad administrativa que ya existe (en producción, `894e7c6`)

No hace falta construir nada para saber qué leads están sin notificar. Ya existe:

| Capacidad | Detalle |
|---|---|
| `GET /api/v1/contact/messages?limit=&before=` | Cursor por `created_at`, `limit` acotado 1..100 |
| `GET /api/v1/contact/messages/:id` | Detalle de un lead |
| Autorización | `requireAdmin` → `401 UNAUTHENTICATED` / `403 FORBIDDEN`; roles `admin` **y** `editor` |
| Campos de estado | `notification_status` (`legacy|pending|sent|failed`), `notification_attempts`, `notified_at`, `notification_error` |
| Categoría de error | Sólo clase saneada: `EAUTH`, `ETIMEDOUT`, `MissingRecipient`, `UnknownError`. Nunca el texto SMTP |
| Índice | `idx_contact_messages_notification` (esquema `009_contact_reliability.sql`) |
| Reintento | CLI `renotify-leads.ts`: `NOTIFY_SINCE=2026-11-05T00:00:00.000Z`, `MAX_ATTEMPTS=3`, estados `pending|failed`, **1 intento por fila y ejecución** |

### Dos límites reales que el operador debe conocer

1. **La API devuelve PII** (nombre, email, teléfono, empresa, mensaje). No existe ningún endpoint
   agregado sin datos personales. Cualquier consulta de estado expone PII a `admin`/`editor`, que es
   el nivel de autorización previsto, pero conviene saberlo antes de compartir una captura.
2. **El panel de administración no muestra `contact_messages`**: `/dashboard/leads` lee la tabla CRM
   `leads`, que el formulario web **no** alimenta. La visibilidad real es API + CLI + SQL.
3. `renotify-leads.ts --dry-run` imprime **sólo contadores**: no dice *qué* lead falló. Para saberlo
   hay que usar la API autenticada o una consulta SQL de sólo lectura.

## 3. Consulta de sólo lectura para el operador

Con la sesión de administrador, `GET /api/v1/contact/messages?limit=100` y filtrar por
`notification_status in (pending, failed)` **o** `notification_error is not null`. Si se prefiere SQL
directo (sólo lectura, sin exportar PII fuera del servidor):

```sql
SELECT notification_status, count(*)
FROM contact_messages
GROUP BY notification_status;
```

No se incluye ninguna consulta que devuelva PII en este documento, y no se ha ejecutado ninguna
consulta sobre datos reales en este hito.

## 4. Checklist de remediación para el propietario autorizado de SMTP

Referencia **sólo por nombre de variable**; nunca se pide ni se imprime el valor.

1. Confirmar que la cuenta `SMTP_USER` sigue existiendo y que el proveedor no exige
   "app password" / login por web (origen de `534-5.7.9 WebLoginRequired`).
2. Rotar `SMTP_PASS` en el proveedor y actualizarla **sólo** en `/etc/tecnoria/api.env`.
3. Verificar `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` y `ADMIN_NOTIFICATION_EMAIL`.
4. Alternativa recomendada a medio plazo: proveedor transaccional con SPF, DKIM y DMARC.
5. `systemctl restart tecnoria-api` para recargar el entorno.
6. Validar el transporte **sin enviar** (`transporter.verify()`), nunca con un correo a un lead.
7. Un único envío de prueba a una dirección interna del propietario.
8. Ejecutar `renotify-leads.ts` (por lotes, respetando `MAX_ATTEMPTS=3`).
9. Confirmar cobertura: contar filas con `notification_error is null` frente al total.
10. **No** tocar las filas con `notification_status='legacy'`: son anteriores al esquema de estados.
11. Registrar la intervención con fecha, operador y resultado.

## 5. Mejora propuesta (GROWTH-04, no implementada aquí)

- `GET /api/v1/contact/messages/notification-summary`: agregado **sin PII** (conteos por estado y por
  clase de error) para vigilancia operativa diaria.
- `renotify-leads.ts --dry-run --verbose`: listar identificadores y clase de error de los candidatos.
- Alerta cuando `pending` supere un umbral durante N minutos.

Ninguna de las tres se ha implementado en GROWTH-03C: la primera añade una superficie autenticada
nueva y habría invalidado la revisión independiente ya en curso; las otras dos dependen de que el
transporte vuelva a funcionar para poder verificarse de extremo a extremo.

## 6. Lo que este documento no hace

- No afirma que la entrega de correo esté restaurada.
- No inventa credenciales ni pide valores.
- No ha contactado, modificado ni exportado ningún lead.
