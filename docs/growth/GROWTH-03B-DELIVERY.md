# GROWTH-03B — Entrega

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Hito:** TECNORIA-GROWTH-03B — evidencia de Search Console, línea base de rendimiento móvil y
optimización controlada de enlazado interno
**Commit base:** `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7`
**Fecha:** 2026-11-05

---

## 1. Veredicto — dimensiones separadas

La instrucción exige **no colapsar** las dimensiones. Este es el estado real de cada una:

| Dimensión | Estado | Fundamento |
|---|---|---|
| **Análisis completado** | ✅ **SÍ** | 3 ventanas de GSC con dimensiones consulta+página, 906 filas, sin truncamiento; re-derivado de forma independiente por el auditor |
| **Implementación completada** | ✅ **SÍ** | 3 cambios de enlazado autorizados por evidencia; 7 pruebas nuevas; regresión completa verde |
| **Desplegado en producción** | ❌ **NO** | No se ha desplegado nada. Ver §7 |
| **Mejora de rendimiento demostrada** | ❌ **NO — no demostrada** | No se ha medido mejora alguna. Las páginas medidas no cambiaron de bytes |
| **Mejora de visibilidad en búsqueda demostrada** | ❌ **NO — imposible en este hito** | GSC tarda días en reflejar cambios; no existe ventana posterior. **No se reclama ninguna** |

> **El estado global del hito es PASS (análisis + implementación) CON HALLAZGOS**, y **BLOCKED**
> en despliegue por decisión expresa y por dependencias externas (§7, §8).

---

## 2. Qué se ha producido

### 2.1 Herramientas nuevas

| Archivo | Función |
|---|---|
| `scripts/gsc-query-page.mjs` | Consulta GSC `["query","page"]` paginada, solo lectura, ventanas con retardo de finalización, filtro de host, export JSON determinista |
| `scripts/perf-baseline.mjs` | Banco de rendimiento móvil por CDP con Chrome real: perfil 390×844 @3x, DPR verificado, CPU 4×, Slow 4G, caché aislada por muestra, snapshot inmutable del build con huella SHA-256 |
| `scripts/tests/internal-links.test.mjs` | 6 pruebas de invariantes de enlazado |
| `scripts/tests/perf-baseline.test.mjs` | 6 pruebas de configuración del banco |

### 2.2 Datos

| Archivo | Tamaño |
|---|---|
| `docs/growth/_team/gsc-query-page-2026-11-05.json` | 652.639 B |
| `docs/growth/_team/perf-baseline-2026-11-05-before-links.json` | 381.296 B |
| `docs/growth/_team/perf-baseline-2026-11-05-after-links.json` | 363.437 B |
| `docs/growth/_team/GROWTH-03B-LINK-PLAN.md` | plan verificado de enlaces |
| `docs/growth/_team/GROWTH-03B-AUDIT-INPUT.md` | hallazgos del auditor independiente |

No se commitean trazas crudas ni perfiles CDP completos: solo métricas derivadas.

### 2.3 Documentos

`GROWTH-03B-GSC-EVIDENCE.md` · `GROWTH-03B-SEARCH-INTENT.md` · `GROWTH-03B-PERFORMANCE.md` ·
`GROWTH-03B-INTERNAL-LINKS.md` · `GROWTH-03B-INDEPENDENT-AUDIT.md` · este documento.

---

## 3. Pruebas — comandos reales y resultado real

Todas ejecutadas sobre **los bytes finales** que se entregan:

| Comando | Resultado |
|---|---|
| `npm run test:seo` | ✅ `SEO checks passed: 33 public routes, JSON-LD, 404/301, cache, sitemap and anchor integrity.` |
| `npm run test:consent` | ✅ **22/22**, fail 0 |
| `npm run test:analytics` | ✅ **15/15**, fail 0 |
| `npm run test:api` | ✅ **61/61**, fail 0 (migraciones pasan dos veces, runner pass 1 y 2 exit 0) |
| `npm run test:browser` | ✅ **24/24**, fail 0, sin errores de hidratación |
| `npm run test:links` (nuevo) | ✅ 6/6 |
| `npm run test:perf` (nuevo) | ✅ 6/6 |
| `npm run build:ssr:web` | ✅ `Application bundle generation complete.` |

**Línea base previa:** `test:consent` 22/22 y `test:analytics` 15/15 se ejecutaron **antes** de
cualquier cambio, para que un fallo preexistente no se confundiera con una regresión.

**Control negativo (prueba de mutación):** revertir un ancla al texto genérico produjo
`pass 5 / fail 1` con el mensaje exacto esperado; restaurado el archivo, 6/6. Las pruebas no son
tautológicas.

**Incidencia registrada honestamente:** `test:browser` falló **una vez** (`actual: 2, expected: 1`,
un recuento de `gtag/js`) inmediatamente después de una recompilación, y pasó en las **cuatro
ejecuciones posteriores** (24/24, exit 0). Es un fallo intermitente de recuento de red, no
reproducible, en una suite ya marcada como **no requerida** por su propia inestabilidad conocida
(deuda H-5 del handoff). No se oculta ni se da por resuelto.

---

## 4. Matriz real de modelos (no autoinformada)

Atribución extraída de los registros de sesión del arnés (`assistant/message.source`), **no** de
lo que cada modelo dice ser.

| Rol | Ruta solicitada | Ruta efectiva | Llamadas | Tokens de entrada | Salida | Lectura de caché |
|---|---|---|---|---|---|---|
| seo-evidence-analyst (t1) | MiniMax | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | 47 | 172.455 | 35.046 | 3.269.760 |
| performance-engineer (t2) | MiniMax | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | 79 | 313.178 | 71.694 | 10.391.168 |
| internal-link-architect (t3) | MiniMax | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | 50 | 422.252 | 59.752 | 6.249.927 |
| independent-reviewer (t7) | DeepSeek V4 Pro | `deepseek-official` / `deepseek-v4-pro` | 31 | 51.408 | 32.884 | 2.771.840 |
| Captain (coordinación, t4/t5/t6) | deepseek-flash | `deepseek-official` / `deepseek-flash` | 168 | 121.093 | 61.784 | 21.576.832 |

**Subtotal de especialistas delegados:** 207 llamadas · 959.293 tokens de entrada · 199.376 de
salida · 22.682.695 de lectura de caché.

**Nota de honestidad sobre `b9006493`:** un subagente **no adscrito a ninguna tarea del equipo**
consumió además 50 llamadas y 422.252 tokens de entrada en `openrouter-minimax` antes de ser
detenido. No forma parte del trabajo del equipo y **se contabiliza aparte**, no se suma a la
matriz de tareas.

**GLM:** no se usó. La política lo restringe a extracción acotada tras verificar eficiencia de
tokens; no hubo tarea que lo justificara.
**Claude / Codex:** no se usaron. No se asumió que estuvieran operativos; la revisión independiente
la hizo V4 Pro, de familia distinta a todos los implementadores.

**Coste monetario: `DESCONOCIDO`.** El adaptador instalado no lee metadatos de coste del proveedor.
No se inventa ninguna cifra financiera. Los recuentos de tokens son **medidos** porque el proveedor
los reportó; no se derivan de un contador de conversación.

---

## 5. Referencias Git

| Elemento | Valor |
|---|---|
| Commit base | `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7` |
| Rama | `master` |
| Commit de entrega | **`94de3ab`** — `feat(growth): GSC query+page evidence, mobile perf baseline and evidence-gated link fixes` |
| Alcance del diff | 9 archivos versionados modificados; 5 archivos nuevos de datos y planes; 4 documentos |
| Fuera de alcance tocado | **nada** en `apps/api/**`, `infra/**`, `.github/**`, ni el script compartido `publish-frontend-release.sh` |

---

## 6. Guardas preservadas (verificadas, no supuestas)

| Invariante | Verificación |
|---|---|
| 33 URLs del sitemap | `test:seo` recorre las 33 y exige pertenencia al sitemap |
| Canonical SSR | `test:seo` compara el canonical exacto en cada ruta pública |
| Directivas robots | `index, follow` por ruta; `x-robots-tag: noindex` y sin canonical en 404 |
| JSON-LD | Grafo parseado en todas las rutas; `Service`, `Article`, `BreadcrumbList` |
| 404 reales | `/this-page-does-not-exist-test-123`, `/blog/not-a-real-article`, `/auth-foo` → 404 |
| Redirects heredados | `/nosotros`→`/empresa`, `/auth-cover-login`→`/auth-login`, `/servicios/`→`/servicios`, `/SERVICIOS`→`/servicios` |
| Consent Mode | 24/24 en `test:browser` |
| Sin analítica antes del consentimiento | `test:browser` exige cero peticiones `gtag` antes del consentimiento; el banco de rendimiento confirma GA4 ausente sin consentimiento |
| Seguimiento de leads | `generate_lead` con `form_type`, `service_category`, `source_page`; 15/15 en `test:analytics` |

---

## 7. Despliegue: NO ejecutado

**No se ha desplegado nada.** Motivos, en orden:

1. **La evidencia de mejora no existe todavía.** Un despliegue no puede presentarse como "mejora
   demostrada"; la ventana de medición de GSC (día 7/14/30) no ha ocurrido.
2. **El smoke de despliegue compartido sigue siendo intermitente** (deuda H-10). La instrucción del
   hito prohíbe modificarlo y prohíbe tratar una copia exitosa como prueba de despliegue.
3. **Dependencias externas bloqueadas** (§8) hacen que el semáforo del pipeline no sea fiable.

Los cambios están **probados, aislados y reversibles**: son cambios de texto de ancla y un campo
opcional; revertirlos es un `git revert` de un único commit, sin migraciones ni estado.

---

## 8. Bloqueos que permanecen (sin rebajar gravedad)

| # | Bloqueo | Estado |
|---|---|---|
| H-1 | **Falló la autenticación SMTP (`EAUTH 534-5.7.9`)**; los leads almacenados **no se notifican de forma fiable**; la recuperación de contraseña no entrega | **BLOQUEADO** — requiere rotación de credencial externa. No se inventan credenciales |
| H-2 | Aprobación legal del texto de privacidad/cookies | **BLOQUEADO** — acción del responsable del tratamiento |
| H-3 | Decisión sobre el widget Talkaris | **ABIERTO** — sigue contactando `talkaris.com` antes de cualquier decisión |
| H-4 | Ledger de migraciones | **ABIERTO** (deuda de diseño) |
| H-5 | **CI no ejecuta pruebas**; `test:browser` lanza Chrome con ruta de Windows | **ABIERTO** |
| H-7 | Token de API de Cloudflare para purga selectiva | **BLOQUEADO** |
| H-8 | Acceso admin a GA4 | **BLOQUEADO** — sin él **no hay datos de campo** ni conversiones |
| H-9 | Sincronización de consentimiento entre pestañas | **ABIERTO** |
| H-10 | Smoke de despliegue compartido intermitente | **BLOQUEADO** — no se toca por afectar a otros proyectos del servidor |

**Nuevos hallazgos de este hito:**

- **`http://tecnoriasl.com/` indexado por separado** (12 filas / 21 imp / 0 clics en 90 d). Verificar
  la redirección http→https. **No corregido aquí.**
- **Deriva de rendimiento de ~15–20 % entre sesiones** con el mismo procedimiento. Cualquier
  comparación futura exige tolerancia ≥20 % o un host controlado.

**Sobre la notificación de leads fallidos:** no se ha implementado ningún procedimiento
administrativo nuevo. Confirmado que **no se ha expuesto ninguna PII de leads** en logs, informes o
artefactos, y que **no se ha contactado a ningún lead histórico**. Un parche del camino de
recuperación en servidor queda **pendiente de documentación aparte**, como exige la instrucción,
porque depende de credenciales externas.

---

## 9. Siguiente hito accionable

**GROWTH-03C — contenido de conversión y medición de la ventana**

1. **Medir primero, no tocar después:** ejecutar `node scripts/gsc-query-page.mjs` en día 7, 14 y 30
   y comparar la CTR del artículo de coste y las consultas que aterrizan en
   `/servicios/desarrollo-software-medida`.
2. **Solo entonces** revisar `title`/`description` del artículo de coste contra las tres consultas
   medidas en banda 11–20 (63+30+27 impresiones, 0 clics).
3. Decidir sobre `serviceArticleLinks.automation` (aplazado por muestra insuficiente: 2 filas).
4. Retomar las dos anclas genéricas fuera de alcance (`article-page:157`, `blog-page:184`).
5. **Rendimiento:** atacar el JS (1,36 MiB, 26 scripts, polífills 489 KiB) con una hipótesis
   concreta y el umbral de ≥20 %; sin medir antes y después en el mismo host no hay afirmación.
6. **Bloqueos externos primero:** H-1 (SMTP) y H-8 (GA4) condicionan cualquier cifra de conversión.
