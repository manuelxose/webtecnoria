#!/bin/bash
set -euo pipefail

APP_NAME="tecnoria-web" \
BUILD_WORKDIR="/var/www/webtecnoria/apps/web" \
BUILD_CMD="npm run build:ssr" \
STAGING_DIR="/var/www/webtecnoria/apps/web/dist" \
RELEASES_DIR="/var/www/webtecnoria/apps/web/releases" \
SERVICE_NAME="tecnoria-web.service" \
SERVER_ENTRY="server/server.mjs" \
LOCAL_URL="http://127.0.0.1:4300/" \
PUBLIC_URL="https://tecnoriasl.com/" \
PUBLIC_HOST="tecnoriasl.com" \
EXPECTED_TEXT="IA aplicada para empresas" \
NODE_BUILD_OPTIONS="${NODE_BUILD_OPTIONS:---max-old-space-size=1536}" \
exec /var/www/bin/publish-frontend-release.sh
