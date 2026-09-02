#!/bin/bash
set -euo pipefail

printf '%-18s %-28s %-19s %-19s %-6s %s\n' APP SERVICE STARTED RELEASE_MTIME MATCH RELEASE_TARGET

resolve_existing_path() {
  local path="$1"
  readlink -e "${path}" 2>/dev/null || true
}

report_row() {
  local app="$1"
  local service="$2"
  local target="$3"
  local started release_mtime pid running match frontend_release_dir resolved_target resolved_frontend_release_dir display_target

  started="$(systemctl show -p ExecMainStartTimestamp --value "${service}" | sed 's/ CET//; s/ CEST//')"
  resolved_target="$(resolve_existing_path "${target}")"
  release_mtime="$(stat -c '%y' "${resolved_target}" 2>/dev/null | cut -d'.' -f1 || true)"
  pid="$(systemctl show -p MainPID --value "${service}" 2>/dev/null || true)"
  if [ -n "${pid}" ] && [ "${pid}" != "0" ] && [ -r "/proc/${pid}/cmdline" ]; then
    running="$(tr '\0' '\n' < "/proc/${pid}/cmdline" | tail -n 1)"
  else
    running=""
  fi

  frontend_release_dir="$(systemctl show -p Environment --value "${service}" 2>/dev/null | tr ' ' '\n' | sed -n 's/^FRONTEND_RELEASE_DIR=//p' | tail -n 1)"
  resolved_frontend_release_dir="$(resolve_existing_path "${frontend_release_dir}")"
  display_target="${resolved_target:-${target}}"

  match="no"
  if [ -n "${running}" ] && [ -n "${resolved_target}" ] && [ "$(readlink -f "${running}")" = "${resolved_target}" ]; then
    match="yes"
  elif [ -n "${resolved_frontend_release_dir}" ] && [ -n "${resolved_target}" ] && [ "${resolved_frontend_release_dir}" = "$(dirname "$(dirname "${resolved_target}")")" ]; then
    match="env"
  fi

  printf '%-18s %-28s %-19s %-19s %-6s %s\n' "${app}" "${service}" "${started:-missing}" "${release_mtime:-missing}" "${match}" "${display_target}"
  if [ -n "${running}" ]; then
    printf '  running: %s\n' "${running}"
  fi
  if [ -n "${frontend_release_dir}" ]; then
    printf '  release-dir-env: %s\n' "${frontend_release_dir}"
  fi
}

report_row "talkaris" "tecnoria-chat-portal.service" "/var/www/talkaris/apps/portal/releases/current/server/server.mjs"
report_row "auctorio" "content-ai-studio.service" "/var/www/content-ai-platform/apps/studio-web/releases/current/server/server.mjs"
report_row "electroria" "electroria-web.service" "/var/www/electroria/apps/web/releases/current/server/server.mjs"
report_row "tecnoria" "tecnoria-web.service" "/var/www/webtecnoria/apps/web/releases/current/server/server.mjs"
report_row "guiatv" "guiatv-ssr.service" "/var/www/guiatv/apps/frontend/releases/current/server/main.server.mjs"
