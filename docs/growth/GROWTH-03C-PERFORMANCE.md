# GROWTH-03C — Rendimiento móvil: antes y después

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Medición:** sintética, navegador real, perfil móvil controlado. **No** son datos de campo.
**Fecha:** 2026-11-05

> `bloqueo aproximado` es el *long-task blocking approximation* del arnés (suma de
> `longTask.duration - 50 ms`). **No es Lighthouse TBT y no se etiqueta como TBT.** Tampoco se
> deriva de aquí ninguna mejora de Core Web Vitals de campo.

---

## 1. Perfil de medición (idéntico en ambos estados)

| Parámetro | Valor |
|---|---|
| Dispositivo | 390 × 844, emulación móvil, 5 puntos táctiles |
| DPR | 3 (verificado por muestra) |
| CPU | ralentización 4× |
| Red | Slow 4G (150 ms latencia, 200.000 B/s bajada, 93.750 B/s subida) |
| Caché | deshabilitada y limpiada por muestra |
| Consentimiento | `none` (sin consentimiento otorgado) en ambos estados |
| Muestras | 5 por escenario y ejecución, 2 ejecuciones independientes |
| Navegador | Chrome 156.0.8078.80 (mismo binario, misma revisión) |
| Host | mismo equipo, misma sesión de trabajo |
| Build | snapshot inmutable con huella; el arnés **nunca compila** |

Ambos estados se midieron con `node scripts/perf-baseline.mjs --samples 5 --out <archivo>`.

---

## 2. Resultado

| Métrica | Antes (`c2332f753023`) | Después | Δ |
|---|---:|---:|---:|
| **JS inicial, sin comprimir** | **725.992 B** | **262.338 B** | **−463.654 B (−63,9 %)** |
| **Home: transferencia JS** | **1.360,2 KiB** | **658,8 KiB** | **−701,4 KiB (−51,6 %)** |
| Home: bloqueo aproximado (mediana) | 3.095,0 ms | 906,5 ms | −2.188,5 ms (−70,7 %) |
| Home: LCP (mediana) | 878,0 ms | 878,0 ms | 0 (sin cambio) |
| Home: CLS | 0 | 0 | 0 |
| Home: peticiones | 34 | 35 | +1 |
| **Servicio: transferencia JS** | **1.337,5 KiB** | **635,0 KiB** | **−702,5 KiB (−52,5 %)** |
| Servicio: bloqueo aproximado (mediana) | 1.189,5 ms | 436,0 ms | −753,5 ms (−63,3 %) |
| Servicio: LCP (mediana) | 770,0 ms | 804,0 ms | +34,0 ms (+4,4 %) |
| Servicio: CLS | 0,022 | 0,022 | 0 |
| Servicio: peticiones | 36 | 36 | 0 |

Ruta de servicio: `/servicios/desarrollo-software-medida`.

### Qué se reclama y qué no

- **Se reclama**: reducción de JavaScript inicial, medida en bytes, sobre el artefacto construido
  y con huella registrada. Es determinista y se puede auditar con `sha256sum`.
- **Se reclama con reserva**: reducción del bloqueo aproximado. La mediana baja entre 63 % y 71 %,
  muy por encima del ruido medido, pero el métrico es ruidoso (§3).
- **NO se reclama**: mejora de LCP. La home queda idéntica y la página de servicio empeora 34 ms,
  que es ruido de sesión, no una regresión atribuible al cambio. Tampoco se reclama ninguna mejora
  de Core Web Vitals de campo: no hay datos de campo (GA4 Admin sigue bloqueado, H-8).

---

## 3. Dispersión (honestidad estadística)

| Escenario | Variación entre las dos ejecuciones (bloqueo aproximado) |
|---|---:|
| Home, antes | −1.128,0 ms (−32,4 %) |
| Home, después | +457,0 ms (+60,9 %) |
| Servicio, antes | +319,0 ms (+30,8 %) |
| Servicio, después | −404,0 ms (−49,0 %) |

- **`jsTransferBytes` tiene varianza 0,0 %** entre ejecuciones en ambos estados: es la métrica
  sólida y la que se usa como afirmación principal.
- El bloqueo aproximado varía hasta un 61 % entre ejecuciones en el mismo estado; aun así la
  reducción observada (63-71 %) excede esa banda. Se reporta como mediana con dispersión, nunca
  como valor único.
- LCP se mueve ±5 % entre ejecuciones del mismo estado; por eso el +4,4 % del servicio **no** se
  interpreta como regresión.

Fuera de lo anterior: la TTFB de la home pasó de 133,2 ms a 98,8 ms y la del servicio de 64,1 ms a
82,6 ms. Es tiempo de servidor, se mueve en ambas direcciones y **no se atribuye** al cambio de JS.

---

## 4. Metodología: cómo se evita el autoengaño

1. **Snapshot inmutable.** El arnés registra la huella del build servido y comprueba que no cambió
   durante la ejecución (`source build changed during run: no` en ambas).
2. **Mismo perfil, mismo binario de Chrome, mismo estado de consentimiento.** Cualquier comparación
   con el resto de la sesión es entre iguales.
3. **5 muestras × 2 ejecuciones por escenario**, con mediana y dispersión reportadas.
4. **Medición antes de tocar código.** El estado "antes" se midió sobre el `dist` construido a las
   17:38 desde `HEAD 68c19cc` limpio, antes de cualquier edición; el snapshot se conservó en
   `%TEMP%\tecnoria-dist-before`.
5. **Ningún cambio en el arnés** para producir este resultado: `test:perf` sigue 6/6 y el arnés
   conserva su configuración. No se relajó ninguna aserción.

### Limitación declarada

Durante ambas mediciones el árbol de trabajo estaba sucio (las ediciones de código aún no
confirmadas), aunque el artefacto medido es el `dist` con huella registrada, no el árbol. El
revisor independiente puede reproducir la comparación partiendo de `415e2ca` (AOT) frente a
`68c19cc`: son los dos artefactos que se midieron.

---

## 5. Reproducción

```bash
# estado actual (o el commit que se quiera medir)
npm run build:ssr:web
node scripts/perf-baseline.mjs --samples 5 --out docs/growth/_team/perf-03c-<estado>.json
```

Datos crudos: `docs/growth/_team/perf-03c-before.json` (JIT, `68c19cc`) y
`docs/growth/_team/perf-03c-after.json` (AOT, `415e2ca` + `6500f35`).

### Derivación de "JS inicial, sin comprimir" (auditable, no sale del arnés)

El arnés registra `jsTransferBytes` por escenario, no este agregado. Se deriva así:

```bash
# 1. lista de recursos de arranque declarados por el propio build
grep -oE '(src|href)="[^"]+\.js"' apps/web/dist/server/index.server.html
# 2. suma de sus tamaños en disco
```

- Antes: 12 archivos (2 `<script>` + 10 `modulepreload`) = **725.992 B**.
- Después: mismos 12 roles = **262.338 B**.
- Por eso el agregado es reproducible con cualquier build, aunque no esté serializado en el JSON.

### Hallazgos de la revisión independiente que afectan a este documento

| Id | Severidad | Estado |
|---|---|---|
| F3 | low | La derivación anterior cierra el hallazgo: el agregado se calcula del build, no del JSON |
| F4 | low | Los dos artefactos registran `git.commit = 68c19cc` porque la medición "después" se hizo con el árbol sucio, antes de confirmar. El revisor reconstruyó el build final y era **byte-idéntico** al medido; se acepta el artefacto con esa nota en lugar de re-medir |
| F5 | low | La ejecución "después" capturó una petición del widget de chat de `talkaris.com` que no aparece en "antes". Afecta al total de transferencia, no a `jsTransferBytes`; la reducción del 51,6 % se mantiene con margen |

