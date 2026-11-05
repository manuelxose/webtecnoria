# GROWTH-02 — Plan de tareas, propietarios y rutas de modelo

**Proyecto:** TECNORIA — tecnoriasl.com
**Hito:** `TECNORIA-GROWTH-02`
**Coordinador:** AgentTeams (`agent_teams_*`), capitán = Lead Orchestrator
**Equipo:** `tecnoria-growth-02` (3 especialistas + capitán; límite `maxMembers = 4`)

---

## 1. Restricciones de ejecución del arnés

| Límite | Valor | Efecto real |
|---|---|---|
| `maxDepth` | 1 | Los hijos directos no pueden delegar más |
| `maxActiveSubagents` | 3 | Máximo 3 miembros activos a la vez |
| `maxMembers` | 4 | 3 especialistas + capitán |
| `memberMaxDepth` | 0 | Los miembros del equipo no crean subagentes |

Consecuencia de diseño: la **investigación** (solo lectura) se paraleliza a 3; la **escritura** se
serializa porque el monorepo comparte un único `node_modules`, un `dist/` por workspace y puertos
fijos de test (`4417`/`4418`). Dos escritores concurrentes en el mismo checkout colisionarían.

---

## 2. Rutas de modelo asignadas

Política aplicada: ENGINE-01 §12.6 + §13 (rutas verificadas). Ningún modelo se sustituyó en
silencio.

| Rol / tarea | Clase | Ruta primaria | Escalado | Motivo |
|---|---|---|---|---|
| Capitán / coordinación / spec | L1 | `deepseek-official/deepseek-flash` | `deepseek-v4-pro` | Trabajo de coordinación y documentación, sin superficie de riesgo |
| Descubrimiento medición (A1) | L0 | `deepseek-official/deepseek-flash` | `deepseek-v4-pro` | Solo lectura, evidencia verificable |
| Descubrimiento privacidad (A2) | L0 | `deepseek-official/deepseek-flash` | `deepseek-v4-pro` | Solo lectura, inventario exhaustivo |
| Descubrimiento backend (A3) | L0 | `deepseek-official/deepseek-flash` | `deepseek-v4-pro` | Solo lectura, incluida comprobación SMTP |
| Implementación consentimiento + `generate_lead` | L2 | `deepseek-official/deepseek-flash` | `subagent_claude_code` (Sonnet 5.5) si falla 2 veces | Multi-fichero, SSR, accesibilidad |
| Implementación API de contacto + notificación | L2 | `deepseek-official/deepseek-flash` | `subagent_claude_code` (Sonnet 5.5) si falla 2 veces | Multi-fichero, seguridad |
| Verificación cruzada web | L2 | `deepseek-official/deepseek-flash` | — | Verificador ≠ implementador |
| Verificación cruzada API | L2 | `deepseek-official/deepseek-flash` | — | Verificador ≠ implementador |
| Documentación de crecimiento | L0 | `deepseek-official/deepseek-flash` | — | Documentación, sin cifras inventadas |
| **Revisión independiente final** | **L4** | **`subagent_claude_code` (Sonnet 5.5)** | Codex 6.1 sol | Herramienta externa al equipo: no implementó nada. Obligatoria para L4 y para cambios sensibles de seguridad/privacidad/release |

Notas de honestidad sobre coste: `subagent_claude_code` es una ejecución con suscripción
(`SUBSCRIPTION_UNPRICED`); no es una ruta LLM de AgentTeams y no se contabiliza como coste cero.
El coste monetario de las rutas DeepSeek es **UNKNOWN** en esta instalación: el adaptador no lee
metadatos de coste del proveedor y ningún consumidor reporta gasto. No se deriva ninguna factura del
contador de tokens de la sesión.

Limitación declarada: los tres especialistas comparten familia de modelo (DeepSeek Flash). La
independencia real la aporta la revisión L4 con un modelo de familia distinta (Claude Sonnet 5.5),
que no participó en la implementación.

---

## 3. Reparto de propiedad de ficheros (sin solapes)

| Propietario | Rutas de escritura |
|---|---|
| `privacy-consent` | `apps/web/src/index.html`, `apps/web/src/app/site/components/consent-*`, `apps/web/src/app/site/services/consent.service.ts`, `apps/web/src/app/site/services/analytics.service.ts`, `apps/web/src/app/site/components/contact-form.component.*`, `apps/web/src/app/app.component.*`, `apps/web/src/app/site/components/site-footer.component.ts`, `apps/web/src/app/site/pages/cookies-page.component.ts`, `apps/web/src/app/app.routes.ts`, `scripts/tests/*`, `scripts/browser-*.mjs` |
| `backend-lead` | `apps/api/src/routes/v1/contact.ts`, `apps/api/src/services/notification.ts`, `apps/api/src/services/lead-rate-limit.ts`, `apps/api/src/config/trusted-proxy.ts`, `apps/api/src/scripts/renotify-leads.ts`, `apps/api/src/db/migrations/*`, `apps/api/src/index.ts` (solo proxy y logging) |
| `analytics-search` | `docs/growth/GSC-SETUP.md`, `docs/growth/SEARCH-BASELINE.md`, `docs/growth/GA4-CONFIGURATION.md`, `docs/growth/CONVERSION-MEASUREMENT.md`, `scripts/growth-monitor.mjs` |
| Capitán | `specs/002-*`, `docs/growth/GROWTH-02-*.md`, `docs/growth/CONSENT-IMPLEMENTATION.md`, `qa/qa-manifest.json`, despliegue |

---

## 4. DAG de tareas

```
Wave A (paralelo, solo lectura)
  A1 medición ─┐
  A2 privacidad├──► S1 especificación (capitán)
  A3 backend ──┘            │
                            ▼
              B1 consentimiento + generate_lead (privacy-consent)   [escritor único]
                            │
                            ▼
              V1 verificación web + navegador real (backend-lead)
                            │
                            ▼
              B2 API de contacto + notificación + migración (backend-lead) [escritor único]
                            │
                            ▼
              V2 verificación API + regresión SEO completa (privacy-consent)
                            │
                            ▼
              D1 documentación de crecimiento + monitor (analytics-search)
                            │
                            ▼
              R1 revisión independiente L4 (Claude Sonnet 5.5, externa al equipo)
                            │
                            ▼
              X1 reparaciones → X2 despliegue → X3 smoke de producción
```

---

## 5. Estado de tareas

Leyenda: `[x]` hecha · `[~]` en curso · `[ ]` pendiente · `[B]` bloqueada por acceso externo.

### Fase 1 — Descubrimiento (paralelo, solo lectura)

- `[~]` **A1** Estado de visibilidad en buscadores y analítica — `analytics-search`
- `[~]` **A2** Inventario de cookies, almacenamiento y consentimiento — `privacy-consent`
- `[~]` **A3** Ruta del lead, superficie de abuso, proxy de confianza, SMTP, backups — `backend-lead`

### Fase 2 — Especificación

- `[x]` **S1** `specs/002-*/spec.md`, `plan.md`, `tasks.md` (Spec Kit) — capitán
- `[x]` **S2** `docs/growth/GROWTH-02-SPEC.md` — capitán
- `[>]` **S3** Este documento — capitán

### Fase 3 — Consentimiento (escritor único)

- `[ ]` **B1** Eliminar GA4 incondicional, `ConsentService`, banner accesible, reapertura y retirada, política de cookies, `AnalyticsService.trackLead()`, honeypot en el formulario, tests A/C/D
- `[ ]` **V1** Verificación cruzada + pruebas de navegador reales (CDP) de consentimiento, responsive y accesibilidad

### Fase 4 — Fiabilidad del lead (escritor único)

- `[ ]` **B2** API endurecida, rate limit, idempotencia, proxy de confianza, notificación SMTP, migración, recuperación, tests B/I
- `[ ]` **V2** Verificación cruzada + `npm run test:seo` + regresión completa

### Fase 5 — Medición y documentación

- `[ ]` **D1** `GSC-SETUP.md`, `SEARCH-BASELINE.md`, `GA4-CONFIGURATION.md`, `CONVERSION-MEASUREMENT.md`, `scripts/growth-monitor.mjs`

### Fase 6 — Revisión y entrega

- `[ ]` **R1** Revisión independiente L4 (Claude Sonnet 5.5)
- `[ ]` **X1** Reparación de hallazgos críticos y mayores
- `[ ]` **X2** Despliegue vía GitHub Actions (push a `master`)
- `[ ]` **X3** Smoke de producción, verificación de consentimiento por defecto y regresión SEO
- `[ ]` **X4** `GROWTH-02-DELIVERY.md`, `GROWTH-02-INDEPENDENT-AUDIT.md`, `LEAD-RELIABILITY.md`, `CONSENT-IMPLEMENTATION.md`

### Bloqueadas externamente

- `[B]` **T090** Search Console: crear propiedad de dominio, TXT en DNS, verificar, enviar sitemap
- `[B]` **T091** GA4: acceso admin/datos y exportación de línea base
- `[B]` **T092** Cloudflare: token de API para invalidación selectiva
- `[B]` **T093** Aprobación legal del texto de privacidad/cookies por el responsable del tratamiento

---

## 6. Reglas de ejecución aplicadas

1. Toda tarea de escritura declara `objective`, `acceptance`, `inScope` y `verify`.
2. El verificador nunca es el implementador de lo que verifica.
3. Un fallo de verificación o revisión bloquea las tareas dependientes; no se "narra" como éxito.
4. Reparación automática limitada a 2 intentos, después se escala.
5. Ninguna tarea se marca completada sin comando ejecutado y salida real.
