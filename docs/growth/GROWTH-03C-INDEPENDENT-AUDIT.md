# GROWTH-03C — Auditoría independiente

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Auditor:** `independent-reviewer` — ruta `deepseek-official` / `deepseek-v4-pro` (razonamiento alto)
**Candidata auditada:** `415e2ca` + `6500f35` + `6cfcb4f` sobre `68c19cc`
**Evidencia del auditor:** `docs/growth/_team/GROWTH-03C-REVIEW-INPUT.md`
**Veredicto: PASS** — sin hallazgos críticos ni altos. Autorizado el despliegue.

---

## 1. Independencia declarada (sin adornos)

- Los implementadores de las tareas de investigación fueron **MiniMax M3.1 Flash**; el auditor es
  **DeepSeek V4 Pro**, familia distinta. ✔
- **Matiz honesto:** la implementación de rendimiento la ejecutó el **capitán** (`deepseek-flash`)
  después de que el miembro `js-perf-engineer` agotara su ventana de contexto sin producir nada. El
  auditor es un modelo distinto y sin contexto compartido, pero de la **misma casa** que el capitán.
  Por eso la independencia se apoya en hechos verificables, no en la separación de proveedor:
  el auditor **reconstruyó el build** y obtuvo un artefacto **byte-idéntico** al medido, y re-midió
  por su cuenta. Sus cifras coinciden con las del capitán.
- El auditor no escribió código de implementación. Su único fichero es el de evidencia.

---

## 2. Lo que el auditor reprodujo por sí mismo

| Comprobación | Resultado del auditor |
|---|---|
| Bundle de polyfills | 500.258 B → **34.609 B**; compilador JIT ausente |
| Build final | **byte-idéntico** al artefacto "después" registrado |
| JS transferido (home) | 1.360,2 → **658,8 KiB** (−51,6 %) |
| Bloqueo aproximado (home) | 3.095,0 → **906,5 ms** |
| LCP | 878 → 878 — **no reclamado** como mejora |
| H-10 | reproducido **200/200 fallos** (exit 141) frente a **100/100 aciertos** con here-string |
| Canonicalización | 4/4 variantes terminan en apex https; HSTS `15552000`; sitemap **33/33**; IPv6 presente |
| Regresión sobre los bytes finales | seo 33 rutas · consent 22 · analytics 15 · browser 24 · links 7 · perf 6 · api 61 |
| Rollback | objetivo `20261105_012220` alcanzable y materializado |

---

## 3. Hallazgos y cierre

| Id | Sev. | Hallazgo | Estado en este hito |
|---|---|---|---|
| F2 | **medium** | El despliegue ejecuta `/var/www/bin/publish-frontend-release.sh` (compartido, fuera del repo); el commit arregla la copia `infra/bin/` del repo, que no es la autoritativa | **Resuelto y verificado.** El propietario autorizó explícitamente el cambio del script compartido el 2026-11-05 tras el análisis de impacto. Se instaló con backup, se validó sobre el cuerpo real y **ambas copias tienen el mismo sha256 (`0ea046c4…`)** tras el despliegue |
| F1 | low | El comentario de `polyfills.ts` atribuía los 500 KB a `@angular/localize/init`, cuando la eliminación de localize sólo ahorró 507 B | **Corregido.** Reescrito con la causa real (AOT). Reconstruido después del cambio: **build byte-idéntico** (84 ficheros, mismos nombres y tamaños), por lo que el veredicto sigue ligado a los mismos bytes |
| F3 | low | El agregado "JS inicial 725.992 → 262.338 B" no estaba en los artefactos del arnés | **Cerrado documentalmente**: `GROWTH-03C-PERFORMANCE.md` §5 da la derivación exacta (suma de los 12 recursos declarados en `index.server.html`) |
| F4 | low | Ambos artefactos registran `git.commit = 68c19cc` porque "después" se midió con el árbol sucio | **Aceptado con nota**: el auditor reconstruyó el build final y era byte-idéntico; se documenta en PERFORMANCE §5 en lugar de re-medir |
| F5 | low | La ejecución "después" capturó una petición del widget de chat ausente en "antes" | **Aceptado con nota**: afecta al total de transferencia, no a `jsTransferBytes`; la reducción del 51,6 % supera el margen |
| F6 | low | El test nuevo es una aserción de texto fuente, no de comportamiento en tiempo de ejecución | **Registrado** como mejora de GROWTH-04 (aserción de runtime en el arnés SSR). La prueba real de comportamiento es la verificación en producción: el enlace se sirve en la página del artículo |

Ningún hallazgo crítico o alto quedó abierto. F2, el único medium, está cerrado con evidencia
verificable (autorización + hashes iguales), no con una promesa.

---

## 4. Confirmación final del auditor

> «Candidate `415e2ca+6500f35+6cfcb4f` is safe to deploy.» — `independent-reviewer`, 2026-11-05.

El despliegue se ejecutó **después** de este veredicto (run `42082908353`, conclusión `success`).
La verificación posterior al despliegue es independiente de esta auditoría y está en
`docs/growth/_team/GROWTH-03C-POSTDEPLOY-VERIFY.md`.

---

## 5. Ronda 2 — re-ligado a los bytes entregados

El primer veredicto quedó ligado a `415e2ca+6500f35+6cfcb4f`, pero después cambiaron
`apps/web/src/polyfills.ts` (corrección F1) y `docs/growth/GROWTH-03C-PERFORMANCE.md`, y se añadió
`scripts/release-verify.mjs`. El gate de entrega rechazó reutilizar la evidencia antigua, correctamente.
Segunda auditoría sobre el árbol actual: **PASS, sin hallazgos críticos ni altos.**

**Identidad de bytes confirmada por el propio auditor**, no por mí: reconstruyó el build y obtuvo
84 ficheros JS con los **mismos nombres con hash de contenido** (polyfills `RNHY7D3N` 34.609 B,
main `S5IVJD3W` 128.733 B), y comprobó que producción sirve exactamente ese bundle. Re-ejecutó
`build:ssr:web` (exit 0), `test:seo` (exit 0) y `release-verify.mjs` contra producción (19/19).
Verificó también la derivación de F3: los 12 recursos de `index.server.html` suman **262.338 B**.

| Id | Sev. | Hallazgo de ronda 2 | Estado |
|---|---|---|---|
| R2-F1 | low | La regex de canonical del verificador es frágil ante variaciones de atributos | Registrado en GROWTH-04 (endurecer el parser) |
| R2-F2 | low | La detección de JIT por subcadena es heurística (podría dar falso negativo) | Registrado; se complementa con el tamaño del bundle y la comprobación entre releases en disco |
| R2-F3 | low | `scripts/release-verify.mjs` estaba en `be5c234`, una confirmación por delante de `origin/master` | **Resuelto**: `be5c234` se publica junto a este documento |

- **F2 (ronda 1, medium)**: cerrado **en la práctica**, no sólo documentalmente: el despliegue se
  ejecutó con el script compartido corregido y el gate pasó en vivo.
- **F6 (ronda 1, low)**: sigue abierto por decisión consciente; la aserción de runtime se propone en
  GROWTH-04. La prueba real de comportamiento hoy es producción: el enlace se sirve en la página.

**Veredicto final: PASS en dos rondas, sobre los bytes realmente entregados.**
