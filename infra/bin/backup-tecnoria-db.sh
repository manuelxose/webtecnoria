#!/bin/bash
set -euo pipefail

DEST="${DEST:-/var/backups/tecnoria/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATABASES=(tecnoria tecnoria_chat)

install -d -m 0750 -o root -g root "$DEST"
ts="$(date +%Y%m%d_%H%M%S)"

for db in "${DATABASES[@]}"; do
  out="${DEST}/${db}_${ts}.dump.gz"
  sudo -u postgres pg_dump -Fc "$db" | gzip -9 > "$out"
  gzip -t "$out"
  gzip -dc "$out" | pg_restore -l > /dev/null
  chmod 0640 "$out"
  printf 'backup ok: %s (%s bytes)\n' "$out" "$(stat -c %s "$out")"
done

find "$DEST" -type f -name '*.dump.gz' -mtime "+${RETENTION_DAYS}" -delete
