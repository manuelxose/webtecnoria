# GROWTH-03C — Monitorización de visibilidad en búsqueda

**Proyecto:** TECNORIA · propiedad `sc-domain:tecnoriasl.com`
**Fecha:** 2026-11-05 · Detalle en `docs/growth/_team/GROWTH-03C-GSC-INPUT.md`

> Regla de oro de este documento: **la observación empieza en la fecha de despliegue verificado, no
> en la fecha del commit**, y sólo se leen ventanas **finalizadas**. Nada aquí se interpreta como
> causalidad.

---

## 1. Línea base inmutable (re-verificada hoy, no recalculada de memoria)

| Ventana | Clics | Impresiones | Rango exacto |
|---|---:|---:|---|
| 28 días | 3 | 210 | 2026-10-06 → 2026-11-02 |
| 90 días | **15** | **725** | 2026-08-05 → 2026-11-02 |
| 480 días | 79 | 35.299 | 2025-07-11 → 2026-11-02 |

- Re-consultado el 2026-11-05T16:10:39Z con `node scripts/gsc-query-page.mjs` (sólo lectura):
  **delta 0 clics / 0 impresiones** frente al export inmutable de las 13:39:03Z. No ha aparecido
  ninguna ventana finalizada nueva: `endDate` sigue en **2026-11-02**.
- Los totales se derivan **sólo** de la consulta sin dimensiones. Las filas por dimensión no son
  sumables: 906 filas = 33 + 64 + 809 de las tres ventanas. El artículo de coste da 297 impresiones
  en la dimensión `page` frente a 267 en sus 12 filas `query+page`.
- Reparto medido en 90 días — **branded** 11 filas / 2 clics / 43 impresiones; **non-branded** 40
  filas / 0 clics / 370 impresiones.
- Regla de marca congelada para comparabilidad: `tecnoria`, `teknoria`, `tecnoloyia`, `tecnologia`,
  `tecno`, con **2 falsos positivos conocidos** (consultas que contienen "tecno" sin ser de marca).

Baseline en fichero: `docs/growth/_team/gsc-query-page-2026-11-05.json` (652.639 B, **no se
sobrescribe ni se edita**).

---

## 2. Por qué no hay automatización

- **No existe planificador autorizado.** `grep "schedule:|cron"` en `.github` = 0 coincidencias;
  ningún `systemd .timer` en el repositorio; el único cron documentado en el servidor es el backup de
  base de datos.
- `scripts/growth-monitor.mjs` / `npm run test:monitor` existen, pero **no consultan GSC**: hacen
  comprobaciones HTTP/HTML/TLS/TTFB/consentimiento sin credenciales.
- Automatizar exigiría colocar la credencial de GSC en el servidor o como secreto de Actions. Eso es
  un cambio de superficie de credenciales y queda **BLOQUEADO** hasta autorización explícita del
  propietario.

Por tanto la observación es **manual y documentada**, no automática.

---

## 3. Procedimiento exacto

1. **T0 está fijado**: `T0_release = 2026-11-05T18:19:22Z` (`release.json` de
   `20261105_191921`) y `T0_public = 2026-11-05T18:19:26Z` (primer 200 público del build nuevo,
   recomendado por `release-engineer` como inicio de ventana). Cuatro segundos de diferencia; las
   fechas de lectura no cambian. `run id` del despliegue: `42082908353` (exit 0).
2. Search Console finaliza datos con ~3 días de retardo. Cada checkpoint se lee **no antes** de:

| Checkpoint | Ventana | Leer a partir de | Fecha concreta |
|---|---|---|---|
| Día 7 | 7 días completos tras T0 | T0 + 10 días | **2026-11-15** |
| Día 14 | 14 días completos tras T0 | T0 + 17 días | **2026-11-22** |
| Día 30 | 30 días completos tras T0 | T0 + 33 días | **2026-12-08** |

3. En cada lectura: exportar con `node scripts/gsc-query-page.mjs --out <ruta>` y guardar el fichero
   con la fecha en el nombre. **Nunca** sobrescribir el baseline.
4. Comparar **ventanas de igual longitud** y con el mismo filtro de host. Excluir
   `clientes.tecnoriasl.com` y `cms.tecnoriasl.com` (ruido heredado de WordPress).

## 4. Campos obligatorios a registrar en la fecha de intervención

SHA del commit desplegado · T0 UTC del servidor · `run id` de Actions · código de salida del
despliegue y del smoke · `ActiveEnterTimestamp` del servicio · SHA-256 de los exports GSC previos ·
rango exacto de cada ventana · `queriedAt` · declaración de cambio exclusivo (qué se cambió y qué
no) · operador y aprobador · JSON del monitor.

## 5. Métricas a seguir y cómo se derivan

| Métrica | Derivación |
|---|---|
| Clics orgánicos, impresiones, CTR, posición media | consulta **sin dimensiones**, por ventana |
| Combinaciones consulta+página | **conteo** de filas, nunca suma de impresiones |
| Branded vs non-branded | regla congelada de §1 |
| Landings comerciales (`/servicios/*`) | dimensión `page` filtrada al host objetivo |
| Visibilidad de artículos (`/blog/*`) | dimensión `page` filtrada a `/blog/` |
| Artículo de coste | dimensión `page` + sus filas `query+page` |

## 6. Advertencia estadística (evita conclusiones falsas)

A 0,167 clics/día de media histórica, **una ventana de 7 días detecta como mínimo 1 clic**. Los
checkpoints de 7 y 14 días sirven para **detectar anomalías** (caída a cero, error de indexación),
**no para demostrar efecto**. Cualquier afirmación de mejora exige la ventana de 30 días y, aun así,
no es causalidad: hay que declarar el cambio y descartar cambios simultáneos.

## 7. Limitación conocida de las herramientas (backlog)

Ninguna herramienta acepta ventanas **ancladas a T0**: `gsc-query-page.mjs` no expone `--start` /
`--end`. Hoy hay que usar ventanas relativas ("últimos 28 días") y comprobar el `endDate` devuelto.
Añadir ventanas ancladas es el primer elemento del backlog de GROWTH-04.

## 8. Lo que NO se afirma

- No hay ninguna mejora de visibilidad medida: la observación **empieza** con el despliegue.
- Las filas `http://tecnoriasl.com/` no se interpretan como defecto (§ `GROWTH-03C-CANONICAL.md`).
- No se ha reactivado la hipótesis de canibalización: sigue **no observada** con 906 filas.
