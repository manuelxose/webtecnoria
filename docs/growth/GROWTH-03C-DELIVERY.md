# GROWTH-03C — Entrega

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Hito:** TECNORIA-GROWTH-03C — despliegue controlado, optimización de JavaScript y crecimiento
orgánico basado en evidencia
**Fecha:** 2026-11-05

---

## 1. Veredictos separados

La instrucción exige **no colapsar** las dimensiones en un único PASS. Estado real de cada una:

| # | Dimensión | Veredicto | Fundamento verificable |
|---|---|---|---|
| 1 | **Análisis completado** | ✅ **SÍ** | H-10 diagnosticado con reproducción (200/200); canonicalización 4/4; baseline GSC re-verificado con delta 0/0; bottleneck de JS identificado con bytes reales |
| 2 | **Implementación completada** | ✅ **SÍ** | 4 commits: AOT, enlace en artículos CMS, aserción del smoke, verificador de release. 134 pruebas + 33 rutas en verde |
| 3 | **Despliegue en producción completado** | ✅ **SÍ** | Run `42082908353` = `success`; release `20261105_191921` activa; servidor en `7289627`; smoke pasado por primera vez desde 01:22 |
| 4 | **Mejora de rendimiento demostrada** | ✅ **SÍ (métrica definida)** | JS inicial **725.992 B → 262.338 B (−63,9 %)**; transferencia home **1.360,2 → 658,8 KiB (−51,6 %)**. **LCP no mejora y no se reclama** |
| 5 | **Mejora de visibilidad en búsqueda demostrada** | ❌ **NO — imposible aún** | La observación empieza en T0 = 2026-11-05T19:19:22+01:00. GSC no tiene ninguna ventana posterior (endDate 2026-11-02). **No se reclama nada** |
| 6 | **Fiabilidad de leads restaurada** | ❌ **NO — BLOQUEADO externo** | `EAUTH 534-5.7.9` es rechazo de credencial. Ningún cambio de repositorio lo arregla. Capacidad de diagnóstico documentada |
| 7 | **Revisión independiente superada** | ✅ **SÍ** | `independent-reviewer` (DeepSeek V4 Pro), veredicto PASS sin hallazgos críticos ni altos; ronda 2 ligada a los bytes entregados |
| 8 | **Enrutado de modelos verificado** | ✅ **SÍ (con matices declarados)** | Ver §6: rutas solicitadas y ejecutadas; un miembro agotó contexto y el capitán asumió su implementación |

> **Estado global: PARTIAL.** Cuatro dimensiones PASS, dos BLOCKED por dependencias externas
> (SMTP, ventana de medición) y una que por definición no puede demostrarse todavía.

---

## 2. Git y producción

| Elemento | Valor real |
|---|---|
| Base del hito | `68c19cc` (`origin/master` estaba en `894e7c6`) |
| `415e2ca` | `perf(web)`: AOT en producción → compilador JIT fuera del cliente |
| `6500f35` | `fix(web)`: el artículo servido por CMS conserva el enlace editorial al servicio |
| `6cfcb4f` | `fix(deploy)`: aserción del smoke determinista (H-10) |
| `7289627` | `docs(growth)`: 7 documentos + cierre del hallazgo F1 |
| `be5c234` | `test(release)`: verificador de producción de sólo lectura (**local, pendiente de push**) |
| Run de despliegue | **`42082908353`**, conclusión **`success`**, 1m16s, 2026-11-05T18:18:09Z→18:19:29Z |
| **Release activa** | **`20261105_191921`**, `releasedAt 2026-11-05T19:19:22+01:00`, fingerprint `6fc0aab3…7f2d` |
| HEAD del servidor | `632a3ec` (tras el segundo run; la release no cambió) |
| Anterior / rollback | `20261105_052852` (anterior) · **`20261105_012220`** (objetivo de rollback, presente) |

### Evidencia del propio run de despliegue

```
Applying migration: 001_init.sql … 009_contact_reliability.sql
Migrations completed
polyfills-RNHY7D3N.js | polyfills | 34.61 kB | 11.36 kB     ← antes: 500,258 B
==> tecnoria-web: validating staging dist
==> tecnoria-web: publishing release
==> tecnoria-web: reloading systemd and restarting tecnoria-web.service
==> tecnoria-web: release published
Deploy webtecnoria OK: 7289627
```

El smoke `Expected text not found` **no aparece**: la aserción, que fallaba 200/200 con el cuerpo de
125 KB, ya pasa en el pipeline real. Ésta es la prueba de que H-10 era el gate y no la aplicación.

### Segundo run: idempotencia y fiabilidad del gate

Publicado el commit de documentación `632a3ec`, el workflow se ejecutó de nuevo:
**run `42084242925` = `success`**. El log es exactamente el comportamiento correcto de una release
sin cambios de código:

```
==> tecnoria-web: staging build is identical to current release, skipping new release publish
==> tecnoria-web: current service already points to the expected release, skipping restart
==> tecnoria-web: release published
Deploy webtecnoria OK: 632a3ec
```

No publicó release nueva, no reinició el servicio y el smoke pasó. **Dos runs consecutivos en verde**
donde antes había cuatro fallos consecutivos: el gate es ahora fiable, no "de momento pasa".
El servidor queda en `632a3ec` sirviendo la misma release `20261105_191921`; la comprobación final
contra producción sigue en **19/19**.

---

## 3. Pruebas — comandos reales y resultado real

Ejecutadas sobre los bytes finales, antes de publicar:

| Comando | Resultado |
|---|---|
| `npm run build:ssr:web` | ✅ `Application bundle generation complete.` |
| `npm run test:seo` | ✅ `SEO checks passed: 33 public routes, JSON-LD, 404/301, cache, sitemap and anchor integrity.` |
| `npm run test:consent` | ✅ **22/22** |
| `npm run test:analytics` | ✅ **15/15** |
| `npm run test:browser` | ✅ **24/24**, sin errores de hidratación, `generate_lead` correcto, cero `gtag` antes de consentir |
| `npm run test:links` | ✅ **7/7** (nuevo test con control de mutación) |
| `npm run test:perf` | ✅ **6/6** |
| `npm run test:api` | ✅ **61/61** |
| `node scripts/release-verify.mjs` (producción) | ✅ **19/19** |

Total: **134 pruebas** + 33 rutas + 19 comprobaciones de producción. Ninguna suite reportada como
pasada sin ejecutarse.

---

### Verificación independiente posterior al despliegue — PASS 8/8

`release-engineer` verificó la release en vivo con sus propios comandos (sólo lectura), **sin
discrepancias** con lo reportado aquí:
`docs/growth/_team/GROWTH-03C-POSTDEPLOY-VERIFY.md`.

- Fingerprint `6fc0aab3…7f2d` **recalculado con el algoritmo del propio script** y coincidente; los 5
  releases retenidos recalculados y coincidentes; `20261105_012220` y `20261105_052852` íntegros.
- Ambas copias del script compartido en `0ea046c4…`; el backup `d0499d3e…` es exactamente el script
  anterior a la corrección; el gate pasó en vivo (sin `Expected text not found`).
- `tecnoria-web` reiniciado a las 19:19:23 CET (1 s después de `release.json`), `NRestarts=0`; API y
  nginx activos.
- `release-verify.mjs` 19/19 **reproducido**, más su propio barrido de **33/33** rutas y 6/6
  comprobaciones con `--resolve` al origen.
- Prueba del cambio de polyfills **a nivel de disco, entre releases**: las cuatro releases antiguas
  llevan `polyfills-OLE7FRBA.js` de 500.258 B con 3 líneas de marcadores JIT; la nueva lleva 34.609 B
  con **0 de 7 marcadores**.
- **Sin daño colateral**: los otros cinco sitios del servidor y sus servicios siguen activos, sin
  reinicios atribuibles a este despliegue, y responden 200.

Desviaciones que el verificador señaló frente a mi encargo (se registran, no se ocultan):

1. Mi encargo citaba el puerto `3021`, que no existe en el host (la SSR escucha en `:4300`, la API en
   `:3001`). Error de redacción mío; se usó la forma correcta contra el origen.
2. El despliegue es un rango de **6 commits** (`894e7c6..7289627`), no uno: además de los revisados
   incluye `.gitignore`, `package.json` y `qa/qa-manifest.json` procedentes del ya auditado `94de3ab`.
   Inertes, pero quedan declarados para no ampliar el alcance en silencio.
3. `Leer artículo` **sigue apareciendo ~40 veces fuera de la home** (CTA destacado de `/blog` y 3
   tarjetas de artículos relacionados por página de artículo). El criterio de este hito era la home,
   que está limpia (0), pero el texto genérico sigue existiendo en el sitio: ver H-14.

## 4. Rendimiento: línea base frente a final

Misma máquina, mismo Chrome 156.0.8078.80, 390×844 DPR 3, CPU 4×, Slow 4G, caché aislada por
muestra, consentimiento `none`, 5 muestras × 2 ejecuciones por escenario.

| Métrica | Antes (JIT) | Después (AOT) | Δ |
|---|---:|---:|---:|
| JS inicial sin comprimir | 725.992 B | **262.338 B** | **−63,9 %** |
| Home: JS transferido | 1.360,2 KiB | **658,8 KiB** | **−51,6 %** |
| Home: bloqueo aproximado (mediana) | 3.095,0 ms | **906,5 ms** | −70,7 % |
| Home: LCP (mediana) | 878,0 ms | 878,0 ms | 0 — **no reclamado** |
| Home: CLS | 0 | 0 | — |
| Servicio: JS transferido | 1.337,5 KiB | **635,0 KiB** | −52,5 % |
| Servicio: bloqueo aproximado | 1.189,5 ms | **436,0 ms** | −63,3 % |
| Servicio: LCP | 770,0 ms | 804,0 ms | +4,4 % (ruido, no regresión) |
| Polyfills (cliente) | 500.258 B | **34.609 B** | **−93,1 %** |

`bloqueo aproximado` **no es Lighthouse TBT** y no se presenta como tal. No se deriva de aquí ninguna
mejora de Core Web Vitals de campo: no existen datos de campo (H-8 bloqueado).

**Causa raíz**: `apps/web/angular.json` fijaba `aot: false` en las opciones base y la configuración
`production` no lo sobrescribía, así que cada visitante descargaba el compilador JIT de Angular
(500.258 B, el 69 % del JS inicial) y las plantillas se compilaban en el navegador.
Detalle y refutación de la primera hipótesis: `GROWTH-03C-JS-ANALYSIS.md`.

---

## 5. Búsqueda: qué ha cambiado realmente

- Baseline **congelado y re-verificado** hoy: 28 d 3 clics / 210 imp · 90 d **15 / 725** · 480 d
  79 / 35.299. El export nuevo es **idéntico al inmutable salvo `queriedAt`**; `endDate` sigue en
  **2026-11-02**, así que **no existe ninguna ventana posterior al despliegue**.
- **T0** registrado con dos anclas, ambas reales: `T0_release = 2026-11-05T18:19:22Z` (`release.json`)
  y `T0_public = 2026-11-05T18:19:26Z` (primer 200 público del build nuevo, recomendado por
  `release-engineer` como inicio de ventana). Cuatro segundos de diferencia; **las fechas de lectura
  no cambian**.
- **Fechas de lectura** (retardo de finalización de GSC de 3 días): **15-nov** (día 7), **22-nov**
  (día 14), **8-dic** (día 30). Registro completo de los 11 campos obligatorios en
  `docs/growth/_team/GROWTH-03C-POSTDEPLOY-GSC.md`.
- **Línea base congelada por página** (dimensión `page`, host filtrado, antes del despliegue):

| Página | 28 d | 90 d |
|---|---|---|
| `/blog/cuanto-cuesta-desarrollar-software-medida` | 0 clics / 119 imp / pos 23,08 | 0 / 297 / pos 23,97 |
| `/servicios/desarrollo-software-medida` | 0 clics / 2 imp / pos 42,00 | 0 / 77 / pos 71,61 |

  Las filas no son sumables: el artículo da 297 imp en dimensión `page` frente a 267 en sus 12 filas
  `query+page`; la landing 77 frente a 54 en 5 filas.
- Lo único que ha cambiado en el sitio son los enlaces internos y el bundle. **No se ha tocado ningún
  `title`, `description`, H1 ni cuerpo de contenido.**
- El artículo de coste **sigue sirviendo el cuerpo de 7 caracteres** de `blog_posts` (`sadasda`): el
  release no toca la base de datos. El enlace contextual **ahora sí se renderiza** (verificado en
  producción), pero **la ventana de medición se abre sobre una página cuyo defecto de contenido sigue
  abierto**, así que cualquier delta medirá enlaces y factores externos, no una mejora de contenido.
  Decisión del propietario: `GROWTH-04-HANDOFF.md` §2.
- **No se reclama ninguna mejora de visibilidad.** A 0,167 clics/día, el mínimo detectable en 7 días
  es 1 clic: los checkpoints 7/14 detectan anomalías, no efectos.

---

## 6. Enrutado real de modelos

Atribución por configuración de miembro aprovada por el capitán. **Los recuentos de tokens son
`DESCONOCIDO`**: `model_router observe` sobre el almacén de sesiones del host devuelve
`provenance: UNKNOWN` y `inputTokens: null` (323 sesiones, 0 muestras con uso reportado). No se
inventan cifras ni se derivan de un contador de conversación.

| Rol | Ruta asignada | Ruta usada | Trabajo |
|---|---|---|---|
| `release-engineer` | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | la asignada | t1 (H-10 + canonical + rollback), t5 (verificación post-despliegue) |
| `growth-engineer` | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | la asignada | t2 (GSC + leads), t6 (snapshot post-release) |
| `js-perf-engineer` | `openrouter-minimax` / `minimax/minimax-m3.1-flash` | la asignada | t3: **agotó contexto, cero producción**; el capitán asumió la implementación |
| `independent-reviewer` | `deepseek-official` / `deepseek-v4-pro` | la asignada | t4 y t7 (auditoría, dos rondas) |
| Capitán | `deepseek-official` / `deepseek-flash` | la asignada | coordinación, integración, implementación de t3, despliegue |

**GLM 5.3 Flash**: no se usó; ninguna tarea era de extracción acotada que lo justificara.
**Claude / Codex**: no se usaron; la revisión L4 la cubrió V4 Pro, de familia distinta a los
implementadores MiniMax.
**Coste monetario: `DESCONOCIDO`.** El adaptador instalado no lee metadatos de coste del proveedor.

### Desviaciones que se declaran, no se esconden

1. **`js-perf-engineer` falló** por agotamiento de contexto sin producir nada. El capitán ejecutó la
   implementación y la medición, y lo declara en la propia tarea (`t3`, intento 2). La independencia
   de la revisión se apoya en que el auditor reconstruyó el build (**byte-idéntico**) y re-midió.
2. **El pool compartido asignó la re-revisión (t7) a un miembro MiniMax** por error del planificador;
   se reasignó de inmediato al revisor independiente. Queda registrado.

---

## 7. Bloqueos que permanecen (sin rebajar gravedad)

| # | Bloqueo | Estado |
|---|---|---|
| H-1 | **SMTP `EAUTH 534-5.7.9`**; leads guardados sin aviso; recuperación de contraseña sin entrega | **BLOQUEADO** — credencial externa |
| H-2 | Aprobación legal del texto de privacidad/cookies | **BLOQUEADO** — responsable del tratamiento |
| H-3 | Widget Talkaris sigue contactando `talkaris.com` antes de cualquier decisión | **ABIERTO** |
| H-4 | Ledger de migraciones (se re-aplican todas en cada release) | **ABIERTO** |
| H-5 | La CI no ejecuta las suites; `test:browser` usa ruta de Chrome de Windows | **ABIERTO** |
| H-7 | Token de API de Cloudflare para purga selectiva | **BLOQUEADO** |
| H-8 | Acceso admin a GA4 → sin datos de campo ni conversiones | **BLOQUEADO** |
| H-9 | Sincronización de consentimiento entre pestañas | **ABIERTO** |
| H-10 | Smoke de despliegue compartido | ✅ **DIAGNOSTICADO Y CORREGIDO** (falso negativo por SIGPIPE; instalado y validado) |
| H-11 | Automatización GSC imposible sin colocar la credencial | **BLOQUEADO** — autorización del propietario |
| H-12 | Artículo de coste sirve cuerpo de 7 caracteres (`sadasda`) desde `blog_posts` | **DECISIÓN DEL PROPIETARIO** |
| H-13 | Script de backup de BD: mismo defecto SIGPIPE → dump de chat en `0644` y sin `chmod`; el cron usa una copia en `/usr/local/sbin` | **NUEVO — ABIERTO** (no bloquea esta release: los dumps se verificaron restaurables) |
| H-14 | `Leer artículo` / `Leer insight` genéricos siguen en ~40 puntos fuera de la home (CTA de `/blog` y tarjetas de relacionados) | **NUEVO — ABIERTO** (candidato directo de GROWTH-04) |
| H-15 | El workflow declara `script_stop: true`, que la acción SSH instalada **ignora** (anotación de GitHub Actions) | **NUEVO — ABIERTO** (protección que se cree tener y no se tiene) |

---

## 8. Hallazgos nuevos de este hito

1. **H-10 era un falso negativo de shell**, no una aplicación rota: `printf | grep -q` bajo `pipefail`
   mata `printf` con SIGPIPE y devuelve 141 aunque `grep` acierte. Tasas medidas: 100 % a 125 KB,
   42,5 % a 64 KB, 19 % a 57 KB. **No hay umbral de 64 KiB**; es una carrera.
2. **El compilador JIT de Angular se servía a producción** por un `aot: false` heredado. 500 KB.
3. **El enlace artículo→servicio de GROWTH-03B nunca llegó a la página** para slugs con fila en
   `blog_posts`, porque la rama CMS no transportaba `serviceLinks`.
4. **El artículo de coste sirve `sadasda`** en producción: 267-297 impresiones, 0 clics, posición
   17-31 con el cuerpo vacío.
5. **El script de backup tiene el mismo defecto de SIGPIPE** que H-10: el dump de chat queda en `0644`
   y el `chmod 0640` nunca se ejecuta. Reproducido en vivo al hacer el backup previo a la release.
6. **El workflow declara `script_stop: true`, que la acción SSH instalada ignora** (anotación de
   GitHub Actions en el run). No afecta a este despliegue (un único comando con `set -euo pipefail`),
   pero es una protección que se cree tener y no se tiene.

---

## 9. Siguiente hito

**GROWTH-04**: ver `GROWTH-04-HANDOFF.md`. Orden recomendado:
1. Decisión del propietario sobre el cuerpo del artículo de coste (H-12).
2. SMTP (H-1) y GA4 (H-8): sin ellos no hay conversiones medibles.
3. `chunk-4RZWRMQW.js` (93.500 B, 35,6 % del JS inicial restante).
4. Ventanas GSC ancladas a T0 y automatización autorizada.
5. Cerrar H-13 (backup) y H-5 (CI sin pruebas).
