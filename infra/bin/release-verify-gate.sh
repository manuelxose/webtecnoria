#!/bin/bash
#
# GROWTH-04 P0-1b - gate de release POSTERIOR al publish.
#
# Por que existe: `publish-frontend-release.sh` publica la release y reinicia el
# servicio ANTES de comprobar el sitio publico, asi que un smoke fallido deja la
# release viva con la pipeline en rojo. Este script corre despues del deploy y es
# el unico que decide si el step de CI se pone verde.
#
# Solo lectura sobre el sitio publico: HTTP GET. No escribe nada salvo dos
# ficheros de estado en el directorio de releases (informe + marcador).
#
# Marcador de revision: tecnoria-release-verify-gate-v1
set -uo pipefail

ROOT="/var/www/webtecnoria"
NODE_BIN="${NODE_BIN:-/usr/bin/node}"
REPORT="${ROOT}/apps/web/releases/.release-verify.report"
MARKER="${ROOT}/apps/web/releases/.release-verify.ok"

cd "${ROOT}" || exit 1
rm -f -- "${MARKER}"

# Revision del verificador instalado (GROWTH-04, hallazgo F2 de la revisión).
#
# La primera versión buscaba la cadena 'release-verify/2', que no existía en
# ningún sitio: el gate devolvía 1 SIEMPRE y el deploy quedaba rojo con la release
# ya publicada. Ahora se comprueban capacidades reales que el verificador debe
# tener para que el gate tenga sentido: si falta cualquiera, el verificador
# instalado está anticuado y el gate falla antes de dar un falso verde.
VERIFIER="${ROOT}/scripts/release-verify.mjs"
if [ ! -f "${VERIFIER}" ]; then
  printf 'release gate: %s is missing\n' "${VERIFIER}" | tee "${REPORT}"
  exit 1
fi

missing=""
grep -q 'MIN_BODY_CHARS' "${VERIFIER}" || missing="${missing} MIN_BODY_CHARS"
grep -q 'genericAnchorCount' "${VERIFIER}" || missing="${missing} genericAnchorCount"
grep -q 'tocIssues' "${VERIFIER}" || missing="${missing} tocIssues"

if [ -n "${missing}" ]; then
  printf 'release gate: release-verify.mjs is outdated, missing:%s\n' "${missing}" | tee "${REPORT}"
  exit 1
fi

status=0

if ! "${NODE_BIN}" "${ROOT}/scripts/release-verify.mjs" --base https://tecnoriasl.com > "${REPORT}" 2>&1; then
  status=1
fi

# Resumen en el log del job (no se oculta un fallo).
tail -n 60 "${REPORT}"

if [ "${status}" -ne 0 ]; then
  printf 'release gate: FAILED (informe en %s)\n' "${REPORT}" >&2
  exit 1
fi

printf 'release gate: OK (%s)\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "${MARKER}"
chmod 0644 "${MARKER}" "${REPORT}" 2>/dev/null || true
printf 'release gate: OK\n'
