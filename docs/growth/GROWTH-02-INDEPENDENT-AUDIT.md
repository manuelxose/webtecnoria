# GROWTH-02 — Auditoría independiente

**Proyecto:** TECNORIA — tecnoriasl.com
**Hito:** `TECNORIA-GROWTH-02`
**Fecha:** 2026-11-05
**Alcance auditado:** consentimiento (Consent Mode v2), interfaz de cookies, `generate_lead`, pipeline de
contacto y su fiabilidad, migraciones, y despliegue.
**Método:** dos revisiones L4 externas más dos verificaciones cruzadas por agentes que no escribieron el
código, más re-ejecución de todos los comandos por el capitán.

---

## 1. Por qué existe este documento

Un PASS de quien implementa no es evidencia. Este hito se auditó con tres capas independientes:

| Capa | Quién | Qué produjo |
|---|---|---|
| Verificación independiente web | `backend-lead` (no escribió B1) | Hallazgo **F1**: un registro de consentimiento **caducado** cargaba Google con el banner visible |
| Verificación independiente API | `analytics-search` (nunca tocó `apps/api`) | Hallazgo **blocker**: las migraciones no eran re-ejecutables y el despliegue habría abortado |
| Revisión L4 #1 | Claude Sonnet 5.5 (externo) | 11 hallazgos `F-1..F-11`; cuatro mayores |
| Revisión L4 #2 | Claude Sonnet 5.5 (externo) | 13 hallazgos `G-1..G-13`; encontró el blocker que ni el equipo ni el capitán vieron |

Las dos revisiones L4 se ejecutaron con `subagent_claude_code` (Claude Sonnet 5.5), especialista externo,
**`SUBSCRIPTION_UNPRICED`** — no es una ruta LLM de AgentTeams y no se contabiliza como coste cero.
En ambas ocasiones su shell fue denegada por el sandbox: revisaron **leyendo**, y aun así encontraron
defectos que las pruebas automáticas no detectaban. Eso es un dato sobre el valor de la revisión de
código, no una anécdota.

---

## 2. Hallazgos que cambiaron el resultado

### 2.1 F1 (mayor) — un consentimiento caducado cargaba Google

La guarda inline comprobaba `version` y `analytics === true`, pero **no** las reglas de `ts` que el
servicio sí aplicaba (`parseConsentRecord`: fecha ilegible, futura con 60 s de tolerancia, o más de 730
días). Con un registro caducado, el servicio consideraba al visitante **indeciso** y le mostraba el banner,
mientras el script inline ya había cargado GA.

```
Medido contra build inmutable: caducado 2020 → google=2 + banner
                               futuro   2030 → google=2 + banner
```

No requería manipulación: la caducidad a 24 meses es una ruta de ciclo de vida prevista. A los dos años
de aceptar, todos los visitantes recurrentes habrían caído ahí, contradiciendo además la política
publicada. **Reparación:** se eliminó la carga en arranque; `ConsentService` es el único punto de entrada.
**Re-verificado:** `google=0` + banner en ambos casos, con prueba de orden causal (decisión leída y
cargador llamado en el mismo instante, `readyState='interactive'`).

### 2.2 Blocker de migraciones — el despliegue no habría podido salir

`006_support.sql:33` creaba un trigger sin guarda y el runner re-aplica **todos** los ficheros en cada
release sin ledger. Segunda pasada: `SQLSTATE 42710`. Con `MIGRATE=1`, `set -euo pipefail` habría abortado
**antes** de reiniciar la API, y la migración 009 nunca habría llegado.

**Reparación y prueba propia:** `DROP TRIGGER IF EXISTS` antes del `CREATE`; los diez ficheros aplicados
**dos veces** sobre un Postgres desechable → 0 fallos en ambas pasadas, 18 columnas, `pg_trigger` = 1
para cada trigger. Se añadió además una guarda permanente en `test:api` que aplica los diez ficheros dos
veces y una **guarda estática** que detecta mutaciones de datos sin guarda.

### 2.3 G-1 (blocker, L4 #2) — cada despliegue habría publicado todos los borradores del blog

`002_blog_workflow.sql:26-30` ejecutaba un `UPDATE blog_posts SET status='publish'` **sin guarda**. Con
`MIGRATE=1` cableado, cada release habría publicado todos los borradores. Exposición medida en
producción: **0 borradores** (2 entradas, ambas `publish`), así que no hubo daño; era un defecto latente
que el propio cambio habría armado. **Mi auditoría previa no lo vio** porque busqué sentencias
*destructivas* (`DROP`/`TRUNCATE`/`DELETE`) y no *mutaciones de datos*.

### 2.4 G-2 (mayor, L4 #2) — una regresión introducida por la reparación anterior

El efecto que abría el panel leía `consent.state()` y quedaba suscrito a la decisión. Tras usar el enlace
del **pie**, cada Aceptar/Rechazar/Guardar reabría el diálogo. El test no lo veía porque solo usaba
`.consent-reopen`. **Reparación:** `untracked()`; **demostración:** se reintrodujo la dependencia antigua
y el test falló con el mensaje exacto (22/24), se restauró y volvió a 24/24.

### 2.5 G-4 — el propio despliegue habría fallado por entorno

`apps/api/.env` no existe en el servidor; el servicio recibe el entorno de systemd. `env.ts` valida al
importarse, así que `npm run migrate:api` habría salido 1. Se verificó que sourcear
`/etc/tecnoria/api.env` funciona (`ENV_OK`) y se corrigió el camino de despliegue.

### 2.6 Defecto de despliegue propio — sudoers

Las dos primeras versiones del workflow eran **inoperantes**: el usuario SSH es `deploy` y sudoers solo
permite `NOPASSWD` para tres rutas exactas de script. `sudo bash -c …` y `sudo env MIGRATE=1 …` resuelven
a un comando no permitido, piden contraseña, no hay TTY y el paso falla antes de tocar el servidor.
**Verificado**: la sesión del runner se aceptó como `deploy` y el comando fue denegado. Se movió la
migración dentro del script permitido, que corre como root.

---

## 3. Disposición de todos los hallazgos

### Revisión L4 #1

| id | Gravedad | Estado | Evidencia de la reparación |
|---|---|---|---|
| F-1 | mayor | **Reparado** | `commit()` purga cookies cuando `analytics !== true`; unit con jar simulado y navegador (`analyticsCookies()=[]`) |
| F-2 | mayor | **Reparado y probado** | `generate_lead` vía `window.gtag('event', …)`; captura real `/g/collect` con `en=generate_lead` y los tres parámetros, sin PII |
| F-3 | mayor | **Reparado** | Listener de `document` en captura, foco restaurado, trampa de Tab, Escape sin otorgar; entrada CDP real en vez de `.click()` |
| F-4 | mayor | **Parcial (decisión del titular)** | Divulgación en el diálogo + enlace a la política; el widget sigue contactando `talkaris.com` antes de consentir. Condicionarlo es decisión del responsable (H-3) |
| F-5 | menor | **No implementado** | Sincronización entre pestañas (`storage`). Registrado como H-9 |
| F-6 | menor | **Reparado** | Categoría de publicidad eliminada; `marketing` siempre false; señales `ad_*` nunca concedidas |
| F-7 | menor | **Reparado** | El panel se inicializa desde la decisión vigente |
| F-8 | menor | **Reparado** | Helpers puros + guarda de sufijo público; probado con `domain=.tecnoriasl.com` |
| F-9 | mayor | **Parcial** | Se sustituyeron clics JS por entrada real y se corrigió el test que ocultaba G-2. Persisten tests que ejercitan helpers puros en vez del servicio Angular (G-12) |
| F-10 | bajo | **Reparado** | `source_page` enumerado contra `PUBLIC_PATHS` |
| F-11 | bajo | **Parcial** | `aria-modal` sin fondo inerte; el trap ya funciona con foco dentro |

### Revisión L4 #2

| id | Gravedad | Estado |
|---|---|---|
| G-1 | **blocker** | **Reparado por el capitán** (002 sin `UPDATE`); producción con 0 borradores |
| G-2 | mayor | **Reparado** con demostración de que el test falla sin el arreglo |
| G-3 | mayor | **Reparado** (`realpathSync`); en este servidor no era symlink → no era riesgo real, se endureció igualmente |
| G-4 | mayor | **Reparado por el capitán** (entorno de la migración) |
| G-5 | menor | **Reparado** (413/400 honrados; 500 sigue INTERNAL) |
| G-6 | menor | **Reparado** (UPDATE posterior en try/catch; sigue 201) |
| G-7 | menor | **Mejorado** (guarda estática + skip honesto con `CI`) |
| G-8 | menor | **No implementado** (H-9) |
| G-9 | menor | **Reparado** (`maxlength` + mensaje distinto para 429) |
| G-10 | menor/legal | **Parcial**: divulgado, no condicionado (H-3) |
| G-11 | bajo | **Reparado** (`marketing` forzado a false al parsear) |
| G-12 | bajo | **Parcial** (ver F-9) |
| G-13 | bajo | **Parcial**: `trackLead` dentro del `try`; un fallo de Cloudflare CIDR comparte cubo hasta refrescar el snapshot |

Ningún hallazgo se ha cerrado sin evidencia ni se ha descartado en silencio. Los que quedan abiertos están
enumerados como H-1..H-9 en [`GROWTH-03-HANDOFF.md`](GROWTH-03-HANDOFF.md).

---

## 4. Falsos positivos rechazados (también es trabajo de auditoría)

Rechazar un hallazgo incorrecto con evidencia vale tanto como arreglar uno real. Ocurrió cuatro veces:

1. `scripts/tests/consent.test.mjs` afirmaba que `index.html` invocaba el cargador; el regex coincidía con
   **una frase de un comentario**. Se corrigió la aserción, no el código.
2. El revisor L4 #2 señaló `007_users_upgrade.sql:14` como trigger sin guarda; la línea anterior hace
   `DROP TRIGGER IF EXISTS`. Verificado y descartado.
3. `backend-lead` "arregló" una supuesta fuga de cookies al guardar sin cambiar nada: tras F-7 el panel abre
   marcado porque el consentimiento está vigente. Se corrigió el test.
4. La rama de purga con `domain=.tecnoriasl.com` ya era correcta; lo que faltaba era **probarla**. Se
   añadió el test, no se cambió la lógica.

---

## 5. Lo que NO se ha verificado

Declarado, no implicado:

- **Datos de campo (CrUX)** y **Lighthouse**: no medidos en este hito. No se afirma mejora de rendimiento
  más allá de la retirada de la descarga de GA4 antes del consentimiento.
- **Lector de pantalla real**: la accesibilidad se verificó por atributos y eventos de teclado en navegador
  real. No se ejecutó ninguna tecnología de asistencia.
- **Entrega de email en producción**: BLOCKED (`EAUTH 534-5.7.9`). Lo probado es Mailpit en local.
- **Restauración con el esquema posterior a 009**: el simulacro usó un dump anterior (9 columnas).
- **Purga selectiva de caché de Cloudflare**: sin token de API.
- **Ruta ejecutada por `analytics-search` en una de sus tareas**: informó que no puede demostrarla desde
  dentro; queda marcada como no verificada en lugar de asumida.
- **Comportamiento entre pestañas** del consentimiento.
- **Job de tests en CI**: `deploy.yml` no ejecuta pruebas; el gate real fue local y manual.

---

## 6. Veredicto

**PASS CON HALLAZGOS ABIERTOS**, con dos bloqueos externos que impiden considerarlo completo:

- La **entrega de notificaciones en producción** sigue bloqueada por la credencial SMTP. Los leads se
  guardan y el fallo queda registrado; no se pierden, pero nadie recibe aviso.
- La **aprobación legal** del texto de privacidad y cookies no existe. Una interfaz de consentimiento no es
  cumplimiento legal y este documento no lo afirma.

La afirmación central del hito —**ninguna petición a Google antes del consentimiento analítico**— está
demostrada contra producción con navegador real: 37 peticiones, hosts `["tecnoriasl.com","talkaris.com"]`,
**0 peticiones a Google**, cuatro señales en `denied`, cargador definido y no invocado.

El riesgo residual más serio no es técnico: es que el widget de chat contacta un dominio externo antes de
cualquier decisión y la solución actual **informa** pero no **condiciona**. Eso requiere una decisión del
titular, no más código.
