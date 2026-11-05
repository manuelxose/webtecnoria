# GROWTH-02 — Especificación del hito

**Proyecto:** TECNORIA — tecnoriasl.com
**Hito:** `TECNORIA-GROWTH-02` — medición, consentimiento, fiabilidad de leads y visibilidad en buscadores
**Estado:** en ejecución
**Fecha de apertura:** 2026-11-05
**Artefactos Spec Kit:** [`specs/002-measurement-consent-lead-reliability/spec.md`](../../specs/002-measurement-consent-lead-reliability/spec.md),
[`plan.md`](../../specs/002-measurement-consent-lead-reliability/plan.md),
[`tasks.md`](../../specs/002-measurement-consent-lead-reliability/tasks.md)

---

## 1. Punto de partida verificado

El handoff de GROWTH-01 **no se dio por bueno**: se volvió a verificar contra el repositorio real y
contra el servidor de producción. Resultado de la verificación independiente:

| Comprobación | Resultado real | Evidencia |
|---|---|---|
| Commit de aplicación desplegado | `3c7cdb9` | `git log` en `109.123.248.164:/var/www/webtecnoria`, HEAD `6b86ab0` con 3 commits de documentación posteriores |
| Release activa | `20261105_012220` | `readlink -f .../apps/web/releases/current` |
| Servicios | `tecnoria-web`, `tecnoria-api`, `nginx`, `postgresql` → `active` | `systemctl is-active` |
| Sitemap | **32** URLs, `https://tecnoriasl.com/sitemap.xml` | `curl … \| grep -c '<loc>'` |
| `robots.txt` | correcto, privadas en `Disallow`, sitemap declarado | `curl https://tecnoriasl.com/robots.txt` |
| 404 real | `404` en URL inexistente | `curl -o /dev/null -w '%{http_code}'` |
| Redirect legacy | `301 → /servicios/consultoria-tecnologica` | `curl -w '%{http_code} -> %{redirect_url}'` |
| `www` → no-`www` | `301 → https://tecnoriasl.com/` | `curl -w` |
| Cloudflare | activo (`server: cloudflare`, `cf-ray`, `cf-cache-status: DYNAMIC`) | `curl -D -` |
| **GA4 antes de consentimiento** | **`G-LE6ETPWL23` se carga incondicionalmente** | `apps/web/src/index.html:49-55`; 1 ocurrencia de `googletagmanager` en el documento servido |
| Base de datos | `contact_messages` con **17 filas reales** | `psql -tAc 'select count(*)'` |
| Notificación de lead | **no existe ninguna ruta de código que envíe email** | `apps/api/src/services/email.ts` no se importa en `contact.ts` |
| Rate limiting del formulario | **ninguno** — 5 POST inválidos seguidos → `400,400,400,400,400` | sonda contra producción |

El handoff de GROWTH-01 es **exacto** en lo que describe. Lo que no describe son los dos defectos de
producción que este hito corrige: analítica sin consentimiento y leads que se guardan sin avisar a
nadie.

---

## 2. Objetivo

Cerrar la infraestructura de medición y captación necesaria para crecer de forma sostenible, con
implementación real (no recomendaciones), revisión independiente y verificación en producción.

Prioridad absoluta: **dejar de hacer peticiones a Google antes de que la persona usuaria acepte.**

---

## 3. Alcance

### 3.1 Dentro del alcance

1. **Consent Mode v2 en modo básico.** Por defecto `denied` en `analytics_storage`, `ad_storage`,
   `ad_user_data`, `ad_personalization`. Ninguna petición de red a Google antes del consentimiento
   afirmativo de analítica.
2. **Interfaz de consentimiento accesible.** Aceptar / Rechazar / Configurar con la misma
   prominencia, sin categorías opcionales preseleccionadas, preferencia persistente, reapertura
   permanente y retirada del consentimiento.
3. **`generate_lead` fiable.** Se dispara solo tras confirmación de creación del lead, una sola vez,
   solo con consentimiento, sin datos personales.
4. **Formulario de contacto protegido y fiable.** Validación de servidor con límites, honeypot,
   rate limiting, idempotencia, logging estructurado sin PII, notificación por email y estado de
   notificación separado del estado de almacenamiento, con recuperación.
5. **Medición de conversión** ligera y documentada.
6. **Línea base de medición** con vacíos explícitos (sin cifras inventadas).
7. **Monitorización** día 7 / 14 / 30.
8. **Revisión independiente** de seguridad, SEO y privacidad.

### 3.2 Fuera del alcance

- Generación masiva de contenido, backlinks artificiales, compra de tráfico.
- Un segundo sistema de analítica.
- Aprobación legal del texto de privacidad/cookies (la da el responsable del tratamiento o su
  asesoría, no la ingeniería).
- Creación de la propiedad de Search Console sin cuenta de Google autorizada.
- Purga de caché de Cloudflare sin credenciales de API.

---

## 4. Requisitos funcionales

| ID | Requisito |
|---|---|
| FR-001 | Los valores por defecto de consentimiento se establecen **antes** de que se añada o ejecute cualquier script de Google. |
| FR-002 | Ninguna petición a un origen de analítica/publicidad de Google antes del consentimiento afirmativo de analítica (modo básico). |
| FR-003 | Aceptar, Rechazar y Configurar con la misma prominencia visual; Rechazar en un solo paso. |
| FR-004 | Categorías opcionales sin preseleccionar. |
| FR-005 | La elección persiste entre navegaciones y recargas, y se puede cambiar y retirar desde un control siempre accesible. |
| FR-006 | Aceptar analítica **no** concede consentimiento publicitario. |
| FR-007 | `generate_lead` solo tras creación confirmada del lead, como máximo una vez por lead. |
| FR-008 | Todo parámetro de evento es no personal y está documentado. |
| FR-009 | Validación de servidor con longitudes máximas explícitas y normalización. |
| FR-010 | Rate limit por cliente con `429` y `Retry-After`. |
| FR-011 | Honeypot positivo → respuesta con forma de éxito, sin escritura en base de datos. |
| FR-012 | Clave de idempotencia: una repetición no crea un segundo lead. |
| FR-013 | Notificación al operador por el SMTP configurado, con resultado persistido aparte del almacenamiento. |
| FR-014 | Logs estructurados sin cuerpo del mensaje, email, teléfono ni IP en claro. |
| FR-015 | Mecanismo de recuperación para leads guardados sin notificar. |
| FR-016 | IP de cliente derivada de una cadena de proxy de confianza; cabeceras reenviadas por pares no confiables, ignoradas. |
| FR-017 | Procedimiento de monitorización día 7 / 14 / 30. |

## 5. Requisitos no funcionales

| ID | Requisito |
|---|---|
| NFR-001 | El componente de consentimiento no empeora LCP ni TBT; retirar la descarga de GA4 antes del consentimiento debería mejorarlos. |
| NFR-002 | Interfaz de consentimiento conforme a WCAG 2.2 AA (teclado y lector de pantalla). |
| NFR-003 | `npm run test:seo` sigue pasando 32/32. |
| NFR-004 | Sin nuevas dependencias de runtime para consentimiento ni rate limiting. |
| NFR-005 | Desplegable con el workflow de GitHub Actions existente, sin tocar servicios ajenos. |

---

## 6. Criterios de aceptación del hito

| # | Criterio | Estado |
|---|---|---|
| 1 | Interfaz de consentimiento implementada y revisada | pendiente |
| 2 | Analítica opcional bloqueada antes del consentimiento | pendiente |
| 3 | Comportamiento de Consent Mode v2 probado | pendiente |
| 4 | GA4 validado donde hay autorización | bloqueado a nivel de cuenta |
| 5 | Formulario de contacto protegido | pendiente |
| 6 | Creación de lead probada de extremo a extremo | pendiente |
| 7 | Entrega de notificación verificada o bloqueada explícitamente | pendiente |
| 8 | Eventos de analítica correctamente condicionados al consentimiento | pendiente |
| 9 | Ningún dato personal enviado a GA4 | pendiente |
| 10 | Tests de regresión SEO pasan | pendiente |
| 11 | Revisión de seguridad pasa | pendiente |
| 12 | Revisión independiente pasa | pendiente |
| 13 | Despliegue y smoke de producción pasan | pendiente |
| 14 | Línea base medible establecida donde hay datos | parcial (vacío explícito) |

---

## 7. Bloqueos externos declarados

| Bloqueo | Qué falta exactamente | Consecuencia |
|---|---|---|
| Search Console | Cuenta de Google autorizada para crear la propiedad de dominio de `tecnoriasl.com` y publicar el registro TXT en el DNS de Cloudflare | Sin datos de impresiones, clics, consultas ni posiciones. Se entrega el procedimiento exacto, no una cifra inventada. |
| GA4 (admin/datos) | Acceso de administración o de lectura a la propiedad `G-LE6ETPWL23` | Sin informes de comportamiento ni exportación de línea base. La instrumentación sí se implementa y se prueba. |
| Cloudflare API | Token con permiso de purga sobre la zona de `tecnoriasl.com` | Sin invalidación selectiva de caché. |
| Aprobación legal | Texto de política de privacidad y cookies aprobado por el responsable del tratamiento | Se publica una configuración interina conservadora; no se afirma cumplimiento legal. |

---

## 8. Modelo de amenaza resumido

| Amenaza | Control |
|---|---|
| Envío masivo automatizado del formulario | Rate limit por cliente + honeypot + límites de tamaño |
| Inyección de cabeceras de email vía campos del formulario | Normalización, eliminación de saltos de línea en campos de una línea, asunto fijo |
| Fuga de datos personales a logs o a GA4 | Logging estructurado sin PII, parámetros de evento enumerados |
| Suplantación de cabeceras de proxy para evadir el rate limit | Cadena de confianza explícita (rangos de Cloudflare) |
| Pérdida silenciosa de un lead | Estado de notificación persistido + comando de recuperación |
| Lead duplicado por doble clic o reintento | Clave de idempotencia única + guarda en el cliente |
| Cambio de comportamiento SEO por el nuevo código | `npm run test:seo` como puerta obligatoria |

---

## 9. Reversión

La release web se publica en directorio versionado con symlink (`/var/www/webtecnoria/apps/web/releases/<timestamp>`),
por lo que volver a la release anterior es un cambio de symlink más `systemctl restart tecnoria-web`.
La API se despliega en sitio desde `master`; su reversión es `git checkout <commit>` +
`npm run -w apps/api build` + `systemctl restart tecnoria-api`. La migración de base de datos es
aditiva e idempotente para no bloquear una reversión.

Detalle operativo en [`DEPLOYMENT-ROLLBACK.md`](DEPLOYMENT-ROLLBACK.md).
