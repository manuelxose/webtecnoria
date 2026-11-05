# GROWTH-03B — Auditoría independiente

**Auditor:** `independent-reviewer` · **DeepSeek V4 Pro** (`deepseek-official/deepseek-v4-pro`, reasoning high)
**Familia distinta** de la de todos los implementadores (MiniMax M3.1 Flash y el Captain).
**Tarea:** G03B-07 (t7) · **Entrada:** `docs/growth/_team/GROWTH-03B-AUDIT-INPUT.md`
**Base auditada:** `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7` + cambios del árbol de trabajo

---

## 1. Veredicto

> **PASS WITH FINDINGS** — 0 bloqueantes · 0 altos · **2 medios** · 5 bajos.

Los nueve puntos de alcance resultaron **PASS**. El auditor **no** aceptó los resúmenes de los
especialistas: re-derivó los números directamente del JSON bruto y **volvió a ejecutar** las
pruebas por su cuenta.

| # | Punto de alcance | Veredicto |
|---|---|---|
| 1 | Interpretación de GSC (scope, paginación, offset, no aditividad, filtro de host) | PASS |
| 2 | Veredicto de canibalización (prueba de misma consulta, no de palabras clave) | PASS |
| 3 | Metodología del banco de rendimiento | PASS |
| 4 | Corrección de la emulación de dispositivo | PASS |
| 5 | Ausencia de regresiones SEO | PASS |
| 6 | Calidad de las pruebas | PASS |
| 7 | Seguridad (sin secretos, sin PII de leads, scope de solo lectura) | PASS |
| 8 | Preservación del consentimiento | PASS |
| 9 | Alcance del diff de Git | PASS |

## 2. Re-derivación independiente de cifras

Confirmado por el auditor desde el JSON bruto:

- Totales d28 `3 clics / 210 imp`, d90 `15 / 725`, d480 `79 / 35.299` — **CONFIRMADO**.
- Recuentos de filas 33/19/30, 64/35/60, 809/92/511; `pagesFetched=1`, `truncated=false` — **CONFIRMADO**.
- Artículo de coste: d28 8 filas / 115 imp / 0 clics; d90 12 / 267 / 0 — **CONFIRMADO**.
- Servicio: d28 2 / 2; d90 5 / 54 (52 imp = consultas locales «soria») — **CONFIRMADO**.
- `http://` indexado por separado: d90 12 / 21 / 0 — **CONFIRMADO**.
- Conjunto de consultas compartido artículo ∩ servicio en d28 y d90 — **VACÍO** (re-derivado).
- Rendimiento: 10/10 y 10/10 muestras, DPR=3 en todas, medianas idénticas a las de t2, commit
  `894e7c6` registrado, `sourceChangedDuringRun=false` — **CONFIRMADO**.

## 3. Hallazgos y resolución

| id | Sev. | Hallazgo | Resolución del Lead |
|---|---|---|---|
| **F1** | **Medio** | Deriva de medianas absolutas **~15–20 % entre sesiones** con el mismo procedimiento; la variación intra-sesión (−3,9/−4,0 %) **subestima** la variabilidad total | **ACEPTADO y documentado**: `GROWTH-03B-PERFORMANCE.md` §7.3. Regla nueva: cualquier comparación futura de rendimiento exige **tolerancia ≥20 %** o host/CI controlado; prohibido citar −4 % como variabilidad esperada |
| **F2** | **Medio** | `.dsh-tmp/` (24 scripts de diagnóstico) y `.serena/` estaban **sin versionar y sin ignorar**; un `git add -A` los habría commiteado | **CORREGIDO**: añadidos a `.gitignore` junto a `.dsh/`/`.specify/`, conforme a la convención «local-only» ya existente. Verificado que no entran en el commit |
| **F3** | Bajo | `perf-baseline-2026-11-05.json` y `-BEFORE-links.json` eran **duplicados byte a byte**, y el nombre «BEFORE» era **engañoso**: ese árbol ya tenía los 6 archivos de enlaces modificados | **CORREGIDO**: duplicado eliminado; archivos renombrados a `-before-links.json` / `-after-links.json`; **§7.2 del informe de rendimiento reescrita** para declarar que **no existe medición previa del código anterior** y que las sesiones sirvieron builds distintos (`7074c99…` vs `5888527…`) con bytes de página idénticos |
| **F4** | Bajo | Dos aserciones de `test:perf` eran más débiles de lo que aparentaban: *fallback* `?? 3` (tautología latente) y comprobación de orden por texto, no de ejecución | **CORREGIDO**: se exige que `device.effectiveDevicePixelRatio` **exista y sea número** (sin valor por defecto) y se comprueba la comparación real `effectiveDpr !== DEVICE.deviceScaleFactor`; el chequeo de orden se declara **explícitamente** como textual. Prueba duplicada eliminada. 7/7 pass |
| **F5** | Bajo | Los tests de enlaces parsean el TS por regex en lugar de importar el modelo | **ACEPTADO sin cambio**, como el propio auditor indica: la cobertura real la dan las aserciones sobre HTML SSR en `test:seo` |
| **F6** | Bajo | «REFUTED» era demasiado rotundo dada la supresión de consultas de bajo volumen | **CORREGIDO**: `GROWTH-03B-GSC-EVIDENCE.md` §2 ahora dice «no hay canibalización **observada en los datos disponibles**» y explica la limitación |
| **F7** | Bajo | El export registra el correo de la cuenta de servicio `guiatv-gsc@…` (identificador, no secreto; el proyecto GCP se llama `guia-tv`) | **ACEPTADO**: es la misma cuenta `siteOwner` ya usada en GROWTH-02 sobre `sc-domain:tecnoriasl.com`; el vínculo cuenta↔propiedad es intencional y está verificado en vivo. Se conserva porque identifica inequívocamente la fuente de la evidencia. **No contiene claves ni tokens** |

## 4. Ejecuciones del auditor (independientes de las del Lead)

| Comando | Resultado |
|---|---|
| `npm run test:seo` | PASS — 33 rutas incl. integridad de anclas |
| `node --test scripts/tests/internal-links.test.mjs` | 6/6 |
| `node --test scripts/tests/perf-baseline.test.mjs` | 6/6 (ahora 7/7 tras F4) |

## 5. Incidencia adicional encontrada por el Lead (no por el auditor)

Durante la verificación posterior al endurecimiento de anclas, el Lead detectó que al mover el
enlace dentro del `<h3>` **se habían perdido las clases `text-link text-link--light`**, lo que
habría dejado el enlace con el color oscuro por defecto sobre una tarjeta oscura. **Corregido**
antes de la entrega y verificado: la página de servicio crece 402 bytes (75.384 → 75.786) por las
clases restauradas. Este hallazgo es del propio Lead sobre su propio trabajo; se documenta porque
una auditoría honesta incluye los defectos propios.

## 6. Nota sobre la independencia

El auditor no escribió ninguna de las líneas auditadas: los implementadores fueron dos miembros
MiniMax (`seo-evidence-analyst`, `performance-engineer`, `internal-link-architect`) y el Captain
(DeepSeek Flash) para los cambios de enlaces y las pruebas. DeepSeek V4 Pro **no** participó en
la implementación. Las correcciones F2–F6 fueron **aplicadas por el Lead** y verificadas por
ejecución posterior, no re-auditadas por un tercero: esa es una limitación real de este hito y se
declara como tal.
