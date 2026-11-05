# GROWTH-03B — Evidencia de Search Console (consulta + página)

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Hito:** TECNORIA-GROWTH-03B
**Fecha de captura de datos:** 2026-11-05T13:39:03Z
**Commit base:** `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7`
**Herramienta:** `scripts/gsc-query-page.mjs` (nueva, solo lectura)
**Exportación bruta:** `docs/growth/_team/gsc-query-page-2026-11-05.json` (652.639 bytes)

---

## 1. Acceso y método

| Elemento | Valor verificado |
|---|---|
| Propiedad | `sc-domain:tecnoriasl.com` |
| Cuenta de servicio | `guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` |
| Permiso | **`siteOwner`** (comprobado en vivo contra la API de sitios, HTTP 200) |
| Scope OAuth | `https://www.googleapis.com/auth/webmasters.readonly` — **solo lectura** |
| Endpoint | Search Analytics API, `dimensions: ["query","page"]` |
| Tipo de búsqueda | `web`; `dataState: all` |
| Paginación | `startRow` + `rowLimit 25000`, tope 5 páginas; **sin truncamiento** en ninguna ventana |
| Finalización de datos | `endDate = hoy(UTC) − 3 días` (ventanas **completas y finalizadas**) |

Ventanas medidas:

| Ventana | Rango exacto | Clics | Impresiones | Filas consulta+página |
|---|---|---|---|---|
| 28 días | 2026-10-06 → 2026-11-02 | 3 | 210 | 33 |
| 90 días | 2026-08-05 → 2026-11-02 | 15 | 725 | 64 |
| 480 días | 2025-07-11 → 2026-11-02 | 79 | 35.299 | 809 |

Los totales se toman **únicamente** de la consulta sin dimensiones. Las filas por dimensión
**no son sumables**; esto se reprodujo en este mismo conjunto: en 480 días la suma de filas
(35.612) **supera** el total de la propiedad (35.299).

**Filtro de host aplicado:** se analiza solo `tecnoriasl.com` (+`www`). Se excluyen los hosts
heredados WordPress `cms.tecnoriasl.com` (57 impresiones / 13 filas en 90 d) y
`clientes.tecnoriasl.com`.

**Limitación reconocida:** Google Search Console suprime consultas anonimizadas o de muy bajo
volumen. **Una fila ausente no prueba que una página tenga cero impresiones.** En 28 días, 33 de
210 impresiones y 1 de 3 clics no son atribuibles a ninguna fila consulta+página.

---

## 2. ¿Hay canibalización entre el artículo de coste y la página de servicio?

**Veredicto: NO hay canibalización observada en los datos disponibles de GSC.**

No se afirma que la canibalización sea imposible: GSC suprime consultas anonimizadas o de bajo
volumen, y una consulta compartida con impresiones mínimas podría no aparecer. Lo que sí se
demuestra es que, **en los datos observados**, el artículo y la página de servicio **no comparten
ni una sola consulta** en 28 ni en 90 días, y que responden a intenciones distintas con 2.300+
impresiones de evidencia.

El artículo `/blog/cuanto-cuesta-desarrollar-software-medida` y la página
`/servicios/desarrollo-software-medida` **no comparten ni una sola consulta** en 28 ni en 90 días.
La intersección de conjuntos de consultas entre ambas URLs es el conjunto vacío.

| Ventana | Filas del artículo | Impresiones | Clics | Filas del servicio | Impresiones | Clics | Consultas compartidas |
|---|---|---|---|---|---|---|---|
| 28 d | 8 | 115 | 0 | 2 | 2 | 0 | **0** |
| 90 d | 12 | 267 | 0 | 5 | 54 | 0 | **0** |

Reparto real de intención:

- **Artículo → intención informacional/comercial de investigación.** Tiene el 100 % de la demanda
  de precio: `cuánto cuesta desarrollar software a medida` (63 imp, pos 17,16),
  `desarrollo software a medida precio` (86 imp, pos 31,29), `cuánto cuesta software a medida`
  (27 imp, pos 16,93).
- **Página de servicio → intención local de otra naturaleza.** 52 de sus 54 impresiones de 90
  días son `desarrollo web soria` (30 imp, pos 72,4), `pagina web wordpress soria` (17 imp, pos
  80,1) y `diseño web wordpress soria` (5 imp, pos 85,2). Es decir, **su tráfico no es de
  «software a medida»**, es intención local de diseño web WordPress.

Compartir palabras clave **no** es canibalización. No hay dos URLs compitiendo por la misma
consulta y la misma intención: hay una página que responde a precio y otra que recibe ruido local.
Clasificación correcta: **contenido complementario** (informacional → comercial), no competencia.

> **Consecuencia para el proyecto:** cualquier propuesta basada en «el artículo canibaliza al
> servicio» queda **rechazada por falta de evidencia**. El problema del artículo no es canibalizar:
> es que ocupa posiciones 17–31 y no recibe clics.

### 2.1 Canibalización histórica ya resuelta

En 480 días, 122 de 492 consultas distintas aparecen en más de una URL de destino
(`consultoria digital galicia` en 19 URLs, `agencia crm vigo` en 18). **Todas esas URLs son
`LEGACY_REDIRECT`** declaradas en `apps/web/src/app/site/seo-route-manifest.ts` y tienen **0
impresiones en 28 y 90 días**. Es canibalización ya resuelta por redirección, no una incidencia
viva. Observación honesta: las URLs de destino **aún no han heredado** esas posiciones históricas.

---

## 3. Oportunidades comerciales medidas

### 3.1 Consultas con impresiones, cero clics y posición 11–20 (banda de un empujón)

| Consulta | Aterrizaje | Imp. | Clics | Posición | Ventana |
|---|---|---|---|---|---|
| `cuánto cuesta desarrollar software a medida` | artículo de coste | 63 | 0 | 17,16 | 90 d |
| `cuanto cuesta un software a medida` | artículo de coste | 30 | 0 | 18,87 | 90 d |
| `cuánto cuesta software a medida` | artículo de coste | 27 | 0 | 16,93 | 90 d |
| `qué procesos de una empresa conviene automatizar primero` | `cuando-automatizar-procesos-empresa` | 4 | 0 | 11,75 | 90 d |

### 3.2 El dato más duro del hito

**Clics totales de todas las páginas `/servicios/*` y `/blog/*` en 90 días: 0.**
De los 15 clics de 90 días, 12 corresponden a la home (`https://` 11 + `http://` 1) y 1 a
`/blog/que-necesitas-antes-de-crear-un-saas`; el resto no es atribuible a filas visibles.
La única fila con clics en ambas ventanas es la marca `tecnoria` → home (2 clics / 14 imp, pos 1,64).

### 3.3 Páginas que reciben demanda que no pueden satisfacer

| Página | Consulta | Imp. | Posición | Motivo del desajuste |
|---|---|---|---|---|
| `/servicios/desarrollo-software-medida` | `desarrollo web soria` | 30 | 72,4 | intención local web/WordPress, no software a medida |
| `/servicios/desarrollo-software-medida` | `pagina web wordpress soria` | 17 | 80,1 | ídem |
| `/contacto` | `consultoria digital galicia` | 31 | 84,7 | un formulario no responde a intención de consultoría |
| `/servicios/consultoria-tecnologica` | `consultoria tecnologica para empresas en algeciras` | 37 | 58,5 | intención local que una página genérica no cubre |

`consultoria tecnologica` (731 imp en 480 d, pos 67,3) **no** es un desajuste de intención: la
página es la correcta y el problema es de posicionamiento.

### 3.4 Datos insuficientes (documentado, no estimado)

Sin **ninguna** fila consulta+página en 28, 90 **ni** 480 días:
`/servicios/desarrollo-chatbots-empresas`, `/servicios/inteligencia-artificial-empresas`,
`/productos/talkaris`, `/casos-de-exito`.

Muestra insuficiente para clasificar: `/soluciones` (5 imp), `/faq` (2), `/mapa-web` (2),
`/oficina-virtual-kit-digital` (2). Y `/blog/que-necesitas-antes-de-crear-un-saas` (27 imp, 1 clic)
sin filas consulta+página: **el clic no es atribuible a una consulta**.

---

## 4. Bandera técnica (registrada, no corregida en este hito)

`http://tecnoriasl.com/` aparece indexada de forma separada: 12 filas / 21 impresiones / 0 clics
en 90 días, frente a `https://` con 107 impresiones / 11 clics / pos 4,96. Requiere verificar la
redirección http→https. **No se modifica nada por esto en GROWTH-03B**; queda en el backlog.

---

## 5. Reproducibilidad

```bash
node scripts/gsc-query-page.mjs --out docs/growth/_team/gsc-query-page-<fecha>.json
```

Una segunda ejecución y comparación de ventanas dio `windows identical across runs: true`
(solo cambia `queriedAt`). El script falla de forma explícita ante error de token o de API y
**nunca imprime valores de credencial**; la cuenta se identifica únicamente por su correo.
