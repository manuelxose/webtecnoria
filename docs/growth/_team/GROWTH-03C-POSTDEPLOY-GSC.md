# GROWTH-03C — Snapshot GSC post-despliegue y registro de intervención

**Tarea:** `t6` · **Rol:** growth-engineer · **Fecha de captura:** 2026-11-05 (UTC) · **Repo:** `webtecnoria`
**Ruta asignada:** `MODEL_ASSIGNMENT class: L2 · primary: openrouter-minimax/minimax-m3.1-flash · escalation: deepseek-official/deepseek-v4-pro`
**Alcance:** SOLO LECTURA. Único fichero escrito por esta tarea: `docs/growth/_team/GROWTH-03C-POSTDEPLOY-GSC.md`.
No se editó el baseline inmutable `docs/growth/_team/gsc-query-page-2026-11-05.json`, no se modificó ninguna implementación, no se ejecutaron builds ni suites de tests, no se escribió en `apps/**`, no se tocó la base de datos.
**Artefactos transitorios fuera del repositorio** (exigidos por las herramientas de solo lectura): export GSC de re-verificación y JSON del monitor, ambos en `%TEMP%`, con SHA-256 en §2.6.

---

## 1. Re-verificación del baseline GSC tras el despliegue

```bash
node scripts/gsc-query-page.mjs --out "$env:TEMP/gsc-query-page-2026-11-05-postdeploy-t6.json"
```

Salida real (verbatim):

```
# service account: guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com
# property: sc-domain:tecnoriasl.com
# scope: https://www.googleapis.com/auth/webmasters.readonly
# rowLimit=25000 maxPages=5 searchType=web dataState=all
# window d28: 2026-10-06..2026-11-02
# window d90: 2026-08-05..2026-11-02
# window d480: 2025-07-11..2026-11-02
--- summary ---
d28 2026-10-06..2026-11-02 totals=3c/210i rowsQueryPage=33 (target 27) rowsPage=19 rowsQuery=30 pagesFetched=1 truncated=false
d90 2026-08-05..2026-11-02 totals=15c/725i rowsQueryPage=64 (target 51) rowsPage=35 rowsQuery=60 pagesFetched=1 truncated=false
d480 2025-07-11..2026-11-02 totals=79c/35299i rowsQueryPage=809 (target 786) rowsPage=92 rowsQuery=511 pagesFetched=1 truncated=false
```

`queriedAt` = **2026-11-05T18:21:39.797Z** · `warnings = []` · `truncated = false` en las tres ventanas.

### 1.1 Comparación con el baseline inmutable (`queriedAt` 2026-11-05T13:39:03.481Z)

| Ventana | Rango exacto | Baseline 13:39:03Z | Re-verificación 18:21:39Z | **Delta** |
|---|---|---|---|---|
| 28 d | 2026-10-06 → 2026-11-02 | 3 clics / 210 imp · CTR 1,4286 % · pos 20,1905 | 3 clics / 210 imp · CTR 1,4286 % · pos 20,1905 | **0 / 0** |
| 90 d | 2026-08-05 → 2026-11-02 | 15 clics / 725 imp · CTR 2,0690 % · pos 26,5724 | 15 clics / 725 imp · CTR 2,0690 % · pos 26,5724 | **0 / 0** |
| 480 d | 2025-07-11 → 2026-11-02 | 79 clics / 35 299 imp · CTR 0,2238 % · pos 52,0005 | 79 clics / 35 299 imp · CTR 0,2238 % · pos 52,0005 | **0 / 0** |

| Ventana | Filas `query+page` (total / host target) | Filas `page` | Filas `query` |
|---|---|---|---|
| 28 d | 33 / 27 | 19 | 30 |
| 90 d | 64 / 51 | 35 | 60 |
| 480 d | 809 / 786 | 92 | 511 |

**Verificación byte a byte:** comparando el export nuevo con el inmutable ignorando `queriedAt`,
`identical_except_queriedAt = true`. Es decir, **el contenido de las tres ventanas es idéntico** al
del baseline; sólo cambia la marca temporal de la consulta.

### 1.2 Veredicto

- **El baseline NO se ha movido: delta 0 clics / 0 impresiones en las tres ventanas.**
- **`endDate` sigue siendo 2026-11-02** en las tres ventanas: no ha aparecido ninguna ventana
  finalizada nueva, pese al despliegue. Ningún dato de GSC cubre todavía el periodo posterior a T0.
- Los totales provienen **solo** de la consulta sin dimensiones; las filas por dimensión no son
  sumables (el artículo de coste da 297 impresiones en la dimensión `page` frente a 267 en la suma de
  sus 12 filas `query+page`).
- Canibalización: **no observada** (no se revive sin evidencia nueva).

---

## 2. Registro de intervención (los 11 campos obligatorios de `GROWTH-03C-GSC-MONITORING.md` §4)

| # | Campo | Valor real (verificado) | Fuente / cómo se obtuvo |
|---|---|---|---|
| 1 | **SHA del commit desplegado** | `72896271b1d37f58ace600ca645eedd522fbab04` (corto `7289627`) · mensaje *"docs(growth): GROWTH-03C release, performance, canonical, lead-risk, monitoring and GROWTH-04 handoff"* · fecha del commit `2026-11-05T19:17:26+01:00` · **árbol de trabajo limpio** (`git status --short` vacío) | `git -C /var/www/webtecnoria rev-parse HEAD` y `git log -1` en el servidor `contabo` |
| 2 | **T0 (UTC) del servidor** | **2026-11-05T18:19:22Z** = **2026-11-05T19:19:22+01:00** · release `20261105_191921` · fingerprint `6fc0aab3907808ab9e4de10df58954554552d7b45eadec2f312d933777217f2d` · `releases/current` → `/var/www/webtecnoria/apps/web/releases/20261105_191921` | `release.json` de `current` **leído del servidor**: `{"app":"tecnoria-web","releasedAt":"2026-11-05T19:19:22+01:00","service":"tecnoria-web.service","fingerprint":"6fc0aab3…17f2d"}`. **T0 confirmado desde el servidor**, no desde el timestamp del commit (19:17:26) |
| 3 | **`run id` de Actions** | `42082908353` · workflow *"Deploy a producción (Contabo)"* · evento `push` · rama `master` · `headSha` = `72896271b1d37f58ace600ca645eedd522fbab04` (coincide con el HEAD del servidor) · creado `2026-11-05T18:18:09Z` · terminado `2026-11-05T18:19:29Z` · URL `https://github.com/manuelxose/webtecnoria/actions/runs/42082908353` | `gh run view 42082908353 --json …` |
| 4 | **Código de salida del despliegue y del smoke** | **Despliegue: exit 0** — job `deploy` (id `127440346621`) con `conclusion = success`, `status = completed`, 18:18:12Z→18:19:28Z; el propio script imprime `Deploy webtecnoria OK: 7289627`. El smoke es la **última puerta funcional** del script (`infra/bin/publish-frontend-release.sh:313-316`, `set -euo pipefail`, `exit 1` si falla), de modo que exit 0 implica smoke superado.<br>**Smoke: PASS.** Salida verbatim del despliegue (`docs/growth/GROWTH-03C-DELIVERY.md` §2): `==> tecnoria-web: validating staging dist` → `==> tecnoria-web: publishing release` → `==> tecnoria-web: reloading systemd and restarting tecnoria-web.service` → `==> tecnoria-web: release published` → `Deploy webtecnoria OK: 7289627`. **El mensaje de fallo `Expected text not found` NO aparece**: la aserción, que fallaba 200/200 con el cuerpo de 125 KB, pasa en el pipeline real.<br>**Independiente y reproducible:** re-ejecutada en lectura sobre el despliegue vivo, con el mismo comando y la misma aserción del script (`curl -fsS --max-time 15 --retry 3 --retry-connrefused --retry-delay 1 --resolve tecnoriasl.com:443:127.0.0.1 -k https://tecnoriasl.com/` + `grep -Fq -- "TecnoRia"`) → `HTTP 200`, cuerpo **125 244 B**, `SMOKE_ASSERTION=PASS`, **"TecnoRia" × 23**.<br>**Log íntegro del run vía `gh`: sin datos** — `gh run view --job 127440346621 --log` devuelve 0 bytes (log no recuperable por API); la evidencia verbatim es la del delivery anterior | `gh run view` (jobs) · `docs/growth/GROWTH-03C-DELIVERY.md` §2 · SSH de solo lectura al servidor (curl + grep idénticos) |
| 5 | **`ActiveEnterTimestamp` del servicio** | `tecnoria-web`: **Thu 2026-11-05 19:19:23 CET** (= 18:19:23Z, 1 s después de `releasedAt`) · `ActiveState=active`, `SubState=running`<br>`tecnoria-api`: **Thu 2026-11-05 19:18:38 CET** (= 18:18:38Z) · `ActiveState=active`, `SubState=running` — la API se reinició **44 s antes** del release web (el script de despliegue la reinicia tras las migraciones) | `systemctl show tecnoria-web -p ActiveEnterTimestamp -p ExecMainStartTimestamp -p ActiveState -p SubState` (idem `tecnoria-api`) |
| 6 | **SHA-256 de los exports GSC previos** | Baseline inmutable `docs/growth/_team/gsc-query-page-2026-11-05.json`: `6f2b97a9f14ffdf7f73d2741d4ad6041e9cf20ec40b8bba7d378300a7c59e0ba` (652 639 B)<br>Re-verificación post-despliegue (`%TEMP%\gsc-query-page-2026-11-05-postdeploy-t6.json`): `bbace54bae051924bb6ced9e832868f38bd09010f358e2b850f5be5b471d20f8` (652 639 B)<br>JSON del monitor (`%TEMP%\t6-monitor-20261105.json`): `0e3a62f310f87bed1020a030766b28fcbb887da4d6c51f05926dab7534ddc07d` (3 441 B) | `Get-FileHash -Algorithm SHA256` |
| 7 | **Rango exacto de cada ventana** | Datos disponibles hoy (las tres terminan **antes** de T0): 28 d `2026-10-06 → 2026-11-02` · 90 d `2026-08-05 → 2026-11-02` · 480 d `2025-07-11 → 2026-11-02`<br>Ventanas relativas que devolverá la herramienta en cada fecha de lectura → §3 | Salida del script + `FINALISATION_OFFSET_DAYS = 3` (`scripts/gsc-query-page.mjs:30`) |
| 8 | **`queriedAt`** | Baseline inmutable: `2026-11-05T13:39:03.481Z` · re-verificación post-despliegue: **`2026-11-05T18:21:39.797Z`** · monitor: `generatedAt 2026-11-05T18:22:39.899Z` | Cabeceras de cada JSON |
| 9 | **Declaración de cambio exclusivo (qué se cambió y qué NO)** | `git diff --name-status 894e7c6 7289627` → **42 ficheros, +66 567 / −13**. Cambiado: `apps/web/angular.json` (AOT), `apps/web/src/polyfills.ts` (JIT fuera), `apps/web/src/app/site/content/site-content.ts`, `pages/{article,blog,home,service-detail,services}-page.component.ts`, `infra/bin/publish-frontend-release.sh` (fix H-10), `package.json`, `qa/qa-manifest.json`, `scripts/{gsc-query-page.mjs,perf-baseline.mjs,seo-check.ts,tests/internal-links.test.mjs,tests/perf-baseline.test.mjs}`, `.gitignore` y `docs/**`.<br>**NO cambiado: `apps/api/**` (ninguna ruta, ningún middleware, ninguna migración), `apps/api/migrations/**`, `.github/workflows/**`, ni ninguna fila de base de datos.**<br>**Consecuencia medida:** el release **no cambió el contenido del artículo** — el cuerpo sigue siendo `"sadasda"` (ver §5). El release cambió **enlazado interno, texto de anclas, AOT/polyfills y la aserción del smoke**. | `git diff --name-status` (local, mismo par de commits que el servidor) |
| 10 | **Operador y aprobador** | **Operador:** push a `master` desde la cuenta de GitHub autenticada `manuelxose`; ejecución remota por el usuario de despliegue `deploy` en `contabo` a través del workflow autorizado (nada fuera de ese flujo).<br>**Aprobador:** autorización del producto registrada el **2026-11-05** (puerta de despliegue condicionada a que pasasen las puertas, `GROWTH-03C-RELEASE.md` §5).<br>**Revisión independiente obligatoria:** familia **DeepSeek V4 Pro** (distinta de los implementadores MiniMax/GLM) → **PASS**, sin hallazgo crítico ni alto abierto; el único hallazgo medio (F2, procedencia del script compartido) queda confirmado ahora: `/var/www/bin/publish-frontend-release.sh` instalado en el servidor = `sha256 0ea046c4a33bb6703e17e73d08f41d086dc470c3e1b4da4d0327beda477831fa`, **idéntico** a la copia del repo · mtime `2026-11-05 19:01:16 +0100`.<br>Nombre de persona física: **sin datos**. | `docs/growth/_team/GROWTH-03C-REVIEW-INPUT.md` §Verdict · `gh auth status` · `sha256sum` en el servidor |
| 11 | **JSON del monitor** | `node scripts/growth-monitor.mjs --out %TEMP%\t6-monitor-20261105.json` → `generatedAt 2026-11-05T18:22:39.899Z`, `base https://tecnoriasl.com`, **OVERALL PASS** (pass=9, fail=0, skip=0, unknown=1), SHA-256 en el campo 6.<br>Checks: `GET /` 200 (125 917 B) · `<title>` presente · sitemap 33 `<loc>` · ruta desconocida 404 · 0 `<script src=googletagmanager>` estático · default de consentimiento con `analytics_storage:'denied'` · `POST /api/v1/contact` con `{}` → 400 · TLS 52 días restantes (vál. 2026-12-28) · TTFB 352 ms (presupuesto 2 000 ms) · **`release_id` = UNKNOWN** (el HTML servido no expone identificador de release; la identidad de la release queda confirmada por `release.json` + symlink en el servidor, no por el HTML). | Ejecución local, salida a `%TEMP%` (fuera del repo) |

---

## 3. Fechas de lectura de los tres checkpoints

T0 = **2026-11-05T18:19:22Z** (Madrid 19:19:22 +01:00). Retraso de finalización de GSC = **3 días** (`FINALISATION_OFFSET_DAYS = 3`).

| Checkpoint | Días completos tras T0 | Días post-despliegue que cubre | **Fecha de lectura (no antes de)** | Hora local (Madrid) | Ventana relativa que devolverá la herramienta ese día |
|---|---|---|---|---|---|
| **Día 7** | 7 | 2026-11-06 → 2026-11-12 | **2026-11-15** | 2026-11-15T19:19:22+01:00 | d28 `2026-10-16 → 2026-11-12` · d90 `2026-08-15 → 2026-11-12` · d480 `2025-07-21 → 2026-11-12` |
| **Día 14** | 14 | 2026-11-06 → 2026-11-19 | **2026-11-22** | 2026-11-22T19:19:22+01:00 | d28 `2026-10-23 → 2026-11-19` · d90 `2026-08-22 → 2026-11-19` · d480 `2025-07-28 → 2026-11-19` |
| **Día 30** | 30 | 2026-11-06 → 2026-12-05 | **2026-12-08** | 2026-12-08T19:19:22+01:00 | d28 `2026-11-08 → 2026-12-05` · d90 `2026-09-07 → 2026-12-05` · d480 `2025-08-13 → 2026-12-05` |

**Las tres fechas de lectura son: 2026-11-15, 2026-11-22 y 2026-12-08.**

> **Limitación operativa vigente:** ninguna herramienta acepta ventanas ancladas a T0
> (`gsc-query-page.mjs` no expone `--start`/`--end`). En cada checkpoint hay que leer el `endDate`
> devuelto y **extraer a mano** los días post-despliegue (p. ej. el 2026-11-12 → 2026-11-06..12) de
> las filas `query+page`; el total sin dimensiones seguirá siendo el de la ventana calendario, no el
> de la ventana anclada. Es el primer elemento del backlog de GROWTH-04.
> En cada lectura: exportar con `node scripts/gsc-query-page.mjs --out <ruta con fecha>` y **nunca**
> sobrescribir el baseline.

---

## 4. Línea base previa al despliegue, congelada, para las dos páginas que cambiaron

Valores tomados del export de re-verificación post-despliegue (contenido **idéntico** al baseline
inmutable salvo `queriedAt`), filas de la dimensión `page` con **host objetivo**
(`tecnoriasl.com` / `www.tecnoriasl.com`), y filas `query+page` del mismo filtro.

### 4.1 Artículo de coste — `/blog/cuanto-cuesta-desarrollar-software-medida`

| Ventana | Rango | Clics | Impresiones | CTR | Posición media | Filas `query+page` (imp. de fila / clics de fila) |
|---|---|---:|---:|---:|---:|---|
| 28 d | 2026-10-06 → 2026-11-02 | **0** | **119** | 0,0000 % | **23,0756** | 8 filas → 115 imp / 0 clics |
| 90 d | 2026-08-05 → 2026-11-02 | **0** | **297** | 0,0000 % | **23,9663** | 12 filas → 267 imp / 0 clics |

Filas `query+page` del artículo en 90 d (congeladas):

| Consulta | Imp. | Clics | Pos. |
|---|---:|---:|---:|
| `desarrollo software a medida precio` | 86 | 0 | 31,29 |
| `cuánto cuesta desarrollar software a medida` | 63 | 0 | 17,16 |
| `cuanto cuesta un software a medida` | 30 | 0 | 18,87 |
| `precio software a medida` | 29 | 0 | 22,90 |
| `cuánto cuesta software a medida` | 27 | 0 | 16,93 |
| `software a medida precios` | 11 | 0 | 25,64 |
| `precio desarrollo software a medida` | 9 | 0 | 24,00 |
| `desarrollo de software a medida precio` | 5 | 0 | 40,80 |
| `precio de desarrollo de software a medida` | 4 | 0 | 37,25 |
| `costo de desarrollo de software a la medida` | 1 | 0 | 46,00 |
| `cuanto cuesta un software personalizado` | 1 | 0 | 31,00 |
| `precio desarrollo de software` | 1 | 0 | 51,00 |

### 4.2 Landing de servicio — `/servicios/desarrollo-software-medida`

| Ventana | Rango | Clics | Impresiones | CTR | Posición media | Filas `query+page` (imp. de fila / clics de fila) |
|---|---|---:|---:|---:|---:|---|
| 28 d | 2026-10-06 → 2026-11-02 | **0** | **2** | 0,0000 % | **42,0000** | 2 filas → 2 imp / 0 clics |
| 90 d | 2026-08-05 → 2026-11-02 | **0** | **77** | 0,0000 % | **71,6104** | 5 filas → 54 imp / 0 clics |

Filas `query+page` de la landing en 90 d: `desarrollo web soria` 30 imp pos 72,4 · `pagina web wordpress soria` 17 imp pos 80,1 · `diseño web wordpress soria` 5 imp pos 85,2 · `consultoria de software a medida` 1 imp pos 18 · `desarrollo de software a la medida` 1 imp pos 66.

### 4.3 Reglas de comparación heredadas del baseline

- Los totales se derivan **solo** de la consulta sin dimensiones; las filas por dimensión **no se
  suman** (297 imp en `page` ≠ 267 imp de las 12 filas `query+page`; 77 imp ≠ 54 imp).
- **Regla branded congelada:** `tecnoria`, `teknoria`, `tecnoloyia`, `tecnologia`, `tecno`
  (sin distinguir mayúsculas ni acentos), con **2 falsos positivos conocidos**. Split medido en 90 d:
  branded 11 filas / 2 clics / 43 imp · non-branded 40 filas / 0 clics / 370 imp.
- Ventanas comparables = misma longitud, misma propiedad, mismo `searchType=web`, `dataState=all`,
  mismo offset de finalización, mismo filtro de host (excluir `clientes.` y `cms.`).

---

## 5. Estado post-despliegue de las páginas que cambiaron (verificado en vivo, 2026-11-05)

| Elemento | Antes (producción `894e7c6`) | Ahora (producción `7289627`) |
|---|---|---|
| Enlace contextual artículo → servicio (`/servicios/desarrollo-software-medida`) | **ausente** | **presente** ("Ver el servicio de desarrollo de software a medida") |
| Anclas de entrada al artículo desde `/` y desde `/servicios/desarrollo-software-medida` | "Leer artículo" | **"Cuánto cuesta desarrollar software a medida y de qué depende realmente"** |
| Ancla en `/blog` | "Leer artículo destacado" | "Leer artículo destacado" (CTA de artículo destacado, explícitamente fuera del alcance de 03B) |
| `<title>` / meta description / H1 / canonical del artículo | 53 car. / 131 car. / 71 car. / autorreferente | **sin cambios** (53 / 131 / 71 / autorreferente) |
| **Cuerpo del artículo (`article-richtext`)** | `"sadasda"` (7 car.) | **`"sadasda"` (7 car.) — sin cambios**; 0 de los 5 H2 de origen |

> **Aviso de honestidad del registro:** el release mejoró el enlazado, **pero no el contenido**. El
> artículo que concentra 297 impresiones y 0 clics en 90 d sigue sirviendo un cuerpo de 7 caracteres.
> Cualquier lectura de las ventanas de §4 medirá, por tanto, el efecto de los enlaces sobre una
> página cuyo defecto de contenido **permanece abierto** (no se resuelve en GROWTH-04 por decisión
> de este hito; queda como backlog).

---

## 6. Lo que **NO** puede concluirse todavía, y por qué

No puede concluirse **ningún** efecto del despliegue sobre la visibilidad en búsqueda: **no existe
ninguna ventana post-despliegue**. La propiedad GSC sólo entrega datos finalizados y la última fecha
finalizada sigue siendo **2026-11-02**, tres días **anterior** a T0 (2026-11-05T18:19:22Z); por tanto
las tres ventanas disponibles (28/90/480 días) terminan **enteramente antes del despliegue** y
describen el estado previo, no el posterior — el delta medido contra el baseline inmutable es
exactamente **0/0** en las tres. Los checkpoints de **7 y 14 días** sirven para **detectar
anomalías** (caída a cero, error de indexación), **no para demostrar efecto**: a 0,167 clics/día una
ventana de 7 días contiene ≈1,2 clics esperados y su cambio mínimo detectable es **1 clic**
(≈0,14 pp de CTR sobre 725 impresiones), de modo que un clic aislado es indistinguible del ruido, y
la ventana de 14 días sigue por debajo del cambio mínimo de 2 clics. La primera lectura con datos
que incluyan el despliegue es la del **2026-11-15**, y el tamaño del efecto sólo podrá valorarse en
la ventana de 30 días (**2026-12-08**), y **sin causalidad**: el mismo release no cambió el cuerpo
del artículo (sigue siendo `"sadasda"`) ni ningún fichero de `apps/api/**`, y ninguna herramienta
permite recortar la ventana a los días exactos posteriores a T0 — cualquier delta entre ventanas
medirá los enlaces junto a factores externos, no una mejora de contenido.

---

## 7. Registro de comandos ejecutados (todos de solo lectura)

| # | Comando | Resultado |
|---|---|---|
| 1 | `node scripts/gsc-query-page.mjs --out "$env:TEMP/gsc-query-page-2026-11-05-postdeploy-t6.json"` | exit 0 · d28 3c/210i · **d90 15c/725i** · d480 79c/35299i · endDate 2026-11-02 · `warnings=[]` · `truncated=false` · `queriedAt 2026-11-05T18:21:39.797Z` |
| 2 | `node -e "<comparar export nuevo vs inmutable ignorando queriedAt>"` | `identical_except_queriedAt = true` · filas por página del artículo y del servicio en 28 d y 90 d (tablas de §4) |
| 3 | `Get-FileHash -Algorithm SHA256` (baseline, export nuevo, monitor) | `6f2b97a9…e0ba` (652 639 B) · `bbace54b…d20f8` (652 639 B) · `0e3a62f3…c07d` (3 441 B) |
| 4 | `ssh contabo '<release.json, readlink current, git HEAD/log/status, systemctl show tecnoria-web, systemctl show tecnoria-api>'` | `releasedAt 2026-11-05T19:19:22+01:00` · fingerprint `6fc0aab3…17f2d` · HEAD `72896271b1d37f58ace600ca645eedd522fbab04` · árbol limpio · web `ActiveEnterTimestamp Thu 2026-11-05 19:19:23 CET` · api `Thu 2026-11-05 19:18:38 CET` · ambos `active/running` |
| 5 | `ssh contabo '<ls releases; sha256sum /var/www/bin/publish-frontend-release.sh>'` | releases retenidas `20261105_011306 / 011656 / 012220 / 052852 / 191921` (objetivo de rollback `012220` presente) · script compartido `0ea046c4…31fa`, mtime 19:01:16 +0100 (idéntico a la copia del repo) |
| 6 | `ssh contabo '<curl --resolve … -k + grep -Fq "TecnoRia" (misma aserción del smoke)>'` | `HTTP 200` · cuerpo 125 244 B · `SMOKE_ASSERTION=PASS` · "TecnoRia" × 23 |
| 7 | `gh run view 42082908353 --json …` y `--json jobs` | run: `success` / `completed`, push→master, `headSha 72896271…`, 18:18:09Z→18:19:29Z · job `deploy` (127440346621) `conclusion=success` |
| 8 | `gh run view 42082908353 --job 127440346621 --log` | **0 bytes** — el log íntegro del run no es recuperable vía API; la evidencia verbatim del despliegue (incluido `==> tecnoria-web: release published` y `Deploy webtecnoria OK: 7289627`, y la **ausencia** de `Expected text not found`) está en `docs/growth/GROWTH-03C-DELIVERY.md` §2 |
| 9 | `node scripts/growth-monitor.mjs --out "%TEMP%\t6-monitor-20261105.json"` | exit 0 · OVERALL PASS (9 pass / 0 fail / 0 skip / 1 unknown) · `generatedAt 2026-11-05T18:22:39.899Z` |
| 10 | `git diff --name-status 894e7c6 7289627` y `--shortstat` | 42 ficheros, +66 567 / −13 · **sin** `apps/api/**`, **sin** migraciones, **sin** `.github/**` |
| 11 | `node -e "<fetch de /blog/…, /servicios/…, / y extracción de anclas + article-richtext + title/canonical/h1>"` | título/meta/H1/canonical sin cambios · `article-richtext = "sadasda"` · enlace contextual presente · anclas = título del artículo en `/` y en la landing de servicio |
| 12 | `node -e "<cálculo de fechas de lectura y ventanas relativas por checkpoint>"` | 2026-11-15 / 2026-11-22 / 2026-12-08 (§3) |

---

## 8. Nota de método

- GSC es la única fuente de verdad de búsqueda; ninguna cifra de este documento procede de estimadores.
- Los totales se derivan **solo** de la consulta sin dimensiones; las filas por dimensión no son sumables.
- T0 se ha confirmado **desde el servidor** (`release.json` + symlink `current` + `ActiveEnterTimestamp`),
  no a partir del timestamp del commit (que era 19:17:26+01:00, anterior al release).
- Todo lo que no tiene evidencia directa está marcado **sin datos** (log íntegro del run recuperable vía
  API, nombre de la persona física que ejecutó el push, datos post-despliegue de GSC).
- Ninguna afirmación de mejora, efecto o causalidad se hace en este documento.

