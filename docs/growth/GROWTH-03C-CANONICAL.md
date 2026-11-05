# GROWTH-03C — Canonicalización HTTP/HTTPS

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Fecha:** 2026-11-05 · Verificado en vivo por el capitán y de forma independiente por
`release-engineer` (`docs/growth/_team/GROWTH-03C-CANONICAL-INPUT.md`).

> La pregunta del hito era si las 21 impresiones de `http://tecnoriasl.com/` en Search Console
> demuestran un defecto técnico activo. **No lo demuestran.** Este documento separa lo que se midió
> de lo que Search Console implica.

---

## 1. Matriz medida (respuestas reales, no supuestos)

| URL solicitada | Estado | `Location` / destino final | Saltos |
|---|---|---:|---:|
| `http://tecnoriasl.com/` | **301** | `https://tecnoriasl.com/` | 1 |
| `http://www.tecnoriasl.com/` | **301** | `https://tecnoriasl.com/` (vía https www) | 3 |
| `https://www.tecnoriasl.com/` | **301** | `https://tecnoriasl.com` | 2 |
| `https://tecnoriasl.com/` | **200** | — (destino canónico) | 1 |

- Todas las redirecciones son **301 permanentes**, sin cadenas largas ni bucles.
- La terminación es siempre el apex en HTTPS. No hay ninguna variante que sirva 200 con contenido
  propio.

## 2. Señales del documento y del servidor

| Señal | Valor medido |
|---|---|
| `<link rel="canonical">` en la home y en todas las rutas públicas | `https://tecnoriasl.com/…` autorreferente y correcta |
| `Strict-Transport-Security` | `max-age=15552000` en las respuestas **200** (no en los 301, que es correcto) |
| `robots.txt` | un único sitemap, hostname `https://tecnoriasl.com` |
| `sitemap.xml` | **33/33** `<loc>` en el host apex HTTPS |
| Enlaces internos renderizados (home) | hosts absolutos: `tecnoriasl.com` 9, `schema.org` 1, `googletagmanager` 1; `www` 0; `http://` 0 |
| IPv4 vs IPv6 | ambos 200 con el mismo contenido (125.767 B) y el mismo canonical; apex y www comparten A y AAAA |
| Cloudflare | añade ~390 B de markup `cdn-cgi`; no altera canonical ni hosts |

Configuración del origen (`/etc/nginx/sites-enabled/tecnoria.conf`): bloque 80 → `return 301
https://$host$request_uri`; bloque `www` → `return 301 https://tecnoriasl.com$request_uri`; bloque
apex 443 con HSTS y proxy a la SSR en `127.0.0.1:4300`. Es la configuración correcta para
consolidar en un único canónico.

## 3. Qué significan las filas `http://` de Search Console

- La propiedad es `sc-domain:tecnoriasl.com` (propiedad de dominio): agrupa **todos** los hosts y
  esquemas bajo el dominio, incluidos `http://`, `https://`, `www` y los subdominios heredados
  `clientes.` y `cms.`.
- `http://tecnoriasl.com/` aparece con 21 impresiones y 0 clics en 90 días frente a 33 impresiones y
  2 clics de `https://`. Eso es **consolidación esperada**: Google conserva filas históricas del
  esquema anterior aunque hoy redirija.
- Una fila de impresiones **no** prueba que la URL esté indexada como canónica independiente. Para
  afirmarlo haría falta URL Inspection sobre la URL `http://`, que este hito no ejecutó.

**Veredicto: PASS — no hay defecto de canonicalización que corregir.** No se toca infraestructura.

## 4. Acción recomendada (opcional, sólo propietario)

1. En Search Console, `URL Inspection` sobre `https://tecnoriasl.com/` y `Request indexing` si se
   quiere acelerar el refresco tras el despliegue.
2. **No** usar `Removals` sobre las URLs `http://`: están redirigidas y retirarlas no aporta nada.
3. Mantener el filtro de host en los informes: `clientes.tecnoriasl.com` y `cms.tecnoriasl.com` son
   ruido heredado de WordPress y contaminan las agregaciones.

## 5. Lo que este documento NO afirma

- No afirma que Google haya elegido ya el canónico HTTPS para cada variante (no se ejecutó URL
  Inspection).
- No atribuye ninguna mejora de impresiones a este análisis: no se cambió nada.
