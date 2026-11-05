# Handoff — TECNORIA-GROWTH-03

**Preparado al cierre de:** TECNORIA-GROWTH-02 (medición, consentimiento, fiabilidad de leads)
**Dominio:** tecnoriasl.com
**Fecha:** 2026-11-05
**Estado de partida:** ver [`GROWTH-02-DELIVERY.md`](GROWTH-02-DELIVERY.md)

Este documento no es un plan de deseos. Cada línea nace de una medición real de GROWTH-02 o de un
bloqueo documentado con su causa exacta.

---

## 1. Foco solicitado

1. Optimización de LCP y TBT en móvil.
2. Análisis de oportunidad de palabras clave comerciales.
3. Mejora de páginas de servicio.
4. Desarrollo de enlazado interno.
5. Priorización de contenido.
6. Monitorización de visibilidad en buscadores.
7. Captación de leads orgánicos.

Reglas heredadas que **siguen vigentes**: no lanzar un generador masivo de contenido con IA, no crear
backlinks artificiales, no comenzar desarrollo de producto no relacionado, y no inventar ninguna
cifra de tráfico, ranking o conversión.

---

## 2. Lo que GROWTH-02 deja medido

### 2.1 Search Console — ya hay datos reales

La propiedad `sc-domain:tecnoriasl.com` existe y la cuenta de servicio
`guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` es **siteOwner**. Consulta reproducible:

```bash
GOOGLE_APPLICATION_CREDENTIALS=<ruta al service account> \
  node scripts/gsc-query.mjs baseline --out docs/growth/_team/gsc-baseline.json
```

Ventanas medidas (clics / impresiones): 7 d `0 / 51` · 28 d `3 / 216` · 90 d `15 / 702` ·
480 d `78 / 34.810`.

Sitemap: reenviado el 2026-11-05 (`HTTP 204`), Google lo descargó ~1 s después, `submitted: "32"`.
Antes estaba enviado desde 2026-03-12 con 24 URLs y sin reenvío desde el hito 01 — el sitemap de 32
URLs nunca había llegado a Google.

### 2.2 Estado de indexación por URL (URL Inspection API)

| URL | coverageState | verdict |
|---|---|---|
| `/` | Submitted and indexed | PASS |
| `/blog/cuanto-cuesta-desarrollar-software-medida` | Submitted and indexed | PASS |
| `/servicios/desarrollo-software-medida` | Submitted and indexed | PASS |
| `/contacto` | Submitted and indexed | PASS |
| `/servicios` | Submitted and indexed | PASS |
| `/productos/talkaris` | Discovered - currently not indexed | NEUTRAL |

`/productos/talkaris` está en el sitemap y Google **no la ha registrado**. Es la primera candidata a
diagnóstico de indexación del siguiente hito.

### 2.3 Oportunidad comercial ya visible (ventana de 28 días)

Consultas no marcarias con impresiones y **cero clics**:

| Consulta | Impresiones | Posición media |
|---|---|---|
| `cuánto cuesta desarrollar software a medida` | 70 | 16,4 |
| `desarrollo software a medida precio` | 26 | 36,8 |
| `precio software a medida` | 17 | 19,9 |
| `precio desarrollo software a medida` | 4 | 23,5 |
| `precio de desarrollo de software a medida` | 3 | 36,3 |

Página con más impresiones y **cero clics**: `/blog/cuanto-cuesta-desarrollar-software-medida`,
131 impresiones. Es la mayor fuga de CTR medida del sitio.

Demanda marcaria mal escrita y residual: `tecnoria`, `teknoria`, `tecno`, `tecnografia`, `teknory`.
Ruido heredado sin relación: `manga seinen`, `ria`, `telefonos tecno`, y una cadena de prompt pegada.

**Ojo con la propiedad de dominio**: incluye `clientes.tecnoriasl.com` y `cms.tecnoriasl.com`
(WordPress heredado). Aportan impresiones irrelevantes al total. Cualquier análisis por clúster debe
filtrar por host.

### 2.4 Advertencia metodológica sobre los datos de GSC

Las filas por dimensión **no son sumables**. Total de la propiedad a 28 d: 216 impresiones / 3 clics;
las filas por consulta suman 169/2 y las filas por página suman 251. Los totales se toman de la
consulta sin dimensiones; las tablas por dimensión sirven para ordenar, no para sumar.

---

## 3. Tareas obligatorias heredadas (bloqueos y deudas)

Ninguna de estas es opcional: cada una bloquea o degrada algo que GROWTH-02 no pudo cerrar.

| # | Tarea | Por qué es obligatoria | Evidencia |
|---|---|---|---|
| H-1 | Rotar la credencial SMTP (app password de Gmail con 2FA, o proveedor transaccional con SPF+DKIM+DMARC) | La notificación de leads está implementada y probada, pero **no entrega en producción**. Además `access-request` devuelve 502 tras insertar la fila y la recuperación de contraseña no entrega nada — mismo origen | `EAUTH 534-5.7.9 WebLoginRequired` en `GROWTH-02-INFRA-DRILL.md` |
| H-2 | Aprobación legal del texto de privacidad y cookies por el responsable del tratamiento o su asesoría | Hay 5 marcas `PENDING CONTROLLER/COUNSEL APPROVAL`. Un banner no es cumplimiento legal | `CONSENT-IMPLEMENTATION.md` §11, `cookies-page.component.ts` |
| H-3 | Decidir el widget de chat (Talkaris): condicionarlo a consentimiento o a un clic, o mantener la divulgación actual | Hoy contacta `talkaris.com` **antes** de cualquier decisión. Está divulgado, no condicionado | L4 review G-10 |
| H-4 | Ledger de migraciones + transacción por fichero; y hacer que `npm run migrate:api` no dependa del esquema completo de `env.ts` | El runner re-aplica todo en cada release. Dos defectos de datos se encontraron por esto (006 trigger, 002 UPDATE de blog). El workflow ya sourcea el entorno, pero la deuda de diseño permanece | `migrations/`, `deploy.yml`, L4 G-1/G-4 |
| H-5 | Job de tests en CI | `deploy.yml` **no ejecuta ninguna prueba**: despliega si el build compila. El gate real es local. Además `test:browser` lanza Chrome con ruta de Windows, así que necesita portabilidad antes de entrar en CI | t24 F-3 |
| H-6 | Simulacro de restauración con el esquema **posterior** a la migración 009 | El simulacro se hizo con un dump anterior: 9 columnas. Una restauración con 18 columnas no está probada | `GROWTH-02-INFRA-DRILL.md` §5 |
| H-7 | Token de API de Cloudflare (permiso de purga por zona) | Sin invalidación selectiva no se pueden evaluar los redirects legacy servidos desde caché | Sin token en host ni servidor |
| H-8 | Acceso admin/datos a GA4 (`G-LE6ETPWL23`) | La Admin API está deshabilitada en el proyecto `533857766582` y la cuenta de servicio no pertenece a la propiedad. Sin acceso no hay cifras de comportamiento, ni marcar `generate_lead` como conversión, ni exclusiones de referidos | `GA4-CONFIGURATION.md` |
| H-9 | Sincronización entre pestañas del consentimiento (evento `storage`) | Retirar en la pestaña A no detiene la B | L4 G-8 |

---

## 4. Alcance propuesto para GROWTH-03

### 4.1 Rendimiento móvil (LCP y TBT)

Punto de partida honesto: no hay datos de campo (CrUX) y no se ha medido Lighthouse en este hito.
Lo que sí está medido: el sitio ya no descarga GA4 antes del consentimiento, lo que retira del camino
crítico el mayor script de terceros. La medición de referencia debe hacerse **antes** de optimizar.

- Medir LCP y TBT con traza real (CDP) en 390×844 sobre el build desplegado, y guardar el JSON.
- Candidatos ya identificados que no requieren adivinar: el CSS de `home-page` excede su presupuesto
  declarado (6,65 kB frente a 6,00 kB) y hay tres `hero-mesh-orb` decorativos más un canvas de
  partículas en el hero.
- Criterio de cierre: misma medición, mismo dispositivo, delta documentado. Sin cifras de Lighthouse
  no se afirma mejora.

### 4.2 Palabras clave comerciales

- Filtrar la propiedad por host para excluir `clientes.` y `cms.`.
- Atacar primero las consultas con impresiones y posición 11–20: son las que están a un empujón.
  `cuánto cuesta desarrollar software a medida` (posición 16,4) es la primera.
- No usar estimaciones de volumen externas como si fueran datos propios: la fuente es GSC.

### 4.3 Páginas de servicio

- Contrastar cada página de servicio contra las consultas que ya recibe en GSC, no contra una
  plantilla genérica.
- La página del artículo de coste (131 impresiones, 0 clics) necesita trabajo de título y extracto
  antes que contenido nuevo: ya recibe impresiones y no convierte en clic.

### 4.4 Enlazado interno

- Auditar enlaces internos hacia las seis páginas de servicio y hacia el artículo de coste.
- Priorizar rutas con impresiones y sin clics: el enlazado es la palanca más barata que queda.

### 4.5 Priorización de contenido

- Ordenar por impresiones reales y posición, no por intuición de palabras clave.
- Nada de generación masiva. Cada página nueva debe responder a una consulta medida.

### 4.6 Monitorización de visibilidad

- Ejecutar `node scripts/growth-monitor.mjs` en día 7, 14 y 30; guardar el JSON de cada observación.
- `node scripts/gsc-query.mjs baseline` en la misma cadencia para comparar ventanas.
- Vigilar `/productos/talkaris`: sigue fuera del índice.
- Vigilar el recuento de URLs indexadas del sitemap, sabiendo que el contador de GSC va con retraso y
  que la autoridad es la URL Inspection API.

### 4.7 Captación de leads orgánicos

- La instrumentación ya existe: `generate_lead` con `form_type`, `service_category` y `source_page`,
  disparado solo tras el 201 y solo con consentimiento.
- **No habrá cifras de conversión hasta que H-1 (SMTP) y H-8 (GA4) se resuelvan.** Cualquier informe
  intermedio debe decir `sin datos`, no estimar.
- Los recuentos operativos de leads pueden obtenerse de la base de datos sin analítica de
  comportamiento, y así deben mantenerse: son dos planos distintos.

---

## 5. Lo que NO debe hacerse en GROWTH-03

- No reactivar la carga de analítica antes del consentimiento "para medir mejor".
- No añadir un segundo sistema de analítica sin justificación fuerte.
- No introducir un CMP pesado: la solución actual no añade dependencias.
- No tocar `apps/api/migrations/**` sin ejecutar antes la guarda de doble pasada y la guarda estática
  de mutaciones de datos.
- No desplegar sin `MIGRATE=1` cuando haya migraciones nuevas: la API depende de ellas.
- No afirmar indexación por un `HTTP 200`, ni presentar datos de laboratorio como datos de campo.

---

## 6. Criterio de éxito de GROWTH-03

1. LCP y TBT medidos antes y después en el mismo dispositivo, con traza guardada.
2. Al menos una consulta comercial con impresiones movida de la banda 11–20 con delta documentado.
3. `/productos/talkaris` diagnosticada: indexada o con causa raíz identificada.
4. Enlazado interno hacia las páginas de servicio medido y mejorado.
5. Monitorización día 7 / 14 / 30 ejecutada con sus JSON.
6. H-1 y H-8 resueltos o explícitamente bloqueados con la acción externa concreta.
7. Nada presentado como PASS sin comando ejecutado y salida real.
