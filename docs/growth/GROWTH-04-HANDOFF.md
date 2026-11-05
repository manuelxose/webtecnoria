# GROWTH-04 — Handoff y backlog basado en evidencia

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Origen:** cierre de GROWTH-03C (2026-11-05)
**Regla que hereda:** ninguna página nueva sin una consulta medida que la justifique; ninguna cifra
de tráfico, precio, presupuesto o cliente inventada; ninguna afirmación de causalidad sin ventana
comparable.

---

## 1. Lo que GROWTH-03C deja hecho

- Despliegue del código de GROWTH-03B (enlace interno) — ver `GROWTH-03C-DELIVERY.md`.
- **−63,9 %** de JavaScript inicial (725.992 B → 262.338 B); AOT activado en producción.
- Gate de despliegue H-10 diagnosticado y corregido (falso negativo por SIGPIPE).
- Canonicalización verificada: sin defecto.
- Baseline GSC re-verificado e inmutable.
- **Hallazgo crítico nuevo**: el artículo de coste sirve un cuerpo de 7 caracteres en producción.

---

## 2. Prioridad 0 — Contenido del artículo de coste (defecto, no mejora)

**Hecho verificado:** en `https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida`
el HTML servido contiene `<div class="article-richtext">sadasda</div>`. El cuerpo real existe en el
repositorio (`apps/web/src/app/site/content/site-content.ts:1430-1508`) pero **no se renderiza**,
porque `apps/web/src/app/site/pages/article-page.component.ts:219` carga primero la API y la fila de
`blog_posts` (slug del artículo, `content="sadasda"`, `status=publish`) tiene prioridad.

**Evidencia del coste de no arreglarlo:** el artículo acumula 267 impressions en `query+page` y 297
en la dimensión `page` (90 días), **0 clics**, posición media 17-31, con tres consultas comerciales
medidas: 63 imp (pos 17,16), 30 imp (18,87) y 27 imp (16,93). Un cuerpo de 7 caracteres no puede
servir a ninguna de las tres.

| Campo | Contenido |
|---|---|
| Intención objetivo | "cuánto cuesta desarrollar software a medida" y variantes (intención informativa de precio) |
| Mejora propuesta | Restaurar el cuerpo editorial completo. Dos vías, **decisión del propietario**: (a) corregir la fila de `blog_posts` en el CMS, o (b) descartar la fila para que gane el contenido estático |
| Relevancia de negocio | Alta: es el puente natural entre intención de precio y el servicio de desarrollo a medida |
| Evidencia de apoyo | 267-297 impressions, 0 clics, 3 consultas de precio en banda 17-19; URL inspeccionada: indexada, canonical propio |
| Alcance | Contenido, no infraestructura. Sin cambios de `title` en el mismo movimiento |
| Indicador de éxito | A 30 días completos: aparición del cuerpo real, y medición de CTR/posición frente a la línea base congelada |

Además, en la misma rama de render, `tableOfContents` tampoco se propaga a los artículos servidos por
CMS (el bloque "Recorrido del artículo" sólo aparece en contenido estático). Propagarlo exige que el
HTML de la API tenga `id` en sus encabezados, o se generarán anclas rotas: verificar antes.

## 3. Prioridad 1 — Medición y contenido

| # | Mejora | Evidencia | Indicador |
|---|---|---|---|
| 1 | Añadir `--start`/`--end` a `scripts/gsc-query-page.mjs` para ventanas ancladas a T0 | Ninguna herramienta acepta ventanas ancladas; la monitorización depende de ventanas relativas y del `endDate` devuelto | Comparaciones reproducibles sin reinterpretar rangos |
| 2 | Automatizar el informe GSC de sólo lectura | No hay planificador autorizado; poner credenciales requiere autorización del propietario | Checkpoints 7/14/30 sin intervención manual |
| 3 | Revisión de `title`/`description` del artículo de coste | Sólo tiene sentido **después** de restaurar el cuerpo y observar ≥30 días | CTR en las tres consultas de precio, con posición y mix de consultas declarados |
| 4 | Propagación de `tableOfContents` a artículos CMS | Bloque TOC ausente en todos los slugs con fila en `blog_posts` | TOC presente y con anclas válidas |
| 5 | Eliminar los ~40 anclas genéricas `Leer artículo` / `Leer insight` **fuera de la home** | Verificado en producción el 2026-11-05: CTA destacado de `/blog` + 3 tarjetas de relacionados por artículo. La home ya está limpia | 0 anclas genéricas en todo el sitio, con prueba en las 33 rutas |

## 4. Prioridad 1 — Rendimiento

| # | Mejora | Evidencia | Indicador |
|---|---|---|---|
| 1 | Identificar y dividir `chunk-4RZWRMQW.js` | **93.500 B = 35,6 %** del JS inicial ya optimizado; contenido no identificado con evidencia suficiente | Reducción de bytes iniciales con la misma metodología |
| 2 | Reducir peticiones iniciales (35 en la home) | AOT bajó bytes pero no peticiones; el compilador no era una petición aparte | Menos peticiones antes de hidratar |
| 3 | Analizar terceros (widget de chat, analítica tras consentimiento) | El widget ya se difiere a `idle`; falta medir su coste real en el arranque | Bloqueo aproximado y bytes de terceros |
| 4 | Evaluar migración a zoneless | `zone.js` sigue en el bundle; no se toca en un hito de rendimiento por riesgo de hidratación | Cambio de arquitectura con su propio hito |

## 5. Prioridad 1 — Fiabilidad de leads

| # | Mejora | Evidencia | Indicador |
|---|---|---|---|
| 1 | **SMTP (bloqueado externo)** | `EAUTH 534-5.7.9 WebLoginRequired`; ningún cambio de repositorio lo arregla | Transporte verificado sin enviar + un envío interno |
| 2 | Endpoint agregado **sin PII** (`/contact/messages/notification-summary`) | La API actual sólo expone detalle con PII; el panel admin no ve `contact_messages` | Vigilancia diaria sin exponer datos personales |
| 3 | `renotify-leads.ts --dry-run --verbose` | El dry-run sólo imprime contadores: no dice qué lead falló | Lista de candidatos con clase de error |
| 4 | Alerta cuando `pending` supere un umbral | No hay alertas; un fallo de SMTP pasa inadvertido | Detección en minutos, no en días |
| 5 | Reparar `infra/bin/backup-tecnoria-db.sh` y sincronizar la copia de `/usr/local/sbin/tecnoria-db-backup` | **Mismo patrón que H-10**: `gzip -dc "$out" \| pg_restore -l` bajo `pipefail` mata `gzip` con SIGPIPE, el script sale 141 y **nunca ejecuta `chmod 0640`** → el dump de chat queda en `0644` y el log del cron sólo tiene una línea. Reproducido en vivo el 2026-11-05 al hacer el backup previo a la release | Dumps en `0640`, dos líneas `backup ok`, script con exit 0 |
| 6 | Corregir `script_stop` en `.github/workflows/deploy.yml` | La acción SSH instalada **ignora** ese input (anotación de Actions en el run 42082908353): se cree tener "parar en el primer error" y no se tiene | El workflow falla de verdad en el primer error, verificado con una prueba controlada |
| 7 | Aserción de **runtime** para el enlace del artículo servido por CMS (hallazgo F6 de la auditoría) | El test actual es una aserción de texto fuente: pasaría con un fallo de render en tiempo de ejecución | El arnés SSR renderiza el slug y comprueba el `href` |

## 6. Prioridad 2 — Crecimiento comercial

Ninguna de estas acciones se ejecuta sin una consulta medida que la justifique.

| Intención | Página / mejora | Evidencia actual | Estado |
|---|---|---|---|
| Software a medida (comercial) | Reforzar `/servicios/desarrollo-software-medida` | 0 clics en 90 d en todas las `/servicios/*`; ruido de consultas ajenas (WordPress, Soria) | Requiere medición previa del mix de consultas |
| Coste de software | Artículo de coste (P0 §2) | 267-297 imp, 0 clics, pos 17-31 | **Primero restaurar el cuerpo** |
| Desarrollo web comercial | Evaluar landing existente | Sin filas de evidencia separadas | No iniciar sin datos |
| Landing pages | Sin evidencia de demanda | — | **No crear** |
| Automatización | Sin evidencia de demanda en 28/90/480 d | — | **No crear** |
| IA aplicada / chatbots | Sin filas en 28/90/480 d | Ya se decidió no extender `solutionNeeds` en 03B | **No crear** |

**Prohibido por política heredada:** páginas de localización de bajo valor, contenido masivo
generado, backlinks artificiales. Y no crear páginas para consultas WordPress/Soria: son ruido, no
intención de negocio.

## 7. Decisiones que requieren al propietario

1. Vía de corrección del cuerpo del artículo de coste (§2, opción a o b).
2. Autorización para colocar la credencial de GSC en un planificador (servidor o Actions).
3. Acceso de administración a GA4 (H-8): sin él no hay datos de campo ni conversiones.
4. Autorización para que el endulzamiento de `title`/`description` del artículo se ejecute tras la
   ventana de observación.
5. Revisión del cron de backup de BD (modo `0644` de un dump y log incompleto).

## 8. Criterio de cierre de GROWTH-04

Un elemento del backlog sólo se cierra con: consulta/intención declarada, cambio ejecutado con fecha,
ventana comparable registrada y resultado medido o, si no hay efecto, declarado como tal. Un cambio
sin medición no se cierra como "hecho".
