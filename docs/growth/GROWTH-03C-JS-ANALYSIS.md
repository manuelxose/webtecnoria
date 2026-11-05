# GROWTH-03C — Análisis del JavaScript inicial

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Alcance:** por qué la página móvil descargaba >1,3 MiB de JavaScript y cuál era el módulo
responsable. Medición en el arnés existente, sobre el binario de producción.
**Fecha:** 2026-11-05 · **Commit de partida:** `68c19cc`

> Este documento responde a "¿de dónde salen los bytes?". La comparación antes/después, con su
> metodología y dispersión, está en [`GROWTH-03C-PERFORMANCE.md`](GROWTH-03C-PERFORMANCE.md).

---

## 1. Inventario del bundle inicial (estado ANTES)

Build de producción (`npm run build:ssr:web`), que es exactamente el que se despliega.
`dist/server/index.server.html` declara los recursos de arranque: **2 `<script>` y 10
`modulepreload`**, es decir 12 archivos que el navegador debe descargar antes de hidratar.

| Archivo | Bytes | % del JS inicial | Papel |
|---|---:|---:|---|
| `polyfills-OLE7FRBA.js` | **500.258** | **69,0 %** | polyfills del proyecto |
| `main-26DEM3TW.js` | 126.803 | 17,5 % | arranque de la aplicación |
| `chunk-4RZWRMQW.js` | 93.500 | 12,9 % | chunk compartido precargado |
| `chunk-E7BF2U4K.js` | 4.051 | 0,6 % | precargado |
| `chunk-W7YMKWIS.js` | 636 | 0,1 % | precargado |
| 7 chunks restantes | 794 | 0,1 % | precargados |
| **Total inicial (sin comprimir)** | **725.992 B (709 KiB)** | 100 % | |

El total de JS del build es 84 archivos / 1.870.168 B, pero **solo 12 se descargan en el arranque**;
el resto son chunks perezosos por ruta. El métrico del arnés (1.360,2 KiB de transferencia en la
home) incluye además lo que la propia página solicita después del arranque.

### El hallazgo

`polyfills.ts` contenía una única importación de Angular más `zone.js`. El bundle de polyfills
pesaba **500.258 B** — el 69 % del JS inicial — y no era `zone.js`.

Contenido identificado dentro de ese archivo: `parseTemplate` (9), `compileComponent` (5),
`NgModule` (25) y, al inicio, el parser de selectores CSS que usa el compilador de plantillas de
Angular (`/(\:not\()|(([\.\#]?)[-\w]+).../`). Es decir: **el compilador JIT de Angular viajaba al
navegador de cada visitante**.

Causa raíz, en `apps/web/angular.json`:

```json
"options": { ..., "aot": false, ... },          // línea 22, opciones base
"configurations": { "production": { "optimization": true, ... } }   // nunca sobrescribe aot
```

La configuración `production` — la única que usa `build:ssr` — heredaba `aot: false`. Con AOT
desactivado, Angular compila las plantillas **en el navegador** y para eso embarca el compilador.

---

## 2. Hipótesis descartada (registro honesto)

La primera hipótesis fue `@angular/localize/init` en `polyfills.ts`: arrastraba el compilador y el
proyecto **no tiene configuración i18n** en `angular.json` ni usa `$localize` en ninguna plantilla
(la única aparición de la cadena era el propio comentario).

Se aplicó la eliminación y se reconstruyó: el bundle pasó de **500.258 B a 499.751 B**, es decir
**−507 B**. La hipótesis era **falsa**: el compilador no entraba por `localize`.

La medición refutó la hipótesis antes de convertirla en una afirmación, y el cambio se conservó sólo
porque es correcto por sí mismo (no queda ninguna etiqueta i18n que compilar). El cambio que produjo
la mejora real es el de AOT.

---

## 3. Corrección aplicada

`apps/web/angular.json`, configuración `production`: `"aot": true`.

Efecto en el bundle inicial:

| Archivo | Antes | Después | Δ |
|---|---:|---:|---:|
| polyfills | 500.258 | **34.609** | **−465.649 B (−93,1 %)** |
| main | 126.803 | 128.733 | +1.930 B (+1,5 %) |
| chunk-4RZWRMQW | 93.500 | 93.500 | 0 |
| resto de precargados | 5.431 | 5.496 | +65 B |
| **Total inicial** | **725.992** | **262.338** | **−463.654 B (−63,9 %)** |

El compilador desaparece del cliente; las plantillas se compilan en build. El `main` crece 1,9 KB
por el código de arranque AOT. El balance es −463.654 B antes de comprimir.

El build AOT pasó sin errores de plantilla y sin cambios de presupuesto.

---

## 4. Qué queda (backlog, no ejecutado aquí)

1. **`chunk-4RZWRMQW.js` (93.500 B, 35,6 % del JS inicial ya optimizado)**: es el mayor
   contribuyente restante. No se ha identificado su contenido con evidencia suficiente en este
   hito; dividirlo sin saber qué contiene sería una optimización especulativa. Candidato número uno
   de GROWTH-04.
2. **35 peticiones en la home** frente a 36 en la página de servicio: el número de peticiones no
   baja con AOT porque el compilador no era una petición aparte. Reducir peticiones exige analizar
   los terceros (widget de chat, analítica tras consentimiento) por separado.
3. **`zone.js`**: se conserva. El proyecto no es zoneless y migrarlo es un cambio de arquitectura
   con riesgo de hidratación; no se toca dentro de un hito de rendimiento.

---

## 5. Reproducibilidad

- El arnés **nunca compila**: sirve `apps/web/dist/server/server.mjs` tal cual y registra la huella
  del build medido. Antes de cualquier comparación hay que reconstruir y comprobar la huella.
- Snapshot "antes" conservado fuera del repo: `%TEMP%\tecnoria-dist-before` (polyfills
  `OLE7FRBA`, huella de build `c2332f753023`).
- JSON de medición: `docs/growth/_team/perf-03c-before.json` y `perf-03c-after.json`.
- Comando: `node scripts/perf-baseline.mjs --samples 5 --out <archivo>`.
