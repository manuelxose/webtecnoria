#!/bin/bash
# Deploy completo de webtecnoria2 en produccion (VPS Contabo)
# Uso: sudo /var/www/webtecnoria/infra/deploy-webtecnoria.sh [branch]
# - API: build tsc -> dist en sitio, restart tecnoria-api, smoke 3001
# - Web SSR: release symlink via /var/www/bin/deploy-tecnoria-web.sh (build:ssr + smoke 4300 + publica)
# - MIGRATE=1 para ejecutar npm run migrate:api antes del restart
set -euo pipefail
IFS=$'\n\t'

APP_DIR="/var/www/webtecnoria"
BRANCH="${1:-master}"
API_PORT="3001"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root" >&2
  exit 1
fi

wait_http() {
  local url="$1"
  local i
  for i in $(seq 1 30); do
    local code
    code=$(curl --max-time 5 -s -o /dev/null -w "%{http_code}" "$url" || true)
    if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

cd "${APP_DIR}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree has local changes; refusing to deploy a stale checkout." >&2
  git status --short >&2
  exit 1
fi

git fetch --prune origin
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

npm install --no-audit --no-fund

# 1) API corporativa
npm run -w apps/api build
# MIGRATE defaults to 1: the API depends on its schema, and the migration runner
# re-applies every file on each release (no ledger), so all files are guarded.
# This block lives INSIDE this script on purpose: sudoers grants the SSH deploy
# user NOPASSWD only for this exact path, so `sudo bash -c ...` or `sudo env ...`
# are denied. Running as root here also lets us load the service environment,
# which `npm run migrate:api` needs because env.ts validates every required
# variable at import time (there is no apps/api/.env on the server).
if [ "${MIGRATE:-1}" = "1" ]; then
  if [ -r /etc/tecnoria/api.env ]; then
    set -a
    # shellcheck disable=SC1091
    . /etc/tecnoria/api.env
    set +a
  fi
  npm run migrate:api
fi
systemctl restart tecnoria-api
wait_http "http://127.0.0.1:${API_PORT}/health"

# 2) Web SSR (release + restart + smoke local/publico)
/var/www/bin/deploy-tecnoria-web.sh

# 3) Gate POSTERIOR al publish (GROWTH-04).
#
# Por que aqui y no en el workflow: sudoers NOPASSWD solo permite estas tres rutas
# exactas (/etc/sudoers.d/90-deploy), asi que un `sudo .../release-verify-gate.sh`
# desde GitHub Actions pediria contrasena sin TTY y el step fallaria antes de
# comprobar nada. Este script ya corre como root y ya esta en la lista permitida,
# de modo que el gate se ejecuta dentro y su codigo de salida decide el deploy.
#
# El smoke de publish-frontend-release.sh ocurre ANTES de este punto: sin este
# gate, el job podria quedar rojo con la release ya viva.
#
# GROWTH-04b: el gate se invoca con `bash <ruta>`, no como ejecutable directo.
# Causa medida del primer deploy fallido (run 42114563529): el fichero estaba en
# el servidor con modo 100644 porque el commit se hizo desde Windows y git no
# guardo el bit +x; `-x` lo tomaba por "ausente" y tumbaba la release. Un fichero
# de un script de shell no necesita el bit de ejecucion para ejecutarse, asi que
# la comprobacion es de EXISTENCIA y legibilidad, no de permiso de ejecucion.
RELEASE_GATE="/var/www/webtecnoria/infra/bin/release-verify-gate.sh"
if [ ! -r "${RELEASE_GATE}" ]; then
  echo "Deploy webtecnoria: release gate missing at ${RELEASE_GATE}" >&2
  exit 1
fi
if ! bash "${RELEASE_GATE}"; then
  echo "Deploy webtecnoria: release gate FAILED (release already published)" >&2
  exit 1
fi

echo "Deploy webtecnoria OK: $(git rev-parse --short HEAD)"
