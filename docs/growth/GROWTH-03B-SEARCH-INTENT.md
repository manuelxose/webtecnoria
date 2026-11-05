# GROWTH-03B — Mapa de intención de búsqueda y backlog priorizado

**Base:** datos reales de Search Console `["query","page"]` (ver
[`GROWTH-03B-GSC-EVIDENCE.md`](GROWTH-03B-GSC-EVIDENCE.md)). Ninguna cifra de este documento
proviene de estimadores externos de volumen: **GSC es la única fuente**.

---

## 1. Separación estricta de intenciones

| Clase | Definición operativa aplicada | URLs observadas |
|---|---|---|
| **Canibalización genuina** | Dos URLs reciben impresiones de **la misma consulta** con la misma intención | **Ninguna en 28/90 d.** Solo histórica y ya resuelta por `LEGACY_REDIRECT` |
| **Intención informacional complementaria** | La consulta pide entender/decidir; otra URL responde a la compra | Artículo de coste → servicio software a medida |
| **Intención comercial** | La consulta pide precio, proveedor o alcance contratable | `precio/cuánto cuesta desarrollo software a medida` |
| **Datos insuficientes** | Menos de ~10 impresiones o sin filas | chatbots, IA, talkaris, casos de éxito |
| **Consultas irrelevantes** | Sin relación con el negocio | `manga seinen`, `ria`, `telefonos tecno`, cadena de prompt pegada, `muestrame las imagenes` |

> La regla aplicada: **no** se declara canibalización porque dos páginas mencionen la misma
> palabra clave. Se exige misma consulta + misma intención + volumen suficiente. Con esa regla,
> el resultado del hito es que **no existe canibalización viva** en el dominio.

---

## 2. Perfil de intención por página

### `/blog/cuanto-cuesta-desarrollar-software-medida` — 267 imp / 0 clics / pos 16,9–31,3 (90 d)

Intención dominante: **investigación de precio de compra (MOFU)**. Todas sus consultas contienen
`precio`, `cuesta` o `coste`. Es la **página comercial más importante del sitio por demanda** y,
a la vez, la que **peor convierte impresiones en clics** (0 de 267 en 90 días).

### `/servicios/desarrollo-software-medida` — 77 imp / 0 clics / pos 71,6 (fila de página, 90 d)

Intención dominante observada: **local WordPress / diseño web en Soria**, ajena al servicio.
Solo 2 de sus 54 impresiones consulta+página corresponden a variantes de «software a medida».
**Conclusión: esta página no está compitiendo por «software a medida»; está recibiendo ruido local.**

### `/servicios/consultoria-tecnologica` — 731 imp en 480 d, pos 67,3

Intención comercial correcta, posicionamiento débil. No es un desajuste de intención.

---

## 3. Backlog priorizado por valor de negocio esperado

El orden no es por impresiones brutas, sino por **probabilidad de producir una consulta
comercial**. Ninguna acción incluye promesas de ranking.

| # | Página exacta | Intención exacta | Evidencia actual | Acción propuesta | Riesgo | Mecanismo esperado | Método de validación |
|---|---|---|---|---|---|---|---|
| **1** | `/blog/cuanto-cuesta-desarrollar-software-medida` | `cuánto cuesta desarrollar software a medida` y familia `precio software a medida` | 267 imp, **0 clics**, pos 16,9–31,3 en 90 d; 12 filas | **HECHO en 03B:** enlace contextual al servicio desde la barra lateral. **Pendiente:** revisar `title`/`description` del artículo contra estas consultas | Bajo (no cambia canonical) | (a) el lector de precio llega al servicio; (b) un `title` que refleje la consulta puede elevar CTR en página 2 | `gsc-query-page` a 28 d: CTR del artículo y primeras filas hacia el servicio; no atribuir causalidad sin delta sostenido 2 ventanas |
| **2** | `/servicios/desarrollo-software-medida` | «software a medida» comercial | Solo 2 imp de «a medida»; 52 imp locales Soria | **NO HACER contenido local.** Evaluar un enlace entrante desde el artículo (hecho) y medir si hereda consultas | Medio si se persigue intención local sin oferta local | Enlazado contextual desde la página de precio | Consultas nuevas «a medida» que aterrizan en el servicio |
| **3** | `/blog/cuando-automatizar-procesos-empresa` | `qué procesos de una empresa conviene automatizar primero` | 15 imp, pos 11,75 / 21,91, 0 clics | Enlazar a `/servicios/automatizacion-procesos` | Bajo | Página en banda 11–20 con intención TOFU → enlace a servicio | Posición y clics en 28 d |
| **4** | `/blog/software-medida-vs-herramienta-estandar` | comparación estándar vs a medida | 13 imp, 0 clics, pos 23–46,6 | Enlazar a `/servicios/desarrollo-software-medida` | Bajo | Refuerzo de clúster de decisión | Igual que #3 |
| **5** | `/contacto` | `consultoria digital galicia` | 31 imp, pos 84,7 | **NO tocar en 03B.** Requiere decisión de contenido/negocio | Alto (local sin oferta) | — | — |
| **6** | `/productos/talkaris` | sin datos | 0 filas en 3 ventanas | Sigue fuera del índice; es un problema de indexación, no de enlaces | Medio | — | URL Inspection |

---

## 4. Lo que se decide **no** hacer, y por qué

- **No** crear páginas de servicio local (Soria, Galicia, Algeciras) sin oferta local verificada:
  sería contenido de puerta generado por palabra clave, prohibido por las reglas del proyecto.
- **No** añadir entradas `solutionNeeds` para chatbots/IA: **cero filas en 28, 90 y 480 días**.
  Sin demanda medida no hay justificación; se rechazó en la puerta de autorización del hito.
- **No** reescribir títulos del artículo en este hito: la consulta dominante se conoce, pero
  cambiar `title` sin una ventana posterior de medición impide distinguir causalidad.
  Queda **primera acción del siguiente hito**.
- **No** perseguir `desarrollo web soria`: implica un servicio (WordPress local) que no se presta.
