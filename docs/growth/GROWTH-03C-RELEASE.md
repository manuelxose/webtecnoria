# GROWTH-03C — Release: puerta H-10, despliegue y rollback

**Proyecto:** TECNORIA · `https://tecnoriasl.com`
**Fecha:** 2026-11-05 · **Servidor:** `contabo` (vmi2962975, CET/UTC+01:00)

> Estado de este documento al escribirlo: **release candidata lista y verificada; despliegue
> pendiente de la revisión independiente**. El resultado real del despliegue está en
> [`GROWTH-03C-DELIVERY.md`](GROWTH-03C-DELIVERY.md). No se declara desplegado nada aquí.

---

## 1. Punto de partida verificado

| Elemento | Valor real |
|---|---|
| HEAD local | `6cfcb4f` (tras esta release candidata) |
| `origin/master` | `894e7c6` — el código de GROWTH-03B **nunca se había empujado** |
| Checkout del servidor | `894e7c6` (árbol limpio) |
| Release activa | `apps/web/releases/20261105_052852`, fingerprint `25fd5e80…c61` |
| Servicios | `tecnoria-web` y `tecnoria-api` activos, `nginx` activo |

Conclusión que el handoff no recogía: el hito anterior **no falló al desplegar por un gate roto
únicamente**; sus commits ni siquiera llegaron al remoto, así que GitHub Actions no llegó a
ejecutarse para ese código. Producción sigue sirviendo `894e7c6`.

---

## 2. H-10 — diagnóstico definitivo

### Clasificación: **B — supuesto inválido del smoke test (defecto de shell)**. No es A, ni C, ni D.

La aplicación estaba bien. El gate estaba roto. Evidencia:

- nginx registró `200` con el cuerpo completo de **125.377 bytes** en las seis peticiones del run
  fallido `41969593283`, y `TecnoRia` aparece **13 veces** en ese cuerpo (primer acierto en el byte
  243).
- La causa está en `infra/bin/publish-frontend-release.sh` línea 240, bajo `set -euo pipefail`:

```bash
if printf '%s' "${body}" | grep -Fq "${EXPECTED_TEXT}"; then
```

`grep -q` sale en el primer acierto; `printf` sigue escribiendo y muere con **SIGPIPE (141)**;
`pipefail` propaga 141; el `if` toma la rama falsa y tras 5 intentos el script imprime
`Expected text not found` y sale 1.

### Reproducción y tasas medidas (N=200 por consumidor, cuerpos reales del origen)

| Consumidor del script compartido | Bytes del cuerpo | Fallos falsos |
|---|---:|---:|
| `tecnoria-web` | 125.096 | **200/200 (100 %)** |
| `electroria-web` | 247.575 | **200/200 (100 %)** |
| `auctorio-studio` | 63.996 | 85/200 (42,5 %) |
| `talkaris-portal` | 57.091 | 38/200 (19 %) |

Sin `pipefail`: 0/100. Con here-string: 0 fallos. **No hay umbral de 64 KiB**: es una carrera entre
la salida de `grep` y la escritura de `printf`, y empeora con el tamaño del cuerpo y con lo pronto
que aparezca el texto.

Corrección de una premisa mía durante la investigación: el run de 05:28 **también** falló en la
aserción; el último paso verde fue a las 01:22-01:30. La línea defectuosa estaba presente desde el
inicio, y el cuerpo creció de 117.727 B a 125.377 B, lo que llevó la tasa de fallo al 100 %.

### Corrección aplicada (autorizada por el propietario el 2026-11-05)

```bash
if grep -Fq -- "${EXPECTED_TEXT}" <<<"${body}"; then
```

Una línea. La here-string se escribe en un fichero temporal, así que ningún proceso puede morir por
SIGPIPE y el estado es el de `grep`.

**Alcance del cambio**: sólo la aserción. No cambia qué se despliega, ni cuándo se reinicia el
servicio. Una página que de verdad no contenga el texto sigue fallando.

**Estado en el servidor** (instalado y validado, no solo commiteado):

| Elemento | Valor |
|---|---|
| Backup previo | `/var/www/bin/publish-frontend-release.sh.bak-2026-11-05-h10` |
| Copia instalada | `/var/www/bin/publish-frontend-release.sh`, sha256 `0ea046c4…31fa` |
| Copia del repo local | `infra/bin/publish-frontend-release.sh`, sha256 `0ea046c4…31fa` (idénticas) |
| Sintaxis | `bash -n` → OK |
| Función real instalada sobre el cuerpo vivo | 50/50 aciertos (`FUNCTION_OK_rc=0`) |
| Aserción antigua, mismo cuerpo | 0/20 aciertos (20 fallos) |
| Control negativo (texto ausente) | falla correctamente |

**Rollback de esta corrección**: `install -m 0755` del backup sobre el destino y verificar sha256.
No requiere reinicio de nada.

**Impacto en otros proyectos**: el script es compartido por 4 aplicaciones / 6 puntos de llamada
(`tecnoria-web`, `electroria-web`, `talkaris-portal`, `auctorio-studio`; `guiatv` y `embarcarte` **no**
lo usan). Los cuatro pasan de falsos negativos a un resultado correcto; ninguno puede pasar a fallar
por este cambio, porque el texto se sigue exigiendo.

---

## 3. Rollback listo (registrado antes de desplegar)

| Elemento | Valor |
|---|---|
| Release activa antes del despliegue | `20261105_052852` (fingerprint `25fd5e80…c61`) |
| **Objetivo de rollback** | **`20261105_012220`** (fingerprint `6d5562e1…73fa`) |
| Releases retenidas | 6, todas con fingerprint recalculado y coincidente |
| Contenido de cada release | `browser/` (107-108 ficheros), `server/` (93-95), `server.mjs`, `index.server.html` |
| Prerender | `prerendered-routes.json` = `{"routes": {}}` en las seis → **100 % SSR**, un rollback no pierde nada prerenderizado |
| Backup de BD | par del 2026-11-05 03:30, verificado con `gzip -t` y `pg_restore -l` (OK) |
| Migraciones | 001-009 aditivas y re-ejecutables; el rollback de código no revierte datos |

Procedimiento exacto (ya documentado en `docs/growth/DEPLOYMENT-ROLLBACK.md` §5): repuntar
atómicamente `releases/current` al release anterior con `ln -sfn` + `mv -Tf` y `systemctl restart
tecnoria-web`. Es una operación de 1-3 s, sin rebuild.

**Ventana**: `KEEP_RELEASES=5` purga el release de rollback tras ~4 publicaciones más. La ventana
cómoda es corta y este documento la fija.

### Hallazgo no bloqueante (para el operador)

Uno de los dumps de la BD de chat del 03:30 tiene modo `0644` (legible por cualquiera) cuando el
script aplica `0640`, y el log del cron sólo registra **una** línea `backup ok` aunque el par se
verificó correctamente. El archivo es válido; el procedimiento no terminó como está escrito. Se
recomienda revisar `/usr/local/sbin/tecnoria-db-backup` y el modo de los dumps **antes** de la
próxima release. No bloquea ésta porque el backup es verificable y el rollback no depende de la BD.

---

## 4. Qué se va a desplegar

Cinco commits locales sobre `origin/master` (`894e7c6`):

| Commit | Contenido |
|---|---|
| `94de3ab` | GROWTH-03B: 3 cambios de enlazado + herramientas GSC/perf + tests |
| `68c19cc` | GROWTH-03B: documentación |
| `415e2ca` | AOT en producción: −465.649 B de polyfills (−93,1 %) |
| `6500f35` | Enlace editorial servicio en artículos servidos por CMS + test |
| `6cfcb4f` | Aserción del smoke determinista (H-10) |

Nada toca `apps/api/**`, migraciones, `.github/**` ni otros proyectos del servidor.

---

## 5. Puertas antes de ejecutar el push

| Puerta | Estado |
|---|---|
| Código listo y compilado | ✅ build AOT sin errores |
| Regresión completa | ✅ seo 33 rutas · consent 22 · analytics 15 · browser 24 · links 7 · perf 6 · api 61 |
| Revisión independiente | ⏳ en curso (`independent-reviewer`, DeepSeek V4 Pro) |
| Rollback verificado | ✅ §3 |
| Gate de despliegue fiable | ✅ H-10 corregido e instalado, validado sobre el cuerpo real |
| Autorización del propietario | ✅ 2026-11-05 (despliegue condicionado a que pasen las puertas) |

El push a `master` dispara el flujo autorizado (`.github/workflows/deploy.yml` → SSH →
`deploy-webtecnoria.sh`). No se despliega por ninguna vía alternativa.
