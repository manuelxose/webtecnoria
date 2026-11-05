# GROWTH-02 — Entrega final

**Proyecto:** TECNORIA — tecnoriasl.com
**Hito:** `TECNORIA-GROWTH-02` — medición, consentimiento, fiabilidad de leads y visibilidad en buscadores
**Fecha:** 2026-11-05
**Veredicto:** **PASS CON HALLAZGOS ABIERTOS Y DOS BLOQUEOS EXTERNOS**

---

## 1. Resultado en una frase

El defecto crítico de producción —Google Analytics cargándose antes de cualquier consentimiento— está
corregido y **demostrado contra producción con navegador real**, el tracking de leads ya llega a GA4 con
evidencia capturada, y el formulario de contacto se ha convertido en un pipeline fiable y resistente al
abuso probado de extremo a extremo. La notificación de leads sigue **bloqueada por una credencial SMTP
caducada**, que es una acción del titular, no de ingeniería.

---

## 2. Verificación del handoff recibido

El estado reportado por GROWTH-01 se comprobó contra el repositorio y el servidor, sin darlo por bueno:

| Comprobación | Resultado |
|---|---|
| Commit desplegado | `3c7cdb9` (HEAD del servidor era `6b86ab0`, 3 commits de documentación después) |
| Release activa al inicio | `20261105_012220` |
| Servicios | web, api, nginx, postgresql → `active` |
| Sitemap | 32 URLs, coincidente con `PUBLIC_PATHS` |
| `npm run test:seo` | Pasaba 32 rutas |

El handoff era exacto en lo que describía. **No describía dos defectos de producción** que este hito
corrige: analítica sin consentimiento, y leads que se guardaban sin avisar a nadie (17 filas reales, la
más reciente `2026-10-16`, sin ruta de notificación en el código).

---

## 3. Trabajo completado

### 3.1 Consentimiento (prioridad crítica)

- Etiqueta de GA4 incondicional **eliminada** de `index.html`. Sustituida por Consent Mode v2 en modo
  básico: las cuatro señales en `denied`, y `window.__tecnoriaLoadAnalytics()` definido pero **nunca
  invocado** en el arranque.
- `ConsentService` es el **único punto de entrada**: resuelve `tecnoria.consent.v1` con
  `parseConsentRecord` (versión, tipos, fecha ilegible, 60 s de desfase, caducidad de 730 días) y solo
  entonces carga analítica.
- Interfaz accesible: Aceptar / Rechazar / Configurar con la misma clase visual, sin categorías
  preseleccionadas, foco gestionado, trampa de Tab, Escape que no otorga, restauración de foco, y control
  permanente de reapertura en todas las rutas.
- Retirada del consentimiento: borra el registro, purga `_ga`, `_ga_<id>`, `_gid`, `_gat*`, `_gcl_*`
  incluyendo el dominio `.tecnoriasl.com`, y activa el interruptor `ga-disable-<id>`.
- Categoría de **publicidad eliminada**: el sitio no hace publicidad, así que ese control solo servía para
  contradecir la política. `marketing` queda siempre en false y las señales `ad_*` nunca se conceden.
- Página `/politica-de-cookies` creada y registrada en los cuatro sitios necesarios (ruta,
  `PUBLIC_PATHS`, sitemap 32→33, mapa web), con la tabla real de cookies y terceros y **cinco marcas
  `PENDING CONTROLLER/COUNSEL APPROVAL`**.

### 3.2 `generate_lead`

Se dispara **solo** tras un 201 confirmado, **una vez** por intento, **solo** con consentimiento, y con
exactamente tres parámetros: `form_type`, `service_category`, `source_page`. Los dos primeros están
restringidos a conjuntos cerrados y el tercero se valida contra `PUBLIC_PATHS`, así que **el espacio de
parámetros es enumerable**: un nombre con espacios o un email con `@` no pasan el filtro y caen al valor
por defecto.

Prueba de entrega real, capturada en navegador:

```
region1.google-analytics.com/g/collect?v=2&tid=G-LE6ETPWL23…&en=generate_lead&_ee=1
  &ep.form_type=contact&ep.service_category=software-a-medida&ep.source_page=%2Fcontacto
  &gcs=G101&pscdl=denied
```

`gcs=G101` confirma consentimiento analítico concedido y `pscdl=denied` que la personalización
publicitaria sigue denegada.

### 3.3 Fiabilidad del lead

- Validación **de servidor** con máximos explícitos (120/254/160/32/80/120/5000/200/64).
- **Honeypot evaluado antes de zod**, leído del cuerpo crudo y fuera del esquema: un `_hp` ausente o no
  string **no produce ningún error de validación**. Esa es la diferencia entre defensa antispam y
  trituradora de leads.
- **Rate limiting** por cliente (5/10 min, con exención de la primera entrega) y **techo global**
  (120/10 min) aplicado a todas las entregas, con eventos distintos `contact_rate_limited_key` y
  `contact_rate_limited_global`.
- **Idempotencia** por índice único parcial: reintentar con la misma clave devuelve el mismo id y no crea
  fila ni correo nuevos.
- **Identidad de cliente** desde la cadena de confianza: `trust proxy "loopback"` y `CF-Connecting-IP`
  aceptada **solo** si el par que conecta está en los rangos de Cloudflare embebidos (15 IPv4 + 7 IPv6,
  snapshot 2026-11-05). Hash HMAC-SHA256 con sal, 16 hex.
- **Almacenamiento y notificación como hechos separados**: `notification_status` (`legacy`/`pending`/
  `sent`/`failed`), `notification_attempts`, `notified_at`, `notification_error` con **clase saneada**
  (`/^[A-Za-z0-9_]{1,48}$/`), nunca el mensaje SMTP.
- **Un fallo de notificación no cambia el resultado HTTP**: `try/catch` en la ruta y en el `UPDATE`
  posterior. El lead queda guardado y la respuesta sigue siendo 201.
- **Logging estructurado** con lista blanca de campos: sin email, sin teléfono, sin cuerpo, sin IP cruda,
  sin query string.
- **Ruta de lectura admin** (`GET /api/v1/contact/messages`, `/:id`, con `requireAdmin`) y **comando de
  recuperación** `renotify-leads` con `--dry-run` y `--limit`, protegido por `NOTIFY_SINCE` para que las
  17 filas históricas **nunca** se re-notifiquen.
- **Robustez del proceso**: middleware de error terminal, `pool.on('error')`, cierre ordenado con
  SIGTERM/SIGINT, y `unhandledRejection` registrado en vez de fatal.

### 3.4 Search Console y línea base

- Se descubrió que **GSC no estaba bloqueado**: la cuenta de servicio es **siteOwner** de
  `sc-domain:tecnoriasl.com`. El "bloqueo" heredado venía de `GSC_SITE_URL`, una variable de entorno
  apuntando a otro dominio. Se corrigió la herramienta para que la propiedad sea explícita y nunca se
  redirija en silencio.
- **Sitemap reenviado**: estaba enviado desde `2026-03-12` con 24 URLs y descargado por última vez el
  `2026-04-28`; el sitemap de 32 URLs del hito 01 **nunca había llegado a Google**. Reenvío `HTTP 204`,
  descarga ~1 s después, `submitted: "32"` (y 33 tras añadir la política de cookies).
- Línea base real por ventanas (clics / impresiones): 7 d `0/51` · 28 d `3/216` · 90 d `15/702` ·
  480 d `78/34.810`.
- Estado de indexación por URL (URL Inspection API): home, artículo, ficha de servicio, `/contacto` y
  `/servicios` → `Submitted and indexed`. `/productos/talkaris` → **no indexada, nunca rastreada**.

### 3.5 Infraestructura

- **Simulacro de restauración real** (no `pg_restore -l`): dump `tecnoria_20261105_011458.dump.gz`,
  `pg_restore` exit 0 sin una sola advertencia, paridad `17|17`, `7|7`, `1|1`, `1|1`, y borrado de la base
  desechable sin residuo.
- **Procedimiento de rollback verificado**, incluida la trampa de que el proceso queda fijado al
  directorio resuelto y **cambiar el symlink sin reiniciar no hace nada**.
- **Protección contra contaminación de datos**: se descubrió que `127.0.0.1:5432` de este host **no es un
  contenedor** sino una instancia Postgres ajena con las bases `tecnoria`, `tecnoria_chat` y `content_ai`.
  Todos los tests se aíslan en `55432`/`55433` con sonda de identidad previa.

---

## 4. Agentes y rutas de modelo realmente utilizados

| Agente / herramienta | Ruta ejecutada | Papel | Incidente |
|---|---|---|---|
| Capitán (orquestación, spec, despliegue, arreglos de migración y workflow) | `deepseek-official` / `deepseek-flash` | Coordinación | — |
| `analytics-search` | `deepseek-official` / `deepseek-flash` | Descubrimiento de medición, baseline GSC, documentación de fiabilidad, verificación independiente de la API | En una tarea declaró **no poder demostrar su propia ruta ejecutada**; queda marcado como no verificado |
| `backend-lead` | `deepseek-official` / `deepseek-flash` | Descubrimiento del lead, API de contacto, reparaciones web, simulacro de restauración | Retiró una afirmación falsa sobre migraciones: *"describí un resultado que no ejecuté"* |
| `privacy-consent` | `deepseek-official` / `deepseek-flash` | B1 (consentimiento) y documentación | **Eliminado**: su cuenta devolvió `Insufficient Balance` (QUOTA) a mitad de tarea |
| `web-repair` | `openrouter` / `z-ai/glm-5.3-flash` | Reparación de respaldo | **Eliminado**: su esquema de herramientas degradó a solo lectura (primero sin `update_task`/`send_message`, después sin edición ni ejecución) |
| Revisión L4 #1 y #2 | `subagent_claude_code` (Claude Sonnet 5.5) | Revisión independiente final | Su shell fue denegada: revisó **leyendo**, y aun así encontró dos defectos que nadie más vio |

**Sobre el coste, con honestidad:** las rutas DeepSeek tienen coste **UNKNOWN** en esta instalación —el
adaptador no lee metadatos de coste del proveedor— y `subagent_claude_code` es una ejecución con
suscripción, **`SUBSCRIPTION_UNPRICED`**, no coste cero. No se deriva ninguna factura del contador de
tokens de la sesión.

**Sobre los límites del arnés**: `maxMembers=4`, `maxActiveSubagents=3`, `memberMaxDepth=0`. La escritura
se serializó porque el monorepo comparte un único `node_modules` y un `dist/` por workspace; la
investigación en solo lectura se paralelizó a tres.

---

## 5. Referencias Git

| Commit | Contenido |
|---|---|
| `d54b4cf` | `feat(web)` consent mode v2, interfaz de cookies y `generate_lead` condicionado |
| `2786070` | `feat(api)` fiabilidad del lead, controles de abuso y notificación |
| `0a10c6c` | `fix(api)` migraciones re-ejecutables y no destructivas (006 y 002) |
| `5b47ff6` | `test` suites de consentimiento, analítica, navegador CDP y API con guardas de migración |
| `c0128b8` | `chore(deploy)` migraciones antes de reiniciar (primera versión, **inoperante**) |
| `8eb3c70` | `docs(growth)` medición, consentimiento, fiabilidad de leads y baseline |
| `273fc3f` | `fix(deploy)` migración dentro del script permitido y `MIGRATE` por defecto 1 |

Base de partida: `6b86ab0`. Rama: `master`. Sin force-push, sin reescritura de historia, sin commits
ajenos alterados. El árbol de trabajo previo se preservó (`.serena/` es estado local anterior y quedó
fuera de los commits).

---

## 6. Evidencia de pruebas (re-ejecutada por el capitán sobre los bytes finales)

| Comando | Resultado real |
|---|---|
| `npm run build:web` | exit 0 |
| `npm run test:seo` | `SEO checks passed: 33 public routes, JSON-LD, 404/301, cache and sitemap.` |
| `npm run test:consent` | 22 / 22 |
| `npm run test:analytics` | 15 / 15 |
| `npm run test:browser` | 24 / 24 en 67,7 s, Chrome real por CDP |
| `npm run build:api` | exit 0 |
| `npm run test:api` | 61 / 61 (incluye guarda de doble pasada y guarda estática de mutaciones) |

El gate del repositorio, actualizado en `qa/qa-manifest.json` a siete etapas (seis requeridas y el suite
de navegador opcional, porque depende de que exista Chrome en la máquina).

---

## 7. Evidencia de producción

**Despliegue:** `6b86ab0..273fc3f` vía GitHub Actions → SSH → `deploy-webtecnoria.sh`.
Release activa durante la verificación: **`20261105_052852`**. API reiniciada `05:28:33`, web `05:28:54`,
ambas sanas. Este documento se publica en un commit posterior que provoca un redespliegue de solo
documentación.

### 7.1 Monitor antes / después (la prueba de aceptación)

```
ANTES                              DESPUÉS
FAIL  static googletagmanager tag  PASS  no <script src=...googletagmanager...>
FAIL  consent default denies       PASS  gtag('consent','default') con analytics_storage:'denied'
PASS  sitemap 32 <loc>             PASS  sitemap 33 <loc>
OVERALL FAIL (pass=7 fail=2)       OVERALL PASS (pass=9 fail=0 unknown=1)
```

Los dos `FAIL` medidos contra producción son ahora `PASS`. La comprobación UNKNOWN es honesta: el HTML
servido no expone un identificador de release, así que no puede confirmarse desde el HTML.

### 7.2 Navegador real contra producción

```
REQUESTS_TOTAL 37 · HOSTS ["tecnoriasl.com","talkaris.com"]
GOOGLE_REQUESTS 0
CONSENT_COMMANDS default:{ad_storage:denied, ad_user_data:denied,
                          ad_personalization:denied, analytics_storage:denied}
LOADER_INVOKED_ON_BOOT false · BANNER_DIALOG_PRESENT true
VERDICT_PRE_CONSENT PASS
```

**Cero peticiones a Google antes de consentir, en producción, medido con navegador real.** Esa es la
afirmación central del hito y está demostrada, no inferida.

### 7.3 Formulario de extremo a extremo en producción

```
/politica-de-cookies                 → 200
contact_messages antes               → 17
POST etiquetado                      → HTTP 201 {"duplicate":false,"notified":"failed"}
fila almacenada                      → notification_status=failed, attempts=1,
                                       notification_error=EAUTH, privacy_accepted=t, source_page=/contacto
reintento con la misma clave         → HTTP 201, y sigue habiendo 1 sola fila
limpieza                             → DELETE 1; contact_messages 17 → 17
```

Dos hechos quedan demostrados: **el lead se guarda aunque la notificación falle**, y el fallo queda
registrado con clase saneada en lugar del mensaje SMTP. La fila de prueba se eliminó; no queda residuo.

### 7.4 Esquema

`contact_messages` pasó de 9 a 18 columnas en producción, con `idx_contact_messages_idempotency_key`
presente y `notification_status` con default `'legacy'`. Las 17 filas históricas quedaron intactas y
`blog_posts` sigue con 2 entradas en `publish` y **0 borradores publicados**.

---

## 8. Rendimiento

**No hay comparación de rendimiento medida en este hito**, y no se va a inventar. Lo que sí es cierto y
verificable:

- La descarga de `gtag/js` (~100 kB de JavaScript de terceros) ya **no ocurre** antes del consentimiento,
  lo que retira ese script del camino crítico en la primera visita.
- Para un visitante recurrente con consentimiento, la analítica arranca **~300 ms** después del inicio de
  navegación, tras la hidratación. Es el intercambio aceptado a cambio de corrección: se pierde un
  `page_view` temprano y se gana que no se mida a nadie sin permiso.
- El banner es `position: fixed` y se renderiza tras la hidratación, así que no puede provocar CLS.
- No se midió LCP, TBT ni Lighthouse. La comparación con los valores del hito 01 (LCP 3,3–3,5 s,
  TBT 460–660 ms, score 69–76) **no se ha repetido**, y por tanto no se afirma mejora ni empeoramiento.

---

## 9. Requisitos de acceso pendientes (externos)

| # | Qué falta | Consecuencia |
|---|---|---|
| 1 | Credencial SMTP válida: app password de Gmail con 2FA, o proveedor transaccional con SPF+DKIM+DMARC | **Los leads se guardan pero nadie recibe aviso.** Además `access-request` devuelve 502 tras insertar la fila y la recuperación de contraseña no entrega nada |
| 2 | Token de API de Cloudflare con permiso de purga por zona | Sin invalidación selectiva no se pueden evaluar los redirects legacy servidos desde caché |
| 3 | Acceso admin/datos a GA4 (`G-LE6ETPWL23`): habilitar la Admin API en el proyecto `533857766582` y añadir la cuenta de servicio a la propiedad | Sin cifras de comportamiento, sin marcar `generate_lead` como conversión, sin exclusiones de referidos |
| 4 | Propietario del proyecto de Google Cloud (para habilitar la API) | Ídem |

Search Console **ya no está en esta lista**: el acceso existe y está en uso.

## 10. Aprobaciones legales pendientes

| # | Qué | Estado |
|---|---|---|
| 1 | Texto de política de privacidad y de cookies aprobado por el responsable del tratamiento o su asesoría | **Pendiente.** Cinco marcas `PENDING CONTROLLER/COUNSEL APPROVAL` en `cookies-page.component.ts` |
| 2 | Decisión sobre el widget de chat (Talkaris), que contacta `talkaris.com` **antes** de cualquier consentimiento | **Pendiente del titular.** Hoy está divulgado, no condicionado |

**No se afirma cumplimiento legal.** Una interfaz de consentimiento no es cumplimiento; este documento lo
dice de forma explícita y no se ha activado ningún tracking opcional como atajo.

---

## 11. Hallazgos abiertos que viajan a GROWTH-03

Detallados con causa raíz en [`GROWTH-03-HANDOFF.md`](GROWTH-03-HANDOFF.md): rotación SMTP (H-1),
aprobación legal (H-2), decisión del widget (H-3), ledger de migraciones (H-4), job de tests en CI (H-5),
restauración con el esquema nuevo (H-6), token de Cloudflare (H-7), acceso a GA4 (H-8) y sincronización
entre pestañas (H-9).

---

## 12. Veredicto final

**PASS CON HALLAZGOS ABIERTOS Y DOS BLOQUEOS EXTERNOS.**

Es PASS porque:

1. El defecto crítico está corregido y **demostrado contra producción**: 0 peticiones a Google antes de
   consentir, con navegador real.
2. El objetivo de negocio funciona y está medido: `generate_lead` llega a GA4 con los tres parámetros y
   sin PII.
3. El lead se guarda, se puede leer, se puede re-notificar y no se duplica; el abuso tiene controles.
4. No hay regresión SEO: 33 rutas, canónicas, JSON-LD, 404 reales y 301 intactos.
5. Dos revisiones externas y dos verificaciones por no implementadores encontraron y cerraron defectos
   reales, incluido un blocker de despliegue y un agujero de consentimiento.

No es PASS completo porque **la notificación de leads no entrega en producción** y **la redacción legal no
está aprobada**. Ninguna de las dos se resuelve con código, y ninguna se ha disimulado.

**El riesgo residual más serio** no es técnico: es que el widget de chat contacta un dominio externo antes
de cualquier decisión. La solución actual lo **informa**; condicionarlo es una decisión del responsable del
tratamiento.
