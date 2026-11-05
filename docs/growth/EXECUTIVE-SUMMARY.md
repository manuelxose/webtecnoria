# Informe ejecutivo — Transformación SEO, crecimiento, UX e infraestructura de TecnoRia

**Fecha:** 5 de noviembre de 2026
**Sitio:** https://tecnoriasl.com
**Commit de código desplegado:** `3c7cdb9`
**HEAD final del repositorio:** `f77c7b2` (solo documentación)
**Release en producción:** `20261105_012220`
**Despliegue:** GitHub Actions run `41940740641`, conclusión `success`
**Veredicto global:** **PARTIAL** — la base técnica y el despliegue están completos; quedan bloqueos
externos de medición, consentimiento, identidad legal/local y Core Web Vitals de campo.

> Este informe separa lo **observado** de lo **pendiente**. No se afirma que el tráfico orgánico haya
> aumentado, ni que el sitio esté indexado o posicionado. No había acceso a Search Console para
> `tecnoriasl.com` y no se inventaron cifras de tráfico, volúmenes, rankings ni clientes.

---

## 1. Estado inicial del sitio

El repositorio real es `github.com/manuelxose/webtecnoria` (monorepo Angular 20 SSR + API Express +
PostgreSQL). El sitio estaba vivo, servido por Cloudflare → nginx → Angular SSR en un VPS Contabo,
con TTFB de origen de 120–133 ms y sin errores 5xx de TecnoRia en los últimos 7 días.

El problema reportado era “prácticamente cero tráfico”. La investigación encontró defectos técnicos
reales, pero **no** permitió demostrar que fueran la única causa: sin Search Console no se puede
separar falta de indexación, falta de demanda, baja autoridad o mala medición.

## 2. Causas reales investigadas

La evidencia más importante: el HTML servido sin JavaScript **no contenía canonical, meta robots,
Open Graph ni JSON-LD**. Esos nodos aparecían solo después de la hidratación del navegador. Un
crawler que no ejecuta la aplicación veía la página sin señales canónicas ni datos estructurados.

Además:

- URLs inexistentes devolvían **HTTP 200** (soft 404).
- Activos inexistentes devolvían **200 HTML**.
- Unas 34 URLs legacy devolvían **200** en la URL antigua en lugar de 301.
- El sitemap tenía 24 URLs: faltaban 6 de 13 artículos y las dos páginas de producto.
- nginx añadía `Cache-Control: no-store` a todos los activos, en conflicto con la caché immutable
  de la aplicación; Cloudflare no cacheaba nada.
- El schema `LocalBusiness` usaba `addressLocality: "Galicia"` (una comunidad, no una localidad) y
  duplicaba nodos `ProfessionalService`.
- Había testimonios anónimos, casos genéricos sin cliente identificable y métricas sin fuente
  (99,9%, <200 ms, 60%, 10×). Eso es un riesgo de confianza, no un activo.

No se demostró que la causa fuera “falta de contenido”: el sitio ya tenía 13 artículos y seis
landings. La causa técnica prioritaria era la combinación de señales SSR ausentes + semántica HTTP
incorrecta + sitemap incompleto + caché mal configurada.

## 3. Cambios implementados

- Placeholders serializables en `index.html` para canonical, robots, OG/Twitter y un único script
  JSON-LD; `SeoService` actualiza esos nodos existentes.
- Manifiesto de rutas públicas y redirecciones legacy en `seo-route-manifest.ts`.
- 404 real para URLs desconocidas, `/404`, artículos de blog no publicados y activos inexistentes.
- 301 reales para rutas legacy, barra final, mayúsculas y `/index.html`.
- `X-Robots-Tag: noindex` y `Cache-Control: no-store` en rutas privadas.
- `x-powered-by` eliminado; HSTS y cabeceras de seguridad añadidas.
- Sitemap de 32 URLs canónicas; robots con `/portal`, `/acceso-restringido`, `/api/`, `/uploads/`
  bloqueados.
- Tests automáticos `scripts/seo-check.ts`: 32 rutas, canonical, robots, H1, JSON-LD, 404/301,
  activos, caché, sitemap.
- Eliminación de testimonios anónimos, cinco casos genéricos y métricas sin fuente; se mantienen
  Talkaris, Auctorio y Guía de Programación TV como prueba verificable.
- Backup diario de PostgreSQL para `tecnoria` y `tecnoria_chat`, con verificación `pg_restore -l` y
  retención de 7 días.

## 4. Mejoras en Contabo

| Antes | Después |
|---|---|
| `Cache-Control: no-store` duplicado en HTML y activos | HTML con un solo `no-store`; activos `public, max-age=31536000, immutable` |
| Cloudflare `BYPASS` en activos | Cloudflare `HIT` en activos |
| Sin HSTS ni cabeceras de seguridad | HSTS 180 días, nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy |
| `x-powered-by: Express` | eliminado |
| Sin backup de base de datos de TecnoRia | dump diario 03:30, verificado, retención 7 días |
| Fallo de despliegue por `package-lock` sucio | el deploy falla explícitamente si el checkout está sucio |
| Fallo de validación por `pipefail` | validación de salida corregida |
| Scripts de release sin bit ejecutable | modo 100755 restaurado |

TTFB de origen medido después: **114 ms**. TTFB de borde: **~318 ms** (el HTML sigue siendo dinámico;
no se activó caché de HTML en Cloudflare).

## 5. Mejoras de SEO técnico

- **32/32 URLs del sitemap** devuelven 200, canonical propio, `index, follow` y JSON-LD válido.
- **404 real** para URL desconocida, con `X-Robots-Tag: noindex, nofollow`.
- **301 real** para `/nosotros` → `/empresa` y el resto del mapa legacy.
- **Activo inexistente** → 404 `text/plain`.
- **Rutas privadas** → 302 a login y `no-store`; `/auth-foo` → 404.
- **JSON-LD**: Organization/ProfessionalService, WebSite, WebPage, BreadcrumbList, Service, Article,
  FAQPage y SoftwareApplication cuando corresponde. Sin reviews, ratings ni dirección inventada.
- **Sitemap**: 32 URLs; productos y los 13 artículos incluidos.
- **Blog**: solo se devuelve 404 si la API confirma que el artículo no existe; una caída de API no
  desindexa un artículo válido (se sirve 200 + noindex temporal).

## 6. UX y conversión

Se eliminaron afirmaciones no verificables y se sustituyeron por prueba real:

- fuera los tres testimonios anónimos y los cinco casos sin cliente identificable;
- dentro Talkaris, Auctorio y Guía de Programación TV, con enlaces verificables;
- fuera “99,9% uptime”, “<200 ms”, “60% tickets”, “10× velocidad”, “0€”, “100%”, “N sitios”;
- fuera el SLA “<24 h” de home, contacto, formulario, footer y meta description;
- el widget de chat se monta en idle (o a los 2,5 s), no bloquea el primer render;
- el canvas decorativo baja de 80 a 48 partículas y se limita a ~30 fps, pausado en pestañas ocultas.

**Pendiente de conversión:** el formulario no tiene honeypot, rate limit ni notificación por email;
no hay banner de consentimiento ni evento `generate_lead`; no se probó un envío real contra
staging. Está documentado, no maquillado.

## 7. Rendimiento antes y después

| Medición | Antes | Después |
|---|---|---|
| TTFB origen | 120–133 ms | 114 ms |
| TTFB borde | 260–322 ms | ~318 ms |
| Caché de activos | `BYPASS` | `HIT` |
| Lighthouse móvil (2 pasadas) | no se ejecutó con el mismo método | 69 y 76 / 100 |
| LCP Lighthouse móvil | — | 3,5 s y 3,3 s |
| CLS | 0,022 lab sin throttling | 0,013 y 0,022 |
| TBT | — | 660 ms y 460 ms |
| SEO / accesibilidad / best practices | — | 100 / 100 / 100 |

**No se declara un PASS de Core Web Vitals.** El LCP de laboratorio con throttling móvil está por
encima de 2,5 s y no hay datos de campo (CrUX). La comparación con el laboratorio sin throttling del
auditor (LCP 0,67–0,81 s) no es válida como antes/después. El origen es rápido; el coste restante es
JavaScript/hidratación, CSS inline, GA4 y el widget de Talkaris.

## 8. Skills instaladas y verificadas

- **GitHub Spec Kit 1.3.0** con integración oficial `dsh`; skills `speckit-*` en `.dsh/skills`,
  constitución en `.specify/memory/constitution.md` y especificación en
  `specs/001-seo-growth-transformation/`.
- **Ponytail** ya instalado globalmente; usado para el cambio mínimo completo.
- **Marketing skills** (MIT, `coreyhaines31/marketingskills`): seo-audit, site-architecture, schema,
  content-strategy, programmatic-seo, ai-seo, copywriting, copy-editing, cro, analytics,
  conversion-tracking, competitors, link-building, free-tools. Instaladas en `.dsh/skills`
  (local-only por convención del repo).
- **SEOmator 7.0.0** (MIT) ejecutado vía `npx`; informe en
  `docs/growth/_team/seomator-baseline.json`. Se registraron sus falsos positivos: enlace
  `/cdn-cgi/l/email-protection`, “secreto” que es un client ID público de Google, y avisos de
  LocalBusiness ya eliminados.
- **Microsoft TokenEconomizer**: **no instalado**. No existe adaptador para DeepSeek Harness en esta
  instalación; no se añadieron hooks globales sin probar. Limitación documentada.

## 9. Delegación real y modelos

| Tarea | Agente | Modelo | Resultado |
|---|---|---|---|
| t1 auditoría SEO | `seo-auditor` | deepseek-v4-pro | `_team/SEO-BASELINE-AUDIT.md` |
| t2 crecimiento | `growth-strategist` | deepseek-flash | `_team/GROWTH-STRATEGY.md` |
| t3 infraestructura | `infra-sre` | deepseek-v4-pro | `_team/INFRA-AUDIT.md` |
| Capitán / implementación | `deepseek-flash` | deepseek-flash | cambios y despliegue |
| Revisión independiente | Claude Sonnet 5.5 | externo | dos revisiones, hallazgos corregidos |

No se usó Opus. No se afirma que el harness reescriba rutas de modelo; la selección se registró.
El coste monetario es **UNKNOWN**: el proveedor no reporta facturación en esta instalación.

## 10. Revisiones independientes

Dos revisiones estáticas de Claude Sonnet 5.5 (no la implementadora) encontraron y motivaron
correcciones: cabeceras duplicadas, herencia de nginx, 404 de blog dependiente de API, caché de blog
sin límite, rutas `/auth-*`, caché immutable en archivos no hasheados, SLA y métricas sin fuente.
La revisión no pudo ejecutar shell en su sesión; el capitán ejecutó y registró los comandos. El
veredicto final es **PASS WITH FINDINGS**, sin blocker abierto en el alcance revisado.

Además, el capitán detectó tras el despliegue un fallo que las revisiones estáticas no vieron: la
normalización a minúsculas rompía los activos hasheados en Linux (`301 → 404`) y Cloudflare cacheó
el 301. Se corrigió con un índice de activos que resuelve la URL en minúsculas; el sitio volvió a
servir todos los JS/CSS con 200.

## 11. Estado del despliegue

- Commit final: `3c7cdb9`.
- Release: `20261105_012220`.
- GitHub Actions: run `41940740641`, `success`.
- `tecnoria-web`, `tecnoria-api` y nginx: activos, 0 reinicios.
- Smoke post-despliegue: home 200, servicio 200, legacy 301, 404 real, activo inexistente 404,
  `/dashboard` 302, `/auth-foo` 404.
- 32/32 URLs del sitemap verificadas con canonical, robots y JSON-LD.
- Backup: `tecnoria_20261105_011458.dump.gz` (18.711 bytes) y
  `tecnoria_chat_20261105_011458.dump.gz` (469 KB), verificados con `pg_restore -l`.

## 12. Bloqueos pendientes

1. **Search Console:** no hay propiedad de `tecnoriasl.com`; el `GSC_SITE_URL` disponible es de otro
   dominio. Sin ello no se puede afirmar indexación, impresiones, clics ni consultas.
2. **GA4:** la propiedad `G-LE6ETPWL23` existe, pero no hay acceso admin/datos demostrado.
3. **Consentimiento:** GA4 carga sin banner ni consent mode. Riesgo legal; no se implementó copy sin
   aprobación.
4. **Formulario:** sin honeypot, rate limit, notificación por email ni evento de lead. No probado
   end-to-end.
5. **Identidad local/legal:** no hay dirección, localidad, razón social ni NIF verificados. No se
   creó página local ni LocalBusiness.
6. **Prueba de clientes:** solo tres proyectos son verificables; faltan permisos para casos y
   métricas.
7. **Cloudflare:** no hay token para purgar los 301 antiguos de activos; el fallback en minúsculas
   mantiene el sitio operativo, pero añade un salto.
8. **Core Web Vitals de campo:** sin CrUX/RUM. El lab no es campo.
9. **Monitorización y restore drill:** backup verificado, pero no hay alertas ni restauración real
   en base desechable.

## 13. Estrategia de crecimiento para 90 días

**Días 0–30:** verificar GSC y enviar sitemap; consentimiento + GA4; spam y notificación del
formulario; baseline de 90/480 días; resolver identidad legal/local; mantener 32/32 y cero
afirmaciones sin fuente.

**Días 31–60:** publicar 3 casos verificables con URL propia si hay permiso; página de modelo de
encargo/precios; un comparativo (software a medida vs low-code / cómo evaluar IA); enlaces desde las
landings; una sola página local solo con dirección real; medir `form_start` y `generate_lead`.

**Días 61–90:** revisar GSC por clúster; mejorar CTR de páginas con impresiones; profundizar el
clúster con más tracción; decidir un sector con demanda observada; podar artículos sin intención
diferenciada; revisar CWV de campo; decidir el siguiente trimestre.

Indicadores: impresiones no branded por clúster → clics → formularios iniciados → leads cualificados
→ llamadas de discovery. Sin GSC/CRM no se publican cifras de tráfico ni ingresos.

## 14. Siguiente hito recomendado

**“Medición y consentimiento”**: propiedad de Search Console verificada, sitemap enviado, banner de
consentimiento con consent mode, evento `generate_lead`, spam/notificación del formulario y baseline
exportado. Es el requisito para que cualquier trabajo de contenido posterior sea medible y legal.

---

## Matriz de evidencias

| Afirmación | Evidencia |
|---|---|
| Canonical/robots/JSON-LD en HTML crudo | `curl` 2026-11-05; `.after-home`/live verificados; `TECHNICAL-SEO-AUDIT.md` |
| 32/32 URLs correctas | script live: `checked=32 bad=0`; `npm run test:seo` exit 0 |
| 404/301/activo inexistente | `curl -o /dev/null -w '%{http_code}'`; test automatizado |
| Rutas privadas | `/dashboard` 302 + no-store, `/auth-foo` 404 + noindex |
| Caché de activos | `cache-control: public, max-age=31536000, immutable`, `cf-cache-status: HIT` |
| HSTS/cabeceras | `curl -I`; `CONTABO-OPTIMIZATION-REPORT.md` |
| Backup DB | dump + `pg_restore -l` exit 0; `/var/backups/tecnoria/postgres/` |
| Despliegue | GitHub Actions `41940740641` success; release `20261105_012220` |
| Lighthouse | dos JSON en `%TEMP%`, resumen en `PERFORMANCE-BENCHMARKS.md` |
| Revisión independiente | `INDEPENDENT-AUDIT.md`; dos revisiones Claude Sonnet 5.5 |
| Skills | `SKILLS.md`; Spec Kit 1.3.0; catálogo DSH |
| GSC/GA4 bloqueados | `SEO-00-BASELINE.md` §6; `ANALYTICS-MEASUREMENT.md` |

**Conclusión:** la web es ahora técnicamente rastreable, canónica, indexable, con semántica HTTP
correcta, sitemap completo, caché coherente y pruebas repetibles. Eso no equivale a tráfico ni a
posiciones: la medición real y las decisiones de negocio siguen siendo el siguiente paso.
