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

if git diff --quiet && git diff --cached --quiet; then
  git fetch --prune origin
  git checkout "${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
else
  echo "Working tree has local changes. Deploying current checkout without git sync."
fi

npm install --no-audit --no-fund

# 1) API corporativa
npm run -w apps/api build
if [ "${MIGRATE:-0}" = "1" ]; then
  npm run migrate:api
fi
systemctl restart tecnoria-api
wait_http "http://127.0.0.1:${API_PORT}/health"

# 2) Web SSR (release + restart + smoke local/publico)
/var/www/bin/deploy-tecnoria-web.sh

echo "Deploy webtecnoria OK: $(git rev-parse --short HEAD)"
