# GROWTH-03B — Rendimiento móvil: metodología y línea base

**Herramienta:** `scripts/perf-baseline.mjs` (nueva)
**Datos:** `docs/growth/_team/perf-baseline-2026-11-05-{before-links,after-links}.json`
**Registro QA:** etapa `perf-baseline` en `qa/qa-manifest.json` (**no requerida** para entrega)

---

## 1. Qué es y qué no es esta medición

Es un **banco de laboratorio reproducible con Chrome real controlado por CDP**, sobre una copia
inmutable del build SSR servido en local. **No es Lighthouse** y no se presenta como tal.

| Métrica | ¿Medida? | Fuente declarada |
|---|---|---|
| TTFB, DOMContentLoaded, load | Sí | `PerformanceNavigationTiming` (instrumentación de navegador) |
| LCP (+ elemento y URL) | Sí | `PerformanceObserver('largest-contentful-paint')` |
| CLS | Sí | `PerformanceObserver('layout-shift')`, sin `hadRecentInput` |
| Tareas largas (nº, total, aproximación de bloqueo) | Sí | `PerformanceObserver('longtask')` |
| Tamaño de transferencia JS y por tipo | Sí | `PerformanceResourceTiming` |
| Nº de peticiones, terceros | Sí | CDP `Network.*` |
| Actividad del hilo principal | Sí, **con salvedad** | CDP `Performance.getMetrics` (infravalorado en Chrome 156, ver §6) |
| **TBT de Lighthouse** | **No** | — |
| **INP** | **No** | Solo existe una *aproximación de bloqueo por tareas largas*, etiquetada como tal |
| **Puntuación de rendimiento Lighthouse** | **No** | Lighthouse no está instalado y no se instaló |
| **Datos de campo (CrUX/RUM)** | **No** | `sin datos` |

> El informe del hito previo citaba puntuación 69–76 y TBT 460–660 ms. **Esos números no se
> reproducen aquí porque aquí no hay Lighthouse.** No se comparan con esta línea base.

---

## 2. Perfil de dispositivo — fijado antes de abrir la página

| Parámetro | Valor |
|---|---|
| Viewport CSS | 390 × 844 |
| `deviceScaleFactor` | **3** |
| Móvil / táctil | `isMobile: true`, `maxTouchPoints: 5` |
| User agent | Un único UA móvil constante (Android 13 / Pixel 7, Chrome 125) |
| CPU | `setCPUThrottlingRate(4)` |
| Red | Slow 4G: 150 ms latencia, 200.000 B/s bajada, 93.750 B/s subida |
| Caché | Contexto de navegador **aislado por muestra** |
| Consentimiento | Estado **sin otorgar** por defecto (GA4 nunca se carga) |

Todo el perfil se aplica **antes de la primera navegación** y **no se modifica después**.
El DPR **no se asume**: se lee `window.devicePixelRatio` tras cada navegación y una muestra con
DPR ≠ 3 se marca inválida y se excluye.

**Evidencia:** 20/20 muestras con DPR efectivo **3**, 0 inválidas, 0 fallidas.

---

## 3. Repetición y control de ruido

- 2 ejecuciones independientes × 5 muestras por escenario (home y página de servicio).
- Mediana, mínimo, máximo, desviación típica y regla de valores atípicos documentada
  (`|valor − mediana| > 2×MAD`).
- Cada ejecución sirve una **copia inmutable del build** con huellas SHA-256 antes y después
  (`sourceChangedDuringRun: false`), para que una recompilación concurrente no altere los bytes
  medidos. Esto se añadió tras detectar y **descartar** una primera ejecución contaminada.

---

## 4. Línea base (mediana de 10 muestras por escenario)

| Métrica | Home | Servicio software a medida |
|---|---|---|
| LCP | **874 ms** (sd 87,9) | **700 ms** (sd 34,9) |
| CLS | **0,0000** | **0,0220** (idéntico en 10/10) |
| Tareas largas | 15,5 (total 4.495 ms) | 3 (total 1.465 ms) |
| Aproximación de bloqueo | **3.945 ms** | **1.290 ms** |
| TTFB | 145,6 ms | 87,2 ms |
| Cuerpo SSR completo | 1.203,1 ms (≈1.053 ms de render) | 1.003,6 ms (≈916 ms) |
| JS transferido | 1.360,2 KiB (26 scripts) | 1.337,4 KiB (26 scripts) |
| Peticiones | 34 | 36 |

Reproducibilidad entre ejecuciones: LCP home −4,0 %, servicio −3,9 %; bytes JS y nº de peticiones
**idénticos al 0,0 %**.

---

## 5. Diagnóstico de cuello de botella (con números)

1. **Entrega y ejecución de JavaScript — dominante en ambas páginas.** 1.392.801 B en home y
   1.369.543 B en servicio equivalen a **6,96 s y 6,85 s** de transferencia al techo de 200.000 B/s.
   `DOMContentLoaded` en 9.570 ms (home) mientras el LCP ya ocurrió a 874 ms. Mayores activos:
   `polyfills` 489 KiB, `chunk-RNQ3O5YP` 384 KiB, `main` 124 KiB.
2. **Tareas largas del hilo principal.** Home: 15,5 tareas, máximo 2.003 ms; 123 de 154 comienzan
   **después de los 9 s** (trabajo posterior a `load`).
3. **Renderizado en servidor** aporta ~1 s de cuerpo SSR, pero el TTFB es bajo (145 ms).
4. **CSS**: 3 hojas, 118 KiB.
5. **Prioridad de imagen / hero: NO es el cuello de botella.** El LCP es **texto** en ambas páginas
   (`p.lead--hero`, `h1`), `lcp.url = null`. El hero no tiene `<img>`.
6. **Fuentes: no.** 0 peticiones de fuente, `document.fonts.status = "loaded"`.
7. **Terceros:** GA4 **ausente sin consentimiento** (diseño correcto, verificado). El widget
   Talkaris monta en `requestIdleCallback` (después de `load`) y queda fuera de la ventana de home.
8. **Canvas y orbes decorativos:** presentes solo en home; correlacionan con su mayor volumen de
   tareas largas (3,1×) pero **no** determinan el LCP.

> **Hipótesis validada:** el coste está en **volumen y ejecución de JavaScript**, no en imagen
> hero, fuentes ni canvas. Cualquier parche de rendimiento futuro debe atacar el bundle.
> **No se aplicó ningún cambio de rendimiento en producción**: no hay hipótesis implementada sin
> medición posterior que la valide.

---

## 6. Salvedades honestas

- **CDP `Performance.getMetrics` infravalora el trabajo del hilo principal** en Chrome 156
  (`TaskDuration` ~12 ms frente a ~4.495 ms de tareas largas observadas). Se almacenan ambos
  valores con su fuente y se marca la discrepancia por muestra. Para coste de hilo principal se
  usan las **tareas largas**, no los contadores CDP.
- Sin `Timing-Allow-Origin`, los tamaños cross-origin (iframe Talkaris) son 0; sí se cuentan
  las peticiones de terceros.
- No hay hardware móvil real: Chrome headless en i7-12700H con emulación y CPU 4×.
- El comportamiento del widget de chat después de la ventana de 4 s no se mide.

---

## 7. ¿Los cambios de enlaces de 03B degradaron el rendimiento?

**No hay evidencia de degradación atribuible a los cambios.** Pero la comparación admite
**menos** afirmaciones de las que un primer vistazo sugiere, y así se declara:

### 7.1 Lo que sí es sólido (invariantes byte a byte)

Las dos páginas medidas son **byte-idénticas** entre las dos sesiones:

| Invariante | Sesión A (13:58Z) | Sesión B (14:06Z) |
|---|---|---|
| `decodedBodySize` de `/` | 125.455 | **125.455** |
| `decodedBodySize` del servicio | 76.364 | **76.364** |
| JS transferido home | 1.392.801 B | **1.392.801 B** |
| Bytes JS servicio | 1.369.543 B | **1.369.543 B** |
| Nº de peticiones | 34 / 36 | **34 / 36** |

### 7.2 Por qué NO es una comparación "antes vs después" limpia

Una auditoría independiente (hallazgo **G03B-F3**) detectó — correctamente — que la captura
etiquetada inicialmente como «BEFORE» (13:58Z) se tomó con **los archivos de enlaces ya
modificados en el árbol**, aunque el build servido en esa sesión varió. Es decir:

- **No existe una medición de rendimiento del código anterior a los cambios de enlaces**
  ejecutada por este banco. Las cifras de §4 son la línea base del **estado del árbol durante el
  hito**, no de `HEAD` sin cambios.
- Las dos sesiones sirvieron **builds distintos** (huella `7074c99…` y `5888527…`), aunque con
  **bytes de página y de JavaScript idénticos** en los dos escenarios medidos.
- La única página cuyo HTML cambió de verdad (el artículo de coste: 60.928 bytes, enlace lateral
  añadido) **no forma parte de ningún escenario medido**.

### 7.3 La deriva entre sesiones (hallazgo G03B-F1, medio)

| Métrica | Sesión A | Sesión B | Deriva |
|---|---|---|---|
| LCP home (mediana) | 874 ms | 1.014 ms | **+16,0 %** |
| LCP servicio | 700 ms | 806 ms | **+15,1 %** |
| TTFB home | 145,6 ms | 187,5 ms | **+28,8 %** |
| Nº de tareas largas home | 15,5 | 9,0 | −41,9 % |
| Bloqueo aproximado home | 3.945 ms | 4.970 ms | +26,0 % |

La variación **dentro** de una sesión es solo −3,9 %/−4,0 %, así que **subestima** la variabilidad
real. La deriva de ~15–20 % entre sesiones con **bytes idénticos** es consistente con contención
del host, no con un cambio de página.

> **Regla obligatoria para el futuro:** cualquier comparación «¿esto ha degradado el LCP?» debe
> usar una **tolerancia de ≥20 %** o una máquina dedicada/CI controlada. **Nunca** citar el −4 %
> como variabilidad total esperada.

### 7.4 Conclusión

El banco funciona, es reproducible en su método y clasifica honestamente sus métricas.
**No se ha demostrado ninguna mejora de rendimiento** en este hito y no se reclama ninguna.
Tampoco se ha demostrado degradación: las páginas medidas no cambiaron de bytes.

---

## 8. Datos de campo: `sin datos`

No hay CrUX ni RUM. El acceso administrativo a GA4 (bloqueo H-8) sigue pendiente, así que **no
existen datos de usuarios reales** de este sitio. Todo lo medido aquí es laboratorio y así se
etiqueta. No se presentará ninguna métrica de laboratorio como Core Web Vitals de campo.
