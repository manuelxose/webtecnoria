# GROWTH-03C — Input de búsqueda (GSC, monitorización, evidencia del artículo de coste)

**Tarea:** `t2` · **Rol:** growth-engineer · **Fecha de captura:** 2026-11-05 (UTC) · **Repo:** `webtecnoria`
**Ruta asignada:** `MODEL_ASSIGNMENT class: L2 · primary: openrouter-minimax/minimax-m3.1-flash · escalation: deepseek-official/deepseek-v4-pro`
**Alcance de escritura:** este archivo y `docs/growth/_team/GROWTH-03C-LEAD-INPUT.md`. **No** se modificó ningún archivo de implementación, ni `apps/**`, ni el título/contenido del artículo de coste, ni la base de datos.
**No se ejecutaron** builds ni suites de tests (otra tarea posee el build en esta ola).

---

## 0. Resumen ejecutivo (lo que el Captain tiene que saber primero)

1. **Baseline GSC re-verificado, sin delta.** 90 días = **15 clics / 725 impresiones**, rango exacto **2026-08-05 → 2026-11-02**, idéntico al export inmutable del 2026-11-05T13:39:03Z. No ha aparecido ninguna ventana finalizada nueva.
2. **HALLAZGO CRÍTICO (nuevo, no estaba en el encargo):** el artículo de coste **en producción no tiene cuerpo**. El HTML servido contiene `<div class="article-richtext">sadasda</div>` (7 caracteres) y **ninguno** de los 5 apartados que sí existen en el código fuente. La fila de `blog_posts` en la base de datos (`content = "sadasda"`) **pisa** el artículo estático completo. Ver §3.1–3.2.
3. **Consecuencia para GROWTH-03B:** el enlace contextual artículo → servicio (candidato C) **no se renderiza en esa URL** tras desplegar 03B, porque la rama `kind:"api"` del componente de artículo no transporta `serviceLinks`. Verificado en el HTML servido. Los cambios de texto de ancla (candidato A) sí llegan a producción (el título de la API es idéntico al título estático). Ver §3.2.
4. **Monitorización:** **no existe ningún planificador autorizado** para el monitoreo orgánico (ni cron, ni systemd timer, ni `schedule:` en GitHub Actions). El monitoreo de GSC **no es automatizable sin un cambio nuevo y autorizado**. Procedimiento manual en §2.
5. **Todo lo demás:** sin datos inventados. Donde no hay evidencia: `sin datos`.

---

## 1. TAREA 1 — Preservación y re-verificación del baseline

### 1.1 Comando ejecutado (solo lectura)

```bash
node scripts/gsc-query-page.mjs --out "$env:TEMP/gsc-query-page-2026-11-05-verify-t2.json"
```

Salida real (recortada, verbatim):

```
# service account: guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com
# property: sc-domain:tecnoriasl.com
# scope: https://www.googleapis.com/auth/webmasters.readonly
# primary dimensions: query,page
# rowLimit=25000 maxPages=5 searchType=web dataState=all
# window d28: 2026-10-06..2026-11-02
# window d90: 2026-08-05..2026-11-02
# window d480: 2025-07-11..2026-11-02
--- summary ---
d28 2026-10-06..2026-11-02 totals=3c/210i rowsQueryPage=33 (target 27) rowsPage=19 rowsQuery=30 pagesFetched=1 truncated=false
d90 2026-08-05..2026-11-02 totals=15c/725i rowsQueryPage=64 (target 51) rowsPage=35 rowsQuery=60 pagesFetched=1 truncated=false
d480 2025-07-11..2026-11-02 totals=79c/35299i rowsQueryPage=809 (target 786) rowsPage=92 rowsQuery=511 pagesFetched=1 truncated=false
WROTE <TEMP>/gsc-query-page-2026-11-05-verify-t2.json
```

- `queriedAt` = **2026-11-05T16:10:39.322Z**. `warnings = []`. `truncated = false` en las tres ventanas (1 página por dataset, tope 5 × 25 000).
- Advertencia real de la herramienta: `ambient GSC_SITE_URL (sc-domain:guiaprogramaciontv.com) ignored; querying sc-domain:tecnoriasl.com`. La propiedad consultada es la correcta; el valor ambiental de otra instalación **no** se aplicó.
- **Inmutabilidad respetada:** el export nuevo se escribió en una ruta temporal **fuera del repositorio**. `docs/growth/_team/gsc-query-page-2026-11-05.json` no fue abierto en escritura, ni copiado, ni modificado.
- **Ningún material de credencial impreso:** solo el correo de la cuenta de servicio (que ya constaba en `docs/growth/GROWTH-03-HANDOFF.md` §2.1) y el scope OAuth. El path del JSON de credenciales nunca se imprime (el script lo encapsula, `scripts/gsc-query-page.mjs:59-63`).

### 1.2 Comparación con el baseline inmutable (`...gsc-query-page-2026-11-05.json`, `queriedAt` 2026-11-05T13:39:03.481Z)

| Ventana | Rango exacto (idéntico en ambas ejecuciones) | Baseline 13:39:03Z | Re-verificación 16:10:39Z | **Delta** |
|---|---|---|---|---|
| 28 d | 2026-10-06 → 2026-11-02 | 3 clics / 210 imp · CTR 1,4286 % · pos 20,190 | 3 clics / 210 imp · CTR 1,4286 % · pos 20,190 | **0 / 0** |
| 90 d | 2026-08-05 → 2026-11-02 | 15 clics / 725 imp · CTR 2,0690 % · pos 26,572 | 15 clics / 725 imp · CTR 2,0690 % · pos 26,572 | **0 / 0** |
| 480 d | 2025-07-11 → 2026-11-02 | 79 clics / 35 299 imp · CTR 0,2238 % · pos 52,000 | 79 clics / 35 299 imp · CTR 0,2238 % · pos 52,000 | **0 / 0** |

| Ventana | Filas consulta+página (total / target host) | Filas página | Filas consulta |
|---|---|---|---|
| 28 d | 33 / 27 | 19 | 30 |
| 90 d | 64 / 51 | 35 | 60 |
| 480 d | 809 / 786 | 92 | 511 |

**Reconciliación del "906 query+page rows" del encargo:** 33 + 64 + 809 = **906** → es la suma de filas consulta+página de las **tres** ventanas del export, no el conteo de una sola ventana. Coincide exactamente.

### 1.3 Veredicto

- **El baseline se preserva y queda re-verificado:** 15 clics / 725 impresiones en 90 días, rango exacto **2026-08-05 → 2026-11-02**.
- **No ha aparecido ninguna ventana finalizada nueva** entre 13:39Z y 16:10Z del mismo día UTC: el `endDate` sigue siendo **2026-11-02** (offset de finalización = 3 días, `scripts/gsc-query-page.mjs:30`). **Delta = 0.** No hay "ventana más reciente" que registrar: `sin datos` (no existe).
- **Regla metodológica aplicada sin excepción:** los totales (clics, impresiones, CTR, posición media) se toman **solo** de la consulta **sin dimensiones**; las filas por dimensión son **no sumables** y se usan únicamente para ordenar y segmentar. Ejemplo real de no-additividad en la misma página y ventana (90 d): la fila de dimensión `page` del artículo de coste da **297 impresiones**, mientras que la suma de sus 12 filas `query+page` da **267**; y en 480 d la suma de filas (35 612) **supera** el total de la propiedad (35 299) según `docs/growth/GROWTH-03B-GSC-EVIDENCE.md` §1.
- **Canibalización: NO OBSERVADA** (no se revive sin evidencia nueva). En 28 d y 90 d el artículo y `/servicios/desarrollo-software-medida` **no comparten ninguna consulta** (intersección vacía).

---

## 2. TAREA 2 — Diseño de monitorización post-despliegue (7 / 14 / 30 días completos)

### 2.1 Precondición: T0 (timestamp verificado de despliegue) — `sin datos`

- **Producción sirve el commit `894e7c6`.** GROWTH-03B es el commit `94de3ab` (+ `68c19cc` de documentación) y **no está desplegado**.
  Verificado con `git log --oneline -8`: `68c19cc` → `94de3ab` → `894e7c6` → `789904c` → …
- **T0 = timestamp verificado de despliegue en producción**, no el timestamp del commit. Hoy **no existe**: no hay registro de despliegue en el repo y la herramienta de smoke no puede confirmar la release servida.
  Evidencia: `docs/growth/_team/monitor-2026-11-05T04-45-53-930Z.json` → `"release": null`, `releaseMarker: null`, check `release_id = UNKNOWN` ("el served HTML no expone identificador de release"). El propio script lo declara explícitamente (`scripts/growth-monitor.mjs:316-351`): sin `--release` y sin marcador en el HTML → `UNKNOWN`, nunca PASS silencioso.
- **El reloj de la monitorización no puede arrancar hasta que la tarea de despliegue entregue T0** (§2.6 define qué se registra ese día).

### 2.2 Auditoría del planificador existente (¿existe algo autorizado?)

| Pieza | ¿Existe? | Qué hace realmente | ¿Sirve para el monitoreo orgánico? | Credenciales |
|---|---|---|---|---|
| `scripts/growth-monitor.mjs` | Sí | Checks HTTP/HTML/TLS/TTFB/sitemap/404/`POST /contact` inválido/consent; escribe `docs/growth/_team/monitor-<ts>.json`; exit 0/1 | **No.** **No consulta GSC.** Es un tripwire de salud del sitio | Ninguna (sin PII) |
| `package.json` → `"test:monitor"` | Sí | `node scripts/growth-monitor.mjs` — **invocación manual** (el nombre imita a una suite de test; no es un planificador) | No | Ninguna |
| `scripts/gsc-query-page.mjs` | Sí | Export read-only de GSC; ventanas fijas `d28/d90/d480` ancladas a `hoy − 3`; paginación completa | Sí, **pero no con ventanas ancladas a T0** (no acepta `--start/--end`) | `GOOGLE_APPLICATION_CREDENTIALS` ya presente |
| `scripts/gsc-query.mjs` | Sí | `query --days N [--dimension X]`, `baseline`, `inspect`, `sitemaps`, `sites`. El `searchAnalytics()` interno admite `startDate/endDate`, **pero el CLI no los expone** | Sí, **con la misma limitación de anclaje** | misma |
| `.github/workflows/deploy.yml` | Sí | `on: push (master)` + `workflow_dispatch`. **`grep "schedule:\|cron"` en `.github` → 0 coincidencias** | No | secrets de despliegue |
| Unidades systemd en el repo | `tecnoria-api.service`, `tecnoria-web.service` | Sin `.timer`, sin `OnCalendar` (grep sin coincidencias en `*.{yml,yaml,sh,service,md}`) | No | — |
| Cron del servidor (fuera del repo) | `/etc/cron.d/tecnoria-db-backup` (`30 3 * * *`) | Copia de seguridad de Postgres. **No** es monitoreo | No | — |

**Verificación previa registrada en el repo** (`docs/growth/GSC-SETUP.md:345`, 2026-11-05):
`ssh contabo "crontab -l | grep -iE 'gsc|search|baseline|growth'"` → sin entradas; `systemctl list-timers --all` → sin timers coincidentes; el planificador de Windows → sin tarea de este tipo. **"Scheduled automated baseline runs — NOT IMPLEMENTED"**.

### 2.3 Veredicto sobre automatización

> **La automatización del monitoreo orgánico NO es segura ni posible hoy.** No existe planificador autorizado, y crearlo exige una decisión de credenciales que es del propietario:
> - **systemd timer en el servidor**: el JSON de la cuenta de servicio **no está en el servidor** → habría que colocar una credencial nueva → requiere autorización del propietario → **BLOCKED** sin esa autorización.
> - **GitHub Actions `schedule:`**: exigiría subir el JSON de la cuenta de servicio como *secret* del repo → credencial nueva en otro sitio → también requiere autorización del propietario.
> - **Alternativa sin credencial nueva**: un job que se dispare desde la máquina del operador que ya tiene `GOOGLE_APPLICATION_CREDENTIALS` — pero eso es una tarea programada local, no un planificador del repo.
>
> **Procedimiento obligatorio mientras tanto: MANUAL** (§2.4–2.6), ejecutado por el operador en el host que ya posee la credencial. No se crean tareas, cron ni secretos nuevos en este hito.

### 2.4 Retraso de datos de GSC y fechas de ejecución

- `FINALISATION_OFFSET_DAYS = 3` (`scripts/gsc-query-page.mjs:30`): un día calendario D queda finalizado en D+3.
- Ventana post-despliegue de **7 días completos** = `T0+1 … T0+7` → **legible el día T0+10** como mínimo.
- **Checkpoints:** día 7 → ejecutar **no antes de T0+10**; día 14 → **no antes de T0+17**; día 30 → **no antes de T0+33**.
- **Regla de ventana comparable:** misma longitud, misma propiedad, mismo `searchType=web`, mismo `dataState=all`, mismo offset de finalización. Totales **siempre** desde la consulta sin dimensiones; segmentación desde filas `query+page` **filtradas a host target** (`tecnoriasl.com` / `www.tecnoriasl.com`), excluyendo `clientes.` y `cms.` (WordPress heredado).

### 2.5 Limitación real: hoy no se pueden anclar ventanas a T0

- `scripts/gsc-query-page.mjs` **no acepta `--start/--end`** (ventanas fijas ancladas a `hoy − 3`).
- `scripts/gsc-query.mjs query` **no expone** `startDate/endDate` aunque el motor los soporte (`scripts/gsc-query.mjs:103-118`).
- **Consecuencia honesta:** el par ideal `pre = T0−7 … T0−1` vs `post = T0+1 … T0+7` **no es producible con la herramienta autorizada actual**.
- **Procedimiento manual aceptable (etiquetarlo como menor):** usar `--days 7 / 14 / 30` y declarar explícitamente que la ventana es **anclada al calendario** y que, si T0 cae dentro de ella, mezcla días previos y posteriores. **No** se presenta ese resultado como ventana post-deploy limpia.
- **Recomendación para GROWTH-04 (cambio pequeño, solo lectura, mismas credenciales):** añadir `--start/--end` a `scripts/gsc-query-page.mjs` para permitir ventanas ancladas a T0. Requiere aprobación + **revisión independiente de otra familia de modelos** antes de producción. No se implementa aquí.

### 2.6 Registro obligatorio en la fecha de intervención (T0)

Estos son los campos exactos que deben quedar archivados el día del despliegue; sin ellos la monitorización no es atribuible:

| # | Campo | Por qué |
|---|---|---|
| 1 | **SHA completo (40 hex) del commit desplegado** (previsto `94de3ab…`; `68c19cc…` si se incluye el commit de documentación) | identifica qué código se midió |
| 2 | **T0 = timestamp de despliegue en producción en ISO-8601 UTC**, tomado del log/directorio de release del servidor — **nunca** el timestamp del commit | ancla de las ventanas |
| 3 | **run id + URL** del workflow de despliegue | trazabilidad de CI |
| 4 | **exit code del script de deploy y resultado del smoke** (PASS/FAIL) + comando literal | **H-10 sigue abierto**: el smoke es intermitente; su veredicto debe quedar registrado, no asumido |
| 5 | `systemctl show tecnoria-api -p ActiveEnterTimestamp` (y `tecnoria-web`) | corrobora T0 en el servidor |
| 6 | **Nombre + SHA-256 de los exports GSC** usados como línea base pre | permite rehacer el cálculo |
| 7 | **Rangos GSC exactos** de la ventana pre (fechas inicio/fin) | comparableidad |
| 8 | **`queriedAt` + SHA-256** del export pre | comparableidad |
| 9 | **Declaración de que no hubo ningún otro cambio de contenido/SEO en la misma release** | sin esto no hay atribución causal |
| 10 | **Quién ejecutó** y **quién aprobó** el despliegue | control operativo |
| 11 | **JSON de `growth-monitor` de ese momento** (con `--release` si el HTML llegara a exponerlo) | estado de salud en T0; hoy el check de release es `UNKNOWN` |

### 2.7 Conjunto exacto de métricas a seguir (y cómo se derivan)

| # | Métrica | Definición operativa | Origen |
|---|---|---|---|
| 1 | Clics orgánicos | Total de la ventana | Consulta **sin dimensiones** |
| 2 | Impresiones orgánicas | Total de la ventana | Consulta **sin dimensiones** |
| 3 | CTR | `clics / impresiones` de la fila sin dimensiones (recalcular y cuadrar) | Consulta sin dimensiones |
| 4 | Posición media | Campo `position` de la fila sin dimensiones | Consulta sin dimensiones |
| 5 | Combinaciones consulta+página | **Conteo** de filas distintas (target host). Nunca se suman sus clics | Filas `query+page` |
| 6 | Split branded / non-branded | Regla congelada (abajo) aplicada a cada fila de la dimensión `query` | Filas `query` (y `query+page` para el desglose) |
| 7 | Landings comerciales | 6 páginas `/servicios/*` + el artículo de coste | Filas `page` (target host) |
| 8 | Visibilidad de artículos | 12 rutas `/blog/*` del sitemap | Filas `page` (target host) |
| 9 | Visibilidad de páginas de servicio | `/servicios` + las 6 de detalle | Filas `page` (target host) |
| 10 | Estado de indexación | URL Inspection | `node scripts/gsc-query.mjs inspect <url>` (existente, solo lectura, scope `webmasters.readonly`) |
| 11 | Tripwire de salud del sitio | Checks HTTP/TLS/TTFB/consent | `node scripts/growth-monitor.mjs --out docs/growth/_team/monitor-<ts>.json` |

**Regla branded congelada** (para que las ventanas sean comparables; debe ir escrita en cada informe):
consulta que contiene, sin distinguir mayúsculas/minúsculas ni acentos, cualquiera de:
`tecnoria`, `teknoria`, `tecnoloyia`, `tecnologia`, `tecno`.
**Falsos positivos conocidos a revisar a mano:** `conultoría tecnológica` (contiene "tecnología"), `telefonos tecno` (marca de dispositivo, no la nuestra).

**Split medido hoy** (filas `query+page`, **solo host target**; remember: **no** son los totales):

| Ventana | Filas branded | Clics branded | Imp. branded | Filas non-branded | Clics non-branded | Imp. non-branded |
|---|---|---|---|---|---|---|
| 28 d | 10 | 2 | 41 | 17 | 0 | 127 |
| 90 d | 11 | 2 | 43 | 40 | 0 | 370 |
| 480 d | 26 | 5 | 960 | 760 | 5 | 34 546 |

Control de no-additividad: 28 d → 41 + 127 = **168** impressions de fila frente a **210** del total sin dimensiones; 2 clics de fila frente a 3 del total. El split **nunca** sustituye al total.

### 2.8 Statuto honesto de la señal a este volumen de tráfico

Con los números medidos (15 clics / 725 imp en 90 d; 3 clics / 210 en 28 d; 79 clics / 35 299 en 480 d):

- Ritmo base de clics = 15 / 90 = **0,167 clics/día** → una ventana de 7 días contiene **≈1,2 clics** esperados; 14 días **≈2,3**; 30 días **≈5,0**.
- **El cambio mínimo detectable en una ventana de 7 días es de 1 clic** (≈0,14 pp de CTR sobre el volumen de 90 d). En 14 días, ~2 clics.
- Por tanto los checkpoints de **7 y 14 días detectan anomalías y dirección, NO tamaño del efecto**. El dimensionado del efecto exige las ventanas de **28/90 días** en posiciones comparables, y **ninguna afirmación de causalidad se sostiene sin 2 ventanas consecutivas** (mismo criterio ya fijado en `docs/growth/GROWTH-03B-SEARCH-INTENT.md:52`).
- En el artículo de coste (dimensión `page`, 90 d): **297 impresiones / 0 clics** → su CTR es 0/297; **1 solo clic = 0,34 pp** en esa página. No se presenta como "mejora del CTR" nada por debajo de esa granularidad.

---

## 3. TAREA 3 — Paquete de evidencia del artículo de coste (sin ediciones)

### 3.1 Estado **en vivo** (2026-11-05, fetched desde producción)

`https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida` → **HTTP 200**, 57 068 bytes de HTML.

| Elemento | Valor servido |
|---|---|
| `<title>` | `Cuánto cuesta desarrollar software a medida | TecnoRia` (53 caracteres) |
| `og:title` | idéntico al `<title>` |
| Meta description | `Analizamos qué influye en el coste de un software a medida, cómo priorizar alcance y cuándo compensa construir una solución propia.` (131 caracteres) |
| `<h1>` | `Cuánto cuesta desarrollar software a medida y de qué depende realmente` (71 caracteres) |
| Canonical | `https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida` (autorreferente) |
| Texto visible total | **2 552 caracteres** (incluye nav/footer) |
| **Cuerpo del artículo** | `<div class="article-richtext">sadasda</div>` → **7 caracteres** |
| `<h2>` en el HTML | 2 (ambos de la sección "Relacionados"); **ninguno** de los 5 h2 del artículo |
| Fecha mostrada | "Publicado el 11 de marzo de 2026" |
| Tiempo de lectura mostrado | **"4 min"** (artefacto: `estimateReadingTime()` sobre un cuerpo de 7 caracteres) |

Comprobación explícita: **las 5 cabeceras del artículo fuente NO están en el HTML servido** (`No compras código…`, `Variables que suelen mover el presupuesto…`, `La mejor forma de reducir riesgo…`, `Qué deberías pedir antes…`, `El coste correcto no es el más bajo…` → `false` las cinco).

**API pública (solo lectura), causa raíz:**

```
GET https://tecnoriasl.com/api/v1/blog/cuanto-cuesta-desarrollar-software-medida  → HTTP 200
slug            : cuanto-cuesta-desarrollar-software-medida
title           : Cuánto cuesta desarrollar software a medida y de qué depende realmente
shortDescription: Un marco realista para entender coste, alcance, arquitectura y prioridad antes de pedir presupuesto.
content         : "sadasda"      (len = 7)
seoTitle        : Cuánto cuesta desarrollar software a medida
seoDescription  : Analizamos qué influye en el coste de un software a medida, cómo priorizar alcance y cuándo compensa construir una solución propia.
tags            : ["Decisión"]   author: TecnoRia   status: publish
publishedAt     : 2026-03-11T00:00:00.000Z
createdAt/updatedAt: 2026-03-12T18:47:20.571Z
```

El listado público `GET /api/v1/blog` devuelve **solo 2 posts publicados**: este y `cuando-automatizar-procesos-empresa`.

**Mecánica (código):** `apps/web/src/app/site/pages/article-page.component.ts:219` consulta primero la API; si la API devuelve fila, la rama `kind:"api"` (`:225-242`) renderiza `current.content` (`:96`). El artículo estático completo (5 secciones) es **solo el fallback** (`:274-323`). Una fila de BD con contenido de marcador **gana** al contenido editorial del repo.

**JSON-LD en vivo** (`<script type="application/ld+json">`, 1 bloque con `@graph`): nodos `ProfessionalService`, `WebSite`, `WebPage`, `BreadcrumbList` (**3 items con nombre**: Home / Recursos / título del artículo) y `Article` (`headline`, `description`, `datePublished = 2026-03-11T00:00:00.000Z`, `dateModified` igual, `image`, `author`, `publisher`, `mainEntityOfPage`). El marcado está bien: **no hay trabajo de schema pendiente**.

### 3.2 Estado **en fuente** (repo, HEAD `68c19cc`)

`apps/web/src/app/site/content/site-content.ts:1430-1508` — artículo `cuanto-cuesta-desarrollar-software-medida`:

- `title`: "Cuánto cuesta desarrollar software a medida y de qué depende realmente"
- `summary`: "Un marco realista para entender coste, alcance, arquitectura y prioridad antes de pedir presupuesto."
- `readingTime`: "7 min" · `ctaLabel`: "Solicitar diagnóstico" · `ctaLink`: "/contacto"
- `serviceLinks[0]`: "Ver el servicio de desarrollo de software a medida" → `/servicios/desarrollo-software-medida` (candidato C de 03B)
- `seo.title`: "Cuánto cuesta desarrollar software a medida" · `seo.description`: la misma que se sirve · `seo.path`: `/blog/cuanto-cuesta-desarrollar-software-medida` · `seo.keywords`: `["cuanto cuesta desarrollar software a medida","precio software a medida"]`
- **5 secciones** con párrafos y bullets: (1) "No compras código…", (2) "Variables que suelen mover el presupuesto", (3) "La mejor forma de reducir riesgo es construir por fases", (4) "Qué deberías pedir antes de aceptar un presupuesto", (5) "El coste correcto no es el más bajo…"

**Consecuencia para GROWTH-03B (verificada, no inferida):**
- El enlace contextual artículo → servicio (candidato C) **no llega a esa URL**. La rama `kind:"api"` construye el objeto **sin `serviceLinks`** (`:225-242`) y **sin `tableOfContents`** (solo en la rama estática, `:295`), mientras la plantilla renderiza el enlace desde `current.serviceLinks` (`:119-124`). Comprobado en el HTML servido: la cadena `"Ver el servicio de desarrollo de software a medida"` **no aparece**.
- Los cambios de texto de ancla (candidato A: `{{ article.title }}` en home / servicios / detalle de servicio / blog) **sí llegan**: el título que devuelve la API es **idéntico** al título estático, y en `/blog` la API sobrescribe la tarjeta estática por slug (`blog-page.component.ts:471-479`) mantendo el mismo texto de título.
- Consecuencia operativa: **desplegar 03B sin tocar el cuerpo del artículo no produce el efecto buscado**. El artículo con 297 impressions y 0 clics seguiría sin cuerpo.

### 3.3 Filas de baseline del artículo y de las consultas comerciales

**Artículo de coste — 90 d (2026-08-05 → 2026-11-02), filas `query+page`, host target: 12 filas, 267 impresiones de fila, 0 clics.**

| Consulta | Imp. | Clics | Pos. media | Rol |
|---|---|---|---|---|
| `desarrollo software a medida precio` | 86 | 0 | 31,29 | **mayor volumen de la página** |
| `cuánto cuesta desarrollar software a medida` | 63 | 0 | 17,16 | **banda 11-20** |
| `cuanto cuesta un software a medida` | 30 | 0 | 18,87 | **banda 11-20** |
| `precio software a medida` | 29 | 0 | 22,90 | banda 20-30 |
| `cuánto cuesta software a medida` | 27 | 0 | 16,93 | **banda 11-20** |
| `software a medida precios` | 11 | 0 | 25,64 | banda 20-30 |
| `precio desarrollo software a medida` | 9 | 0 | 24,00 | banda 20-30 |
| `desarrollo de software a medida precio` | 5 | 0 | 40,80 | banda 40+ |
| `precio de desarrollo de software a medida` | 4 | 0 | 37,25 | banda 30+ |
| `costo de desarrollo de software a la medida` | 1 | 0 | 46,00 | cola |
| `cuanto cuesta un software personalizado` | 1 | 0 | 31,00 | cola |
| `precio desarrollo de software` | 1 | 0 | 51,00 | cola |

Las tres consultas del encargo quedan confirmadas con los mismos valores: **63 / 30 / 27 impresiones, 0 clics, posiciones 17,16 / 18,87 / 16,93**.

**Artículo de coste — 28 d (2026-10-06 → 2026-11-02): 8 filas**, 115 impresiones de fila, 0 clics; misma cabecera (`cuánto cuesta desarrollar software a medida`, 63 imp, pos 17,16), `desarrollo software a medida precio` (26 imp, pos 37,12), `precio software a medida` (16 imp, pos 20,25), `precio desarrollo software a medida` (4, pos 23,50), `precio de desarrollo de software a medida` (3, pos 36,33), `desarrollo de software a medida precio` (1, pos 42), `software a medida precios` (1, pos 29), `cuanto cuesta un software personalizado` (1, pos 31).

**Dimensión `page` (host target):**

| Página | 28 d | 90 d | 480 d |
|---|---|---|---|
| `/blog/cuanto-cuesta-desarrollar-software-medida` | 119 imp · 0 clics · pos 23,08 | **297 imp · 0 clics · pos 23,97** | 492 imp · 0 clics · pos 22,94 |
| `/servicios/desarrollo-software-medida` | 2 imp · 0 clics · pos 42,00 | **77 imp · 0 clics · pos 71,61** | 243 imp · 0 clics · pos 69,44 |
| `/servicios/consultoria-tecnologica` | 5 · 0 · 41,40 | 8 · 0 · 28,50 | 922 · 0 · 63,01 |
| `/servicios/automatizacion-procesos` | 2 · 0 · 4,00 | 5 · 0 · 41,60 | 5 · 0 · 41,60 |
| `/servicios/plataformas-saas` | 0 filas | 5 · 0 · 8,60 | 45 · 0 · 8,04 |
| `/servicios` | 13 · 0 · 2,54 | 27 · 0 · 2,93 | 27 · 0 · 2,93 |
| `/` (https) | 35 · 2 · 6,80 | 107 · 11 · 4,96 | 1 181 · 33 · 34,68 |
| `/` (**http**) | 20 · 0 · 10,70 | **41 · 1 · 11,59** | 312 · 4 · 12,03 |

Las filas `/blog/*` (12 rutas del sitemap) y `/servicios/*` (7 rutas) son el set exacto de "visibilidad de artículos" y "visibilidad de páginas de servicio" a seguir en §2.7.

### 3.4 Estado de indexación (URL Inspection — herramienta existente, solo lectura)

`node scripts/gsc-query.mjs inspect <url>` (scope `webmasters.readonly`, permiso `siteOwner`):

| Campo | Artículo de coste | `/servicios/desarrollo-software-medida` |
|---|---|---|
| `verdict` | PASS | PASS |
| `coverageState` | Submitted and indexed | Submitted and indexed |
| `robotsTxtState` / `indexingState` | ALLOWED / INDEXING_ALLOWED | ALLOWED / INDEXING_ALLOWED |
| `lastCrawlTime` | **2026-10-18T20:26:56Z** | 2026-09-26T04:58:46Z |
| `pageFetchState` | SUCCESSFUL | SUCCESSFUL |
| `googleCanonical` | la propia URL | la propia URL |
| `userCanonical` | la propia URL | la propia URL |
| `crawledAs` | MOBILE | MOBILE |
| `referringUrls` | `/blog/roadmap-producto-b2b-…`, `/mapa-web` | **el artículo de coste**, `http://www.tecnoriasl.com/` |
| `richResultsResult` | PASS, tipo detectado **solo `Breadcrumbs`**, 2 items reportados como "Unnamed item"; **no** reporta `Article` | PASS, solo `Breadcrumbs` |
| `mobileUsabilityResult` | VERDICT_UNSPECIFIED | VERDICT_UNSPECIFIED |

**Discrepancia registrada (no explicada):** el JSON-LD servido contiene un `BreadcrumbList` con **3 items con nombre** y un nodo `Article` completo, mientras la inspección (último rastreo 2026-10-18) reporta **2 items sin nombre** y **ningún** `Article`. Causa: `sin datos` (posible vista parcial/antigua de Google). **Acción:** re-inspeccionar tras un rastreo nuevo tras el despliegue y anotar el nuevo `lastCrawlTime`.

**Sobre HTTP/HTTPS (observado, no lo arregla esta tarea):** `http://tecnoriasl.com/…` → **301** a `https://tecnoriasl.com/…` (Cloudflare) y `https://www.tecnoriasl.com/…` → **301** al apex (nginx), ambos verificados en vivo. **Pero** GSC sigue mostrando `http://tecnoriasl.com/` indexado por separado (41 imp / 1 clic en 90 d). Queda registrado; la corrección de esa señal pertenece a otra tarea.

### 3.5 Competencia SERP actual (web_search — datos externos **no fiables**, solo referencia)

Resultados devueltos para las tres consultas (consulta realizada el 2026-11-05; las páginas **no** son propiedad de TecnoRia y sus cifras **no** son datos nuestros):

| # | URL | Qué aporta al snippet |
|---|---|---|
| 1 | [andersenlab.com — How Much Does Custom Software Development Cost: 2026 Budget Guide](https://andersenlab.com/blueprint/custom-software-development-costs-in-2026) | rangos por tamaño de proyecto |
| 2 | [dediez.software — ¿Cuánto cuesta desarrollar software a medida en España? Guía de precios 2026](https://dediez.software/blog/cuanto-cuesta-software-a-medida-espana/) | tabla por tipo de proyecto + plazos + factores +FAQ |
| 3 | [sprintmarkt.com — ¿Cuánto cuesta un software a medida para tu empresa? Desglose de precios 2026](http://sprintmarkt.com/es/blog/cuanto-cuesta-software-a-medida-espana-2026/) | respuesta directa + tabla + "cuándo NO conviene" + checklist + FAQ |
| 4 | [seiro.io — Coste del software a medida en España (2026)](https://seiro.io/es/blog/coste-software-a-medida-2026) | franja de encargos |
| 5 | [borah.digital — Cuánto cuesta un software a medida: precios reales 2026](https://borah.digital/blog/cuanto-cuesta-software-a-medida) | franjas por tamaño |
| 6 | [blackholdconsulting.com — Cuánto Cuesta el Software a Medida en 2026](https://www.blackholdconsulting.com/software-a-medida/cuanto-cuesta-software-a-medida/) | ejemplos por tipo de herramienta |
| 7 | [appandweb.es — ¿Cuánto Cuesta Desarrollar una App a Medida en 2026?](https://www.appandweb.es/blog/cuanto-cuesta-desarrollar-app-a-medida/) | variante "app" |
| 8 | [arteco-consulting.com — Cuánto Cuesta Desarrollar Software a Medida en 2026](https://www.arteco-consulting.com/articulos/cuanto-cuesta-desarrollo-software-a-medida/) | coste año 1 / año 3 / mantenimiento |

**Estructura común de las páginas que posicionan (verificada leyendo 2 de ellas íntegras: Dediez y Sprintmarkt):**

1. **Respuesta directa** en los primeros 100-150 caracteres con una franja de precio.
2. **Tabla resumen** por tipo de proyecto: precio + plazo orientativo.
3. **Sección "por qué el precio es opaco"** + **factores que mueven el presupuesto** (complejidad funcional, número de roles, integraciones, IA, infraestructura, plazos).
4. **Costes recurrentes**: mantenimiento (% anual), infraestructura, formación, iteraciones.
5. **Señales de alerta en un presupuesto** (precio sin desglose, sin fase de análisis, sin pruebas, plazos imposibles).
6. **Checklist "cómo pedir un presupuesto comparable"**.
7. **FAQ** + CTA a diagnóstico/calculadora.
8. **Honestidad explícita**: ambos declaran que sus cifras son "rangos orientativos del sector", no tarifas propias. Sprintmarkt muestra sus propios productos como ejemplo **"sin cifras de resultado"**.

**Features de SERP (People also ask, FAQ schema en el SERP, snippets con precio):** `sin datos` — no medibles con la herramienta autorizada; no se estiman.

### 3.6 Propuesta de mejora (para GROWTH-04; **no se cambia nada ahora**)

Regla que se respeta en toda la propuesta: **no se inventan presupuestos, precios, números de clientes, plazos de entrega reales ni resultados comerciales**. Cuando la SERP publica rangos, esos rangos son **de terceros**; nuestro contenido debe afirmar **proceso y factores**, no cifras propias.

**(a) RESTAURAR EL CUERPO — BLOQUEANTE, precede a todo lo demás.**
El artículo que concentra 297 impresiones/0 clics en 90 d sirve un cuerpo de 7 caracteres. Sin cuerpo real, ninguna mejora de title, CTA o enlazado interno es atribuible.
Dos vías, ambas **requieren autorización** (esta tarea no toca la BD ni el código):
- **A1 — Actualizar la fila** vía la API editorial `PUT /api/v1/blog/:id` (`requireAdminOrIntegration`, `apps/api/src/routes/v1/blog.ts:184-230`) con el artículo completo. Es la vía que **conserva** la fila y su `publishedAt`.
- **A2 — Retirar la fila** para que caiga el artículo estático completo. Es **destructiva** (DELETE) y además perdería `serviceLinks` y el índice de la página salvo que se propague el bloque estático a la rama API (§b). **No recomendada sin decisión explícita.**
→ **Decisión de GROWTH-04.** Impacto esperado: sin él, el resto de la propuesta no es medible.

**(b) Propagar la estructura editorial a la rama `kind:"api"` (código).**
La rama API debe transportar `serviceLinks` y construir `tableOfContents` a partir del contenido renderizado; si no, el enlace contextual de 03B **nunca** aparece en esta URL (verificado en §3.2). Es el arreglo que hace que (a) y 03B sumen. Cambio pequeño, en `article-page.component.ts`; requiere revisión independiente.

**(c) Cobertura de intención de búsqueda** — encabezados H2/H3 que respondan **literalmente** a las consultas medidas (hoy **0** de ellas tiene encabezado propio):

| Consulta medida (90 d) | Encabezado propuesto (sin cifras inventadas) |
|---|---|
| `cuánto cuesta desarrollar software a medida` (63, pos 17,16) | "¿Cuánto cuesta desarrollar software a medida? Depende de estas 6 cosas" |
| `cuanto cuesta un software a medida` (30, pos 18,87) | "Coste de un software a medida: qué cambia el precio entre un MVP y una plataforma" |
| `cuánto cuesta software a medida` (27, pos 16,93) | "Precio de un software a medida: qué incluye y qué no" |
| `desarrollo software a medida precio` (86, pos 31,29) | "Precio de desarrollo de software a medida: cómo se calcula el presupuesto" |
| `precio software a medida` (29, pos 22,90) | "Presupuesto de software a medida: qué desglose pedir antes de decidir" |
| `software a medida precios` (11, pos 25,64) | "¿Cuánto cuestan los distintos tipos de software a medida?" |
| `precio desarrollo software a medida` (9, pos 24,00) | "Precio de un desarrollo de software a medida: fases y coste por fase" |

Ninguno de estos títulos afirma una cantidad. Sí cubren las consultas que ya generan impresiones.

**(d) Transparencia de factores de coste** — una sección "Qué mueve el presupuesto" con **factores**, no con precios: alcance funcional y número de flujos, usuarios/roles/permisos, integraciones (ERP, pasarelas, APIs), automatizaciones e IA, calidad esperada (QA, documentación, despliegue), urgencia/plazos, soporte y evolución posterior, y **qué queda fuera** de un presupuesto. Esta lista ya existe, parcial, en el artículo estático (`site-content.ts:1468-1478`) y coincide con los factores que la SERP publica: el hueco real es de **profundidad y de desglose**, no de Factor.

**(e) Formas de proyecto realistas (sin precios)** — tres arquetipos con alcance y exclusiones, no con cifras:
1. *Herramienta interna de un equipo* (backoffice, roles limitados, sin integraciones complejas).
2. *Plataforma multi-rol* (roles, permisos, integraciones, soporte y evolución).
3. *Automatización de un proceso* (flujo concreto, integraciones, mantenimiento).
Cada uno con: qué incluye, qué **no** incluye, fases (discovery → primera fase útil → evolución) y qué se necesita del cliente para dimensionarlo. **Prohibido** añadir budgets de clientes, número de proyectos o resultados.

**(f) Diferenciación honesta** — lo que podemos afirmar hoy con respaldo: **método** (discovery, construcción por fases, QA, documentación, plan de evolución), **alcance** (software propio y evolutivo, no plantillas), **cercanía** (equipo en Galicia/España, atención en español) y **transparencia del proceso** (explicamos cómo se calcula un presupuesto). La SERP **no** publica rangos propios verificables: todos los que aparecen se autodescriben como "orientativos del sector". Nuestra ventaja defendible es **publicar el método, no un número que no podemos sostener**.
Opcional y de bajo riesgo: incluir **rangos orientativos citando explícitamente la fuente de mercado** (p. ej. "los rangos que publica X para el mercado español en 2026"), sin presentarlos como tarifa propia. Decisión de GROWTH-04.

**(g) Enlaces internos útiles (medidos, sin araña):**
- → `/servicios/desarrollo-software-medida` (ya implementado en 03B; **no se renderiza** hasta (b)).
- → `/blog/software-medida-vs-herramienta-estandar` (33 imp / 0 clics / pos 25,18 en 90 d): cubre el tema de la SERP "cuándo **no** conviene a medida", que los competidores sí cubren y nosotros no.
- → `/servicios/automatizacion-procesos` y `/servicios/consultoria-tecnologica` (922 imp en 480 d): destinos con demanda medida.
- → `/metodologia`, `/empresa`, `/faq`, `/contacto` (credenciales y proceso).
- → `/casos-de-exito`: **0 filas en 28/90/480 d** → `sin datos`; no se usa como prueba de nada mientras no tenga señal.

**(h) Credibilidad de negocio** — el sitio ya tiene `/empresa`, `/metodologia`, `/casos-de-exito` en el sitemap. La credibilidad debe apoyarse en **método, lugar y garantías de proceso**, no en logotipos de clientes, budgets ni número de proyectos sin registro verificable. **No** publicar nombres de clientes, cifras de facturación, número de proyectos ni resultados comerciales: no hay fuente interna verificable en este repositorio (`sin datos`).

**(i) Title / meta — NO se cambian ahora; propuesta para GROWTH-04.**
El `<title>` vivo (53 caracteres) ya coincide con la consulta principal y es corto; el problema medido es el **cuerpo vacío**, no el título. Secuencia exigida si GROWTH-04 decide tocarlo: **primero (a)**, luego el título, y medir **dos ventanas de 28 días consecutivas** antes de atribuir causalidad (`GROWTH-03B-SEARCH-INTENT.md:52,69`). La meta description (131 caracteres) no aporta un factor diferenciador ni una pregunta respondida: candidata a una variante que enuncie el marco ("qué depende del coste y qué pedir antes de aceptar un presupuesto") **sin inventar cifras**.

**(j) Datos estructurados** — el marcado en vivo es correcto (5 nodos, breadcrumb con nombres, `Article` completo). **No hay trabajo pendiente**; solo re-verificar con URL Inspection tras un rastreo nuevo (§3.4).

**(k) Salvaguarda de medición** — tras cualquier cambio: re-ejecutar `node scripts/gsc-query-page.mjs` y comparar las filas del artículo (28 d y 90 d), dejando pasar el retraso de finalización de 3 días antes de leer cualquier número.

### 3.7 Lo que **no** se ha hecho (explícito)

No se ha modificado `site-content.ts`, ni el título ni la meta del artículo, ni ninguna fila de `blog_posts`, ni ninguna página, ni `apps/**`. No se ha enviado ningún formulario ni se ha contactado con nadie. No se han ejecutado builds ni tests.

---

## 4. Bloqueos y huecos declarados

| # | Bloqueo | Estado |
|---|---|---|
| B1 | **Cuerpo del artículo de coste en producción = `"sadasda"`** (7 caracteres). Bloquea el efecto de 03B y toda medición de CTR | **ABIERTO — decisión GROWTH-04 + autorización operativa** |
| B2 | **T0 (timestamp verificado de despliegue) no existe**; no se puede iniciar la ventana de monitorización | **ABIERTO — depende de la tarea de despliegue** |
| B3 | **No hay planificador autorizado** para el monitoreo orgánico; crearlo exige credenciales nuevas en otro host | **BLOCKED** sin autorización del propietario de la credencial |
| B4 | Las herramientas GSC **no aceptan ventanas ancladas a T0** (`--start/--end` ausente) | **ABIERTO — backlog GROWTH-04** (cambio solo lectura, misma credencial) |
| B5 | `http://tecnoriasl.com/` sigue indexado por separado (41 imp / 1 clic en 90 d) pese al 301 | **ABIERTO — otra tarea** |
| B6 | `googleCanonical` del artículo = `userCanonical` = URL propia ✅; el 301 http→https y www→apex funciona ✅; pero GSC mantiene la variante http | **ABIERTO — otra tarea** |
| B7 | CTR de conversión / tráfico del artículo: GA4 Admin API deshabilitada (H-8) | **sin datos** |
| B8 | Features de SERP (PAA, FAQ schema en SERP) | **sin datos** (no medible con la herramienta autorizada) |
| B9 | `Article` no reportado por URL Inspection pese a estar en el JSON-LD servido | **sin datos** (causa desconocida; re-inspeccionar tras rastreo nuevo) |

---

## 5. Registro de comandos ejecutados

Todos de **solo lectura**. Ninguno escribe en el repositorio (las escrituras fueron a `$env:TEMP`).

| # | Comando | Resultado |
|---|---|---|
| 1 | `node scripts/gsc-query-page.mjs --out "$env:TEMP/gsc-query-page-2026-11-05-verify-t2.json"` | exit 0 · d28 3c/210i · **d90 15c/725i** · d480 79c/35299i · 0 warnings · 0 truncado |
| 2 | `node -e "…read baseline JSON…"` (resumen de ventanas) | baseline 13:39:03Z idéntico al reverificado (delta 0/0) |
| 3 | `node -e "…read fresh export…"` (filas de artículo, servicio, queries, split branded, agregados por página) | tablas de §2.7 y §3.3 |
| 4 | `node scripts/gsc-query.mjs inspect <url>` (artículo y servicio) | PASS / Submitted and indexed / canonical propio (§3.4) |
| 5 | `node -e "fetch(live article + http:// + www://)"` | 200 + 301 + 301; title/meta/h1/canonical/2552 chars; `<div class="article-richtext">sadasda</div>` |
| 6 | `node -e "fetch(GET /api/v1/blog/<slug>)"` | `content = "sadasda"` (7 chars), `status publish`, `publishedAt 2026-03-11` |
| 7 | `node -e "fetch + parse ld+json @graph"` | 5 nodos; BreadcrumbList con 3 items **con nombre**; Article completo |
| 8 | `node -e "fetch home + /blog, extract anchors"` | anclas vivas: `Leer artículo` (home) y `Leer artículo destacado` (/blog) → 03B no desplegado |
| 9 | `web_search` (3 consultas comerciales) | 8 URLs de SERP (§3.5) |
| 10 | `web_fetch` Dediez + Sprintmarkt | estructura de la SERP (§3.5) |
| 11 | `git rev-parse HEAD; git log --oneline -8; git ls-tree -r --name-only 894e7c6 -- apps/api` | HEAD `68c19cc`; `894e7c6` **sí** contiene `notification.ts`, `renotify-leads.ts`, `009_contact_reliability.sql` |
| 12 | `grep "schedule:\|cron" .github` · `grep "cron\|OnCalendar" *.{yml,yaml,sh,service,md}` | **0 coincidencias** en `.github`; único cron documentado = backup de BD en el servidor |

---

## 6. Nota de método y honestidad

- GSC es la **única** fuente de verdad de búsqueda. Ninguna cifra de este documento procede de estimadores externos.
- Los totales provienen **siempre** de la consulta sin dimensiones; las filas por dimensión son **no sumables** y se presentan como segmentación.
- Las cifras de la SERP son de **terceros** y no son datos nuestros; se usan como referencia de estructura, nunca como métrica de TecnoRia.
- Donde no hay evidencia: `sin datos`.
- Nada de lo anterior se presenta como PASS sin comando ejecutado y salida real.
