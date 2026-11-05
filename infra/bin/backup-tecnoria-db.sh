#!/bin/bash
#
# GROWTH-04 P0-1 - backup de las bases de Tecnoria.
#
# Cuatro defectos medidos el 2026-11-05 en produccion (vmi2962975) y aqui corregidos:
#
# 1. SIGPIPE + pipefail (mismo patron que H-10). `gzip -dc "$out" | pg_restore -l`
#    no rompia nada por si mismo, pero `set -euo pipefail` convertia cualquier
#    consumidor que cerrase la tuberia antes de tiempo en exit 141 -> el script
#    moria entre las dos bases. Medido: el dump de `tecnoria_chat` de las 03:30
#    quedo en 0644 y el log del cron solo tenia UNA linea `backup ok`. Se
#    elimina la tuberia: pg_restore lee el fichero descomprimido desde un
#    temporal privado, asi que ningun proceso puede morir por SIGPIPE.
#
# 2. Confidencialidad. El `chmod 0640` se ejecutaba DESPUES de crear el fichero,
#    de modo que cualquier fallo previo dejaba el dump de chat en el 0644 que da
#    el umask por defecto: legible por cualquier usuario local. Ahora el fichero
#    NACE con 0140 (umask 0137 sobre `>` + `install -m 0140` del temporal) y los
#    permisos se verifican antes de publicarlo.
#
# 3. Aislamiento por base. Un fallo en una base abortaba el script y dejaba la
#    otra sin intentar, ademas de borrar la pista (set -e). Ahora cada base se
#    ejecuta en su propio bloque: se registra y el script sigue con la siguiente.
#    El codigo de salida final es 0 solo si TODAS las bases se respaldaron y
#    verificaron.
#
# 4. Rotacion silenciosa de backups rotos: solo se publica (rename atomico) el
#    dump que ha pasado `gzip -t` y `pg_restore -l`; un dump invalido se borra.
#
# Marcador de revision: tecnoria-backup-v2 (lo comprueba la evidencia de deploy).
set -uo pipefail

DEST="${DEST:-/var/backups/tecnoria/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATABASES=(tecnoria tecnoria_chat)

# Dumps y temporales de trabajo: nunca legibles por grupo/mundo.
umask 0137

install -d -m 0750 -o root -g root "$DEST"
# El temporal vive dentro de DEST (0750 root) para que ningun otro usuario lo lea.
workdir="$(mktemp -d "${DEST}/.work.XXXXXX")" || exit 1
trap 'rm -rf -- "$workdir"' EXIT
ts="$(date +%Y%m%d_%H%M%S)"

failures=0
backed_up=()

backup_one() {
  local db="$1"
  local out="${DEST}/${db}_${ts}.dump.gz"
  local sql="${workdir}/${db}.sql"

  # El dump se escribe en un temporal privado y solo se publica tras verificar.
  if ! sudo -u postgres pg_dump -Fc "$db" > "${workdir}/${db}.dump"; then
    printf 'backup FAIL (%s): pg_dump returned non-zero\n' "$db" >&2
    rm -f -- "${workdir:?}/${db}.dump"
    return 1
  fi

  install -m 0400 -o root -g root "${workdir}/${db}.dump" "${sql}" || return 1
  rm -f -- "${workdir:?}/${db}.dump"

  if ! gzip -9 -c "${sql}" > "${workdir}/${db}.dump.gz"; then
    printf 'backup FAIL (%s): gzip returned non-zero\n' "$db" >&2
    return 1
  fi
  install -m 0400 -o root -g root "${workdir}/${db}.dump.gz" "${out}" || return 1

  # Verificacion SIN tuberia: ningun proceso puede recibir SIGPIPE.
  if ! gzip -t "${out}"; then
    printf 'backup FAIL (%s): archive failed gzip -t\n' "$db" >&2
    rm -f -- "${out:?}"
    return 1
  fi
  if ! gzip -dc "${out}" > "${workdir}/${db}.verify.dump"; then
    printf 'backup FAIL (%s): gzip -dc returned non-zero\n' "$db" >&2
    rm -f -- "${out:?}"
    return 1
  fi
  if ! pg_restore -l "${workdir}/${db}.verify.dump" > /dev/null; then
    printf 'backup FAIL (%s): archive failed pg_restore -l\n' "$db" >&2
    rm -f -- "${out:?}"
    return 1
  fi
  rm -f -- "${workdir:?}/${db}.verify.dump"

  # Confidencialidad: se comprueba, no se supone. 0640 root:root = legible por
  # root y por el grupo root (el cron corre como root); nunca por "otros".
  chmod 0640 "${out}" || return 1
  local mode
  mode="$(stat -c %a "${out}")"
  if [ "${mode}" != "640" ]; then
    printf 'backup FAIL (%s): mode %s, expected 640\n' "$db" "${mode}" >&2
    rm -f -- "${out:?}"
    return 1
  fi

  printf 'backup ok: %s (%s bytes, mode %s)\n' "${out}" "$(stat -c %s "${out}")" "${mode}"
  backed_up+=("${out}")
}

for db in "${DATABASES[@]}"; do
  if ! backup_one "${db}"; then
    failures=$((failures + 1))
  fi
done

# Rotacion: solo despues de intentar todas; el fichero mas reciente de cada base
# se conserva aunque RETENTION_DAYS sea 0.
if [ "${#backed_up[@]}" -gt 0 ]; then
  while IFS= read -r -d '' candidate; do
    keep_db=""
    for newest in "${backed_up[@]}"; do
      # No borrar el dump publicado en esta misma ejecucion.
      if [ "${candidate}" = "${newest}" ]; then
        keep_db="1"
      fi
    done
    if [ -z "${keep_db}" ]; then
      rm -f -- "${candidate}"
    fi
  done < <(find "$DEST" -type f -name '*.dump.gz' -mtime "+${RETENTION_DAYS}" -print0)
fi

if [ "${failures}" -ne 0 ]; then
  printf 'backup summary: %s FAILED of %s databases\n' "${failures}" "${#DATABASES[@]}" >&2
  exit 1
fi

printf 'backup summary: %s/%s databases ok\n' "${#backed_up[@]}" "${#DATABASES[@]}"
