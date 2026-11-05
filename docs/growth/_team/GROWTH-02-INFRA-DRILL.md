# GROWTH-02 / WAVE C — PostgreSQL restore drill, rollback readiness, SMTP blocker evidence

| | |
|---|---|
| Task | `t9` — WAVE C: PostgreSQL restore drill, rollback readiness and SMTP blocker evidence |
| Team | `tecnoria-growth-02` |
| Author | `backend-lead` (attempt `bc6c7a8a-097c-40b1-befe-d07b9dbffeec`) |
| Date | 2026-11-05 02:06–02:12 CET (Europe/Madrid) |
| Model class | L2 — production infrastructure verification |
| Host | `contabo` (`vmi2962975`), PostgreSQL **16.15** (Ubuntu 16.15-0ubuntu0.24.04.1), shared host |
| Nature | Read-only on live data. **One** throwaway database created and dropped. No service restart, no nginx change, no firewall change, no write to the live database. |
| Repo writes | `docs/growth/_team/GROWTH-02-INFRA-DRILL.md` only |
| Verdict | **Restore drill: PASS** · **Rollback readiness: READY (procedure verified against live state)** · **SMTP: BLOCKED — external action required** · **Live data untouched: PROVEN** |

---

## 0. Verdict summary

| Area | Result | One-line evidence |
|---|---|---|
| Restore drill | **PASS** | `pg_restore` exit `0`, **zero** stderr, restored counts identical to live on all 7 tables, throwaway DB dropped, residue `0` |
| Dump identified | PASS (with a correction) | Latest tecnoria dump is **not** in `/var/www/backups`; it is `/var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz`, 18 711 bytes, 2026-11-05 01:14 |
| Listing vs restoring | Stated explicitly | `pg_restore -l` (173 entries) is **explicitly rejected as evidence** of restorability in §1.4 |
| Rollback procedure | READY | 4 complete previous releases on disk (verified), atomic symlink swap + single-service restart, API rollback in place via git+build |
| SMTP blocker | **BLOCKED** | `verify()` → `EAUTH` / `responseCode 534` / `command AUTH PLAIN` / `534-5.7.9 WebLoginRequired` |
| Live-DB untouched | PROVEN | `contact_messages` 17 → 17; `tecnoria-api` / `tecnoria-web` `ActiveEnterTimestamp` unchanged |
| Disk | Unchanged | 145 G / 65 G used / **80 G avail** / 45 % before **and** after |

---

## 1. A — Non-destructive PostgreSQL restore drill

### 1.1 Identifying the dump (and correcting the assumed path)

The task pointed at `/var/www/backups/`. **There is no tecnoria dump there.** That directory holds a
different project's dump:

```
$ ls -la /var/www/backups/
total 1532
drwxr-xr-x  2 root root    4096 Aug 25 20:12 .
drwxr-xr-x 27 root root    4096 Aug 29 23:43 ..
-rw-r--r--  1 root root 1558293 Aug 25 20:12 content-ai-platform-20260825-201230.dump
```

The real tecnoria backups live where `infra/bin/backup-tecnoria-db.sh:4` puts them
(`DEST="${DEST:-/var/backups/tecnoria/postgres}"`):

```
$ ls -la /var/backups/tecnoria/postgres/
-rw-r-----  1 root root  18711 Nov  5 01:14 tecnoria_20261105_011458.dump.gz
-rw-r-----  1 root root 479320 Nov  5 01:14 tecnoria_chat_20261105_011458.dump.gz
```

**Latest production dump under test (exact identity):**

| Field | Value |
|---|---|
| Filename | `/var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz` |
| Size | **18 711 bytes** |
| Timestamp | **2026-11-05 01:14** (mode `0640 root:root`) |
| SHA-256 (before drill) | `9942aba92491db79a032cbf7972e83d3256e3a266f336493b8524910c66083aa` |
| SHA-256 (after drill) | `9942aba92491db79a032cbf7972e83d3256e3a266f336493b8524910c66083aa` (identical) |

It is the **only** generation that exists: the daily cron (`/etc/cron.d/tecnoria-db-backup`,
`30 3 * * *`) has not fired yet, and `/var/log/tecnoria-db-backup.log` does not exist. This matters for
interpretation: the drill proves *this* dump restores; it cannot prove that*backups* are current or that a
second generation exists (§1.10).

### 1.2 Format (from the script, not guessed)

`infra/bin/backup-tecnoria-db.sh:13` is `sudo -u postgres pg_dump -Fc "$db" | gzip -9 > "$out"` — a
**custom-format** archive, gzip-compressed. Confirmed on the artifact itself:

```
$ gzip -dc "$DUMP" | head -c 5 | od -c
0000000   P   G   D   M   P
0000005
```

`PGDMP` is the custom-format magic. Restoring therefore requires `pg_restore` (not `psql`), which is what
§1.5 does.

### 1.3 Environment recorded before the drill

```
$ df -h /var/www /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       145G   65G   80G  45% /

$ sudo -u postgres psql -At -c "select version()"
PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 64-bit

$ systemctl show -p ActiveEnterTimestamp --value tecnoria-api   → Thu 2026-11-05 01:29:51 CET
$ systemctl show -p ActiveEnterTimestamp --value tecnoria-web   → Thu 2026-11-05 01:22:22 CET

$ sudo -u postgres psql -d tecnoria -At -F'|' -c "<union of 7 counts>"
clients|1
contact_messages|17
contracts|0
invoices|1
projects|0
tickets|0
users|7
```

### 1.4 What `pg_restore -l` proves — and what it does **not** prove

```
$ gzip -dc "$DUMP" | pg_restore -l | grep -c .
173
$ gzip -dc "$DUMP" | pg_restore -l | grep -c 'TABLE DATA'
20
$ gzip -dc "$DUMP" | pg_restore -l | tail -n 4
3623; 2606 18678 FK CONSTRAINT public tickets tickets_assigned_to_fkey tecnoria_api
3624; 2606 18668 FK CONSTRAINT public tickets tickets_client_id_fkey tecnoria_api
3625; 2606 18673 FK CONSTRAINT public tickets tickets_project_id_fkey tecnoria_api
3602; 2606 18709 FK CONSTRAINT public users users_client_id_fkey tecnoria_api
```

**A table-of-contents listing is not a restore test and is rejected as evidence here.** `pg_restore -l`
only reads the archive header/TOC: it proves the gzip stream is intact and the archive index parseable. It
executes no DDL, creates no relation, applies no `COPY`, and would succeed on a dump whose data pages are
truncated, whose roles are missing, or whose objects are in an order Postgres will refuse. The backup
script itself only does exactly this (`infra/bin/backup-tecnoria-db.sh:14-15`: `gzip -t` + `pg_restore -l`),
which is why the drill below was necessary — it is the first time this dump has actually been restored.

### 1.5 The drill (verbatim)

Throwaway database name (unique, timestamped): **`tecnoria_restore_drill_20261105_0208`**.
Full script in §5 so a second operator can reproduce it exactly.

```
=== CREATEDB ===
createdb_exit=0
=== PSQL_L_DURING ===
1                        # exactly one tecnoria_restore_drill_* database existed at that moment
=== RESTORE (single pass, --no-owner) ===
pg_restore_exit=0
stderr_stdout_bytes=0
--- restore output (last 20 lines) ---

--- restore output line count ---
0
```

Reading that verbatim: `pg_restore` returned **exit code 0**, and captured **0 bytes** of combined
stdout+stderr. That is not a trimmed log — there was nothing to trim: no warnings, no "already exists", no
ignored errors. The restore was a single pass into an empty database with `--no-owner --role=postgres`
(chosen because the dump was produced by the `postgres` superuser and the target is a disposable DB).

### 1.6 Content parity — live vs restored, side by side

```
                         LIVE        RESTORED
clients|1                    1               1
contact_messages|17         17              17
contracts|0                  0               0
invoices|1                   1               1
projects|0                   0               0
tickets|0                    0               0
users|7                      7               7
```

Printable form:

| Table | Live `tecnoria` | Restored copy | Match |
|---|---:|---:|---|
| `contact_messages` | 17 | 17 | ✅ |
| `users` | 7 | 7 | ✅ |
| `clients` | 1 | 1 | ✅ |
| `projects` | 0 | 0 | ✅ |
| `invoices` | 1 | 1 | ✅ |
| `contracts` | 0 | 0 | ✅ |
| `tickets` | 0 | 0 | ✅ |

Structural parity beyond counts:

```
=== RESTORED_SCHEMA_SAMPLE ===
9          # information_schema.columns count for contact_messages (9 columns, same as live)
2026-10-16 09:23:30.607981+02      # max(created_at) in the restored copy
                                   # live max(created_at) was 2026-10-16 09:23:30.607981+02 — identical to the microsecond
=== RESTORED_SEQUENCES_SAMPLE ===
2          # serial/identity sequences in public
```

So the dump restores a schema with the same shape, the same 17 lead rows, and the same newest-lead
timestamp. `users` (7), `clients` (1) and `invoices` (1) — the tables that carry authentication and
financial state — all match.

**Stated limitation (not hidden):** parity here is row *counts* + column set + newest timestamp, not a
row-level checksum. A stronger drill would also compare
`md5(string_agg(id::text, ',' ORDER BY id))` per table (and a digest of non-key columns) between live and
restored. That was not captured in this single permitted drill run, and creating a second throwaway
database was out of scope (`create and drop exactly ONE database`). It is recommended as the next
refinement in §1.10 rather than claimed as done.

### 1.7 Drop and residue proof

```
=== DROPDB ===
dropdb_exit=0
=== PSQL_L_AFTER (residue check) ===
tecnoria
tecnoria_api=CTc/tecnoria_api
tecnoria_chat
tecnoria_chat=CTc/tecnoria_chat
RESIDUE_COUNT=0
```

`psql -l` after the drill lists only the two tecnoria databases plus the unrelated
`content_ai_platform`, `electroria`, `postgres` and the templates. The `tecnoria_api=CTc/tecnoria_api` and
`tecnoria_chat=CTc/tecnoria_chat` lines are **not databases**: they are the `Access privileges` column of
`psql -l`, which psql prints as a continuation line under the owning row (verified with
`psql -l -At -F'|' | cat -A` — the row itself ends with `=Tc/tecnoria_api` and the next line carries the
role ACL). The residue count for `tecnoria_restore_drill` is `0`: **no residue remains.**

### 1.8 Proof the live database was never touched

Exact commands used (read-only):

```bash
# before
sudo -u postgres psql -d tecnoria -At -c "select count(*) from contact_messages"
systemctl show -p ActiveEnterTimestamp --value tecnoria-api
systemctl show -p ActiveEnterTimestamp --value tecnoria-web

# the only write in this whole task: create + drop the throwaway DB
sudo -u postgres createdb "$DB";  gzip -dc "$DUMP" | sudo -u postgres pg_restore -d "$DB" --no-owner --role=postgres;  sudo -u postgres dropdb "$DB"

# after
sudo -u postgres psql -d tecnoria -At -c "select count(*) from contact_messages"
systemctl show -p ActiveEnterTimestamp --value tecnoria-api
systemctl show -p ActiveEnterTimestamp --value tecnoria-web
```

| Marker | Before | After drill | After whole task (02:12) |
|---|---|---|---|
| `contact_messages` count (live) | 17 | 17 | **17** |
| `tecnoria-api` `ActiveEnterTimestamp` | Thu 2026-11-05 **01:29:51** CET | 01:29:51 | **01:29:51** |
| `tecnoria-web` `ActiveEnterTimestamp` | Thu 2026-11-05 **01:22:22** CET | 01:22:22 | **01:22:22** |
| `df -h /var/www` avail | 80 G (45 %) | 80 G (45 %) | **80 G (45 %)** |
| dump SHA-256 | `9942aba9…` | — | **`9942aba9…`** (unchanged) |
| `tecnoria_restore_drill_*` in `psql -l` | 0 | 1 (during) | **0** |
| `/etc/nginx/sites-available/tecnoria.conf` mtime | 2026-11-05 01:00:56 | — | **01:00:56** (untouched) |

`ActiveEnterTimestamp` is the timestamp of the last time the unit entered `active` — a restart would move
it. Both are byte-identical to the baseline captured before any action, so **no service was restarted**.
No `systemctl restart`, no `reload`, no `daemon-reload`, no firewall command, no nginx change, no
`pg_restore` into `tecnoria`, no `UPDATE`/`INSERT`/`DELETE` against the live database were issued.

### 1.9 What this drill does and does not certify

**Certified:** the newest production dump is a valid, complete, restorable custom-format archive; it
restores cleanly (§1.5) and its content matches production for the seven business tables (§1.6).

**Not certified (and not claimed):**

1. **Backup freshness / RPO.** Only one generation exists. `archive_mode=off`, `wal_level=replica`,
   `archive_command=(disabled)` — there is **no PITR**. Worst-case data loss window is up to 24 h, bounded
   by the daily cron at 03:30 (which has not yet run once).
2. **Durability of the backup itself.** The dump lives on the same filesystem as the database
   (`/var/backups` and `/var/lib/postgresql` are both on `/dev/sda1`). Server loss = total loss. No
   offsite copy, no encryption, no failure alerting (§1.10 items).
3. **Row-level content equality** — see the limitation in §1.6.
4. **Cross-version restores** — same cluster/version (16.15) only.

### 1.10 Residual risks and recommended follow-ups (outside this task's write scope)

1. Run the cron with a **failure alert** (the script only writes to a log that does not yet exist); a
   silent backup failure is indistinguishable from a backup that never ran.
2. Add an **offsite copy** (object storage) and encryption at rest — today a host loss loses every backup.
3. Extend this drill into the schema it should be: per-table row digests (§1.6), plus a
   `restore-drill` stage recorded as evidence once per quarter.
4. `RETENTION_DAYS=7` has never actually deleted anything yet (one generation); confirm after the first
   week that the 7-day window behaves as intended.
5. Consider `record_drill: pg_database_size` budget: 9 167 kB live → ≤ 50 MB per drill, i.e. 0.06 % of
   free space. Capacity was never the constraint; procedure was.

---

## 2. B — Rollback readiness procedure

### 2.1 Host map — what belongs to whom (do not cross the line)

This host serves several unrelated projects. Verified with
`systemctl list-units --type=service --state=running`:

| Owner | Units | Rule during a tecnoria rollback |
|---|---|---|
| **This project (tecnoriasl.com)** | `tecnoria-web.service`, `tecnoria-api.service` | **The only units a rollback may restart.** |
| This project, adjacent (chat widgets, separate DB `tecnoria_chat`) | `tecnoria-chat-api`, `tecnoria-chat-ingest`, `tecnoria-chat-portal`, `tecnoria-chat-widget` | Leave running. Not affected by a web/API rollback. |
| **Other projects — DO NOT TOUCH** | `content-ai-api`, `content-ai-studio`, `content-ai-worker-{automation,connection,discovery,image,publishing,scheduler,scraping,social,text}`, `electroria-api`, `electroria-web`, `guiatv-api`, `guiatv-ssr` | Never restart, never reload. |
| Shared infrastructure | `nginx` (serves **all** sites incl. static `talkaris.conf` / `embarcarte.com.conf`), `postgresql@16-main` (all databases), `docker`, `mongod`, `valkey`, `ssh`, `cron`, systemd-* | Never restart because of a tecnoria rollback. **No `nginx -s reload` is needed** for a web rollback (§2.4) and **never** restart PostgreSQL. |

Rule of thumb: the only two words a rollback operator needs are `tecnoria-web` and `tecnoria-api`. If a
command mentions `nginx`, `postgresql`, `docker`, `content-ai`, `electroria` or `guiatv`, stop — it is out of
scope for this rollback.

### 2.2 Identifying the active release (verified live)

```bash
readlink -f /var/www/webtecnoria/apps/web/releases/current
ls -1dt /var/www/webtecnoria/apps/web/releases/*/
cat /var/www/webtecnoria/apps/web/releases/current/release.json
```

Live output on 2026-11-05 02:09 CET:

```
$ ls -1dt /var/www/webtecnoria/apps/web/releases/*/
…/releases/20261105_012220/
…/releases/current/
…/releases/20261105_011656/
…/releases/20261105_011306/
…/releases/20261105_010433/
…/releases/20261105_010038/

$ ls -l …/releases/current
lrwxrwxrwx … current -> /var/www/webtecnoria/apps/web/releases/20261105_012220
$ readlink -f …/releases/current
/var/www/webtecnoria/apps/web/releases/20261105_012220

$ cat …/releases/current/release.json
{"app":"tecnoria-web","releasedAt":"2026-11-05T01:22:21+01:00","service":"tecnoria-web.service",
 "fingerprint":"6d5562e19f74b7d8fff2ca7df52672bf4d33419495bec32bf5d1b2c880df73fa"}
```

**The authoritative check is not the symlink — it is the running process.** `run-release-entry.sh:9,15`
resolves the symlink with `readlink -f` and then `exec /usr/bin/node "${entry_path}"`. That means the
process is **pinned to the concrete release directory**, not to `current`:

```
$ PID=$(systemctl show -p MainPID --value tecnoria-web); tr '\0' '\n' < /proc/$PID/cmdline
/usr/bin/node
/var/www/webtecnoria/apps/web/releases/20261105_012220/server/server.mjs
```

**Consequence:** swapping the `current` symlink does **nothing** to the running service until it is
restarted. A rollback that forgets the restart silently changes nothing while looking successful — and a
`release.json` read of `current` will then disagree with `/proc/<pid>/cmdline`, which is exactly the
signal to check.

### 2.3 Rollback targets available right now (all verified complete)

```
20261105_011656 browser=yes server/server.mjs=yes release.json=yes
20261105_011306 browser=yes server/server.mjs=yes release.json=yes
20261105_010433 browser=yes server/server.mjs=yes release.json=yes
20261105_010038 browser=yes server/server.mjs=yes release.json=yes
```

Four usable targets, 11 MB each. `publish-frontend-release.sh:23,210-225` keeps `KEEP_RELEASES=5` and
**never deletes the release `current` points at**, so the immediately preceding release survives any
normal deploy. Previous fingerprint: `96dd1d3fd10bc9c331138ed95a7ac12f3da375ca3afaa62579264597f3805e10`
(release `20261105_011656`, `releasedAt 2026-11-05T01:16:57+01:00`).

### 2.4 Web rollback — operator procedure

Work as `root` on `contabo`. Replace `TARGET` with the release id chosen from §2.2 (e.g.
`20261105_011656`). Every step is checkable; stop on the first mismatch.

```bash
R=/var/www/webtecnoria/apps/web/releases

# 1) Record the current state (so you can roll forward again if needed)
readlink -f "$R/current"           # -> R_CURRENT
cat "$R/current/release.json"
systemctl show -p MainPID --value tecnoria-web
tr '\0' '\n' < /proc/$(systemctl show -p MainPID --value tecnoria-web)/cmdline | tail -1

# 2) Choose and validate the target BEFORE touching anything
TARGET=20261105_011656
[ -d "$R/$TARGET/browser" ] || { echo "missing browser/"; exit 1; }
[ -f "$R/$TARGET/server/server.mjs" ] || { echo "missing server entry"; exit 1; }
[ -f "$R/$TARGET/release.json" ] || { echo "missing release.json"; exit 1; }
cat "$R/$TARGET/release.json"      # confirm it is the release you intend

# 3) Atomic symlink swap (same mechanism the deploy uses: publish-frontend-release.sh:65-76)
ln -sfn "$R/$TARGET" "$R/.current_tmp"
mv -Tf "$R/.current_tmp" "$R/current"
readlink -f "$R/current"           # must now print "$R/$TARGET"

# 4) Restart ONLY the web unit
systemctl restart tecnoria-web

# 5) Verify — all three must pass
systemctl is-active tecnoria-web                                  # active
sleep 2
tr '\0' '\n' < /proc/$(systemctl show -p MainPID --value tecnoria-web)/cmdline | tail -1
#   must print $R/$TARGET/server/server.mjs
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4300/  # 200
curl -s -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/ # 200 (public path intact)
```

Notes that matter operationally:

- **No nginx action.** nginx proxies `location /` to `127.0.0.1:4300` (`infra/nginx/tecnoria.conf:90-92`);
  it does not know about releases. `infra/bin/deploy-tecnoria-web.sh` sets no `NGINX_CACHE_DIR`, so the
  deploy itself never reloads nginx — a rollback must not either (reloading nginx touches every other
  site on this host).
- **Do not use the publish script to roll back.** It rebuilds from source; a rollback must reuse the
  already-built release directory.
- If `readlink -f "$R/current"` and the PID cmdline disagree *after* step 5, the restart did not take:
  check `systemctl status tecnoria-web` / `journalctl -u tecnoria-web -n 50`.
- Roll-forward is the same procedure with `TARGET` set to the newer release id — releases are immutable
  directories, so nothing is lost by rolling back.

### 2.5 API rollback — in place, build required

`tecnoria-api.service:12` runs `/usr/bin/node /var/www/webtecnoria/apps/api/dist/index.js` from the
**single shared checkout** `/var/www/webtecnoria` (branch `master`, clean at the time of this audit,
`HEAD 6b86ab0`, 2026-11-05 01:29:30). `dist/` is **git-ignored** (`.gitignore:66 apps/api/dist/`,
`git ls-files apps/api/dist` → 0 files), so a checkout alone changes nothing that runs: the build step is
mandatory.

```bash
cd /var/www/webtecnoria

# 1) Record current state
git rev-parse HEAD; git status --short          # must be clean before you start
systemctl show -p MainPID --value tecnoria-api
tr '\0' '\n' < /proc/$(systemctl show -p MainPID --value tecnoria-api)/cmdline | tail -1   # …/apps/api/dist/index.js

# 2) Move the checkout to the commit you want to run
TARGET=6b86ab0                                  # short or full sha, or a tag
git fetch --all --tags
git checkout "$TARGET"                          # dist/ is untracked → this does NOT change what runs
git log -1 --format='%h %ci %s'

# 3) Rebuild the API (this is what actually changes the running artifact)
npm ci --workspaces --include-workspace-root    # only if node_modules is missing/dirty
npm run -w apps/api build
ls -l apps/api/dist/index.js                    # mtime must be now

# 4) Restart ONLY the API unit
systemctl restart tecnoria-api

# 5) Verify
systemctl is-active tecnoria-api                                    # active
curl -s http://127.0.0.1:3001/health                                # {"ok":true,...}
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  http://127.0.0.1:3001/api/v1/contact -H 'content-type: application/json' -d '{}'   # 400, not 500
curl -s -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/api/v1/feature-flags  # 200
journalctl -u tecnoria-api -n 30 --no-pager | grep -iE 'error|missing|invalid' || true
```

Why step 5 posts an **invalid** contact payload: a `400 INVALID_INPUT` proves the route, zod and the
process are alive without writing a lead row (a valid POST would insert into `contact_messages`, which a
verification step must not do). A `500` or a hang means the DB path or the process is broken — see the
`GROWTH-02-LEAD-DISCOVERY.md` findings on missing `try/catch` and error middleware.

Caveats for the API rollback:

- **The checkout is shared**: `apps/web/**` and `apps/api/**` live in one tree, so `git checkout <old>`
  also reverts web *source*. The web does not run from source (it runs from `releases/…`), so this is
  harmless for the live site — but it will surprise the next `git pull`. Note it in the change ticket.
- A rollback to a commit older than the current `dist` requires the build (§2.5 step 3); without it you
  restart the *same* old-or-new binary and see no change.
- If the previous `dist` must be restored without rebuilding, restore it from a copy taken **before** the
  rollback (`cp -a apps/api/dist /root/rollback-dist-$(date +%s)`); nothing in the repo tracks it.

### 2.6 Migrations: why a rollback needs no down-migration

`apps/api/src/scripts/migrate.ts` has **no migrations ledger**: it reads every `*.sql` in
`apps/api/migrations/`, sorts them (`:11-13`) and executes each one on **every** run (`:15-21`). There is
no `schema_migrations` table and no "already applied" check. Idempotency is therefore **structural, by
construct**, and it is what makes both `npm run migrate:api` and a code rollback safe:

| Migration | Idempotency guard (evidence) |
|---|---|
| `001_init.sql` | `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` (:1), `CREATE TABLE IF NOT EXISTS` (:3,12,25,37), `CREATE INDEX IF NOT EXISTS` (:46-48) |
| `002_auth_upgrade.sql` | `ADD COLUMN IF NOT EXISTS` (:5-7), `CREATE UNIQUE INDEX IF NOT EXISTS` (:9), `CREATE TABLE IF NOT EXISTS` (:13,25); `ALTER COLUMN … DROP NOT NULL` (:1-2) is naturally repeatable |
| `002_blog_workflow.sql` | `ADD COLUMN IF NOT EXISTS` (:2,5,8,11), constraint added inside a `DO $$ … IF NOT EXISTS (pg_constraint) …` guard (:13-24), `CREATE INDEX IF NOT EXISTS` (:32) |
| `003/004/005/006` | all `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`, constraints in `DO $$` guards (`003:106`, `004:81`, `005:90`) |
| `007_users_upgrade.sql` | `ADD COLUMN IF NOT EXISTS` (:4-6), `DROP CONSTRAINT IF EXISTS` then `ADD CONSTRAINT` (:9-11), `DROP TRIGGER IF EXISTS` then `CREATE TRIGGER` (:13-15) |
| `008_portal.sql` | `CREATE EXTENSION IF NOT EXISTS pgcrypto` (:6), `CREATE TABLE/INDEX IF NOT EXISTS` (:8,19-20) |

Consequences, stated precisely:

1. A rollback of the **code** does not require a `down` migration: every migration so far is additive
   (new tables, new nullable columns, new indexes, widened CHECK). Older code simply ignores columns it
   does not know about.
2. Re-running `npm run migrate:api` on an already-migrated database is a no-op by construction (the
   guards above), which is why the last deploy could re-run it safely.
3. **This guarantee is a property of the migrations written so far, not of the system.** The moment a
   migration drops/renames a column or narrows a CHECK, a code rollback becomes unsafe without a
   corresponding down-migration. Recommendation (outside this task's write scope): add a
   `schema_migrations` ledger, and treat destructive DDL as a separate, twice-reviewed operation.
4. Nothing in the schema is versioned against the running code, so there is **no automatic detection** of
   "the code is older than the schema". Verification after a rollback (§2.5 step 5) is the only check.

### 2.7 Rollback verification checklist (one block, copy-paste)

```bash
# web
systemctl is-active tecnoria-web
readlink -f /var/www/webtecnoria/apps/web/releases/current
tr '\0' '\n' < /proc/$(systemctl show -p MainPID --value tecnoria-web)/cmdline | tail -1
curl -s -o /dev/null -w 'local=%{http_code}\n' http://127.0.0.1:4300/
curl -s -o /dev/null -w 'public=%{http_code}\n' https://tecnoriasl.com/

# api
systemctl is-active tecnoria-api
curl -s http://127.0.0.1:3001/health
curl -s -o /dev/null -w 'api_local=%{http_code}\n' https://tecnoriasl.com/api/v1/feature-flags
journalctl -u tecnoria-web -u tecnoria-api --since '-5min' --no-pager | grep -iE 'error|exception|EADDR' || true

# data sanity (read-only)
sudo -u postgres psql -d tecnoria -At -c "select count(*) from contact_messages"
sudo -u postgres psql -d tecnoria -At -c "select count(*) from users"

# nothing else moved
systemctl show -p ActiveEnterTimestamp --value nginx
systemctl show -p ActiveEnterTimestamp --value postgresql@16-main
```

Expected: `active` / release path == target / `active` + `{"ok":true}` / `200` / `200` / counts unchanged /
`nginx` and `postgresql` timestamps **unchanged**.

### 2.8 RTO estimate

Web rollback: symlink swap + `systemctl restart tecnoria-web` + ~2 s startup ≈ **under 30 s** of user-facing
outage (one process restart, no build). API rollback: `git checkout` + `npm run build` (~20–60 s) + restart
≈ **1–2 min**, build included. No database restore is involved in either.

---

## 3. C — SMTP blocker evidence (re-proven)

### 3.1 Method (no file created, no credential printed)

Same technique as the WAVE A discovery, re-run independently for this task: a Node program **piped over SSH
stdin** (`ssh contabo 'node --input-type=module -'`, run as `root`, nothing written to disk anywhere). It
parses `/etc/tecnoria/api.env` **in-process** (so no value can reach a shell trace, `ps` or history),
resolves `nodemailer` through the deployed package (`createRequire("/var/www/webtecnoria/apps/api/package.json")`),
constructs the transport **exactly as `apps/api/src/services/email.ts:18-26` does**, and calls
`transporter.verify()` — an `EHLO` + `AUTH` + `NOOP` handshake that sends **no message**. The output is
scrubbed of the host, user and password strings, and every e-mail address is replaced by `<email-redacted>`
before printing.

### 3.2 Verbatim result

```
PROBE_AT=2026-11-05T01:07:54.464Z
TRANSPORT={"host":"smtp.gmail.com","port":587,"secure":false,"authUserDomain":"tecnoriasl.com",
"authUserEqualsFrom":true,"fromDomain":"tecnoriasl.com","adminDomain":"tecnoriasl.com",
"authPassLengthBucket":"<=16"}
NODEMAILER_VERSION=7.0.13
VERIFY_RESULT=FAILED
error_name=Error
error_code=EAUTH
error_responseCode=534
error_command=AUTH PLAIN
error_message=Invalid login: 534-5.7.9 Please log in with your web browser and then try again. For more
534-5.7.9 information, go to 534 5.7.9 https://support.google.com/mail/?p=WebLoginRequired
<transaction-id-redacted> - gsmtp
error_response=534-5.7.9 Please log in with your web browser and then try again. …
VERIFIED_BOOLEAN=false
```

Nothing above is a credential: the host is a public MX name, the port/`secure` flag are config, and only
the *domain* of the user/from/admin addresses is shown. The single diagnostic hint deliberately retained is
`authPassLengthBucket:"<=16"` — the stored secret is at most 16 characters, which is the exact length of a
Google **app password**; the value itself is never read into the report.

### 3.3 Error class and code (exact)

| Field | Value |
|---|---|
| Class | `EAUTH` (nodemailer authentication failure) |
| `responseCode` | `534` |
| SMTP command that failed | `AUTH PLAIN` |
| Server text | `534-5.7.9 Please log in with your web browser and then try again … https://support.google.com/mail/?p=WebLoginRequired` |
| `verify()` return | `false` (threw) |
| Transport | `smtp.gmail.com:587`, `secure:false` (STARTTLS), `auth.user` in domain `tecnoriasl.com`, `auth.user === SMTP_FROM` |

`5.7.9 WebLoginRequired` is Google refusing the **credential**, not the connection: TCP and TLS to port 587
both succeeded (otherwise the code would have been `ETIMEDOUT`/`ESOCKET`/`ETLS`), and the failure happened
during `AUTH PLAIN`. `534` is a permanent authentication failure, not a transient one — retrying does not
help, and a retry loop would only lock the account further.

### 3.4 Why no code change can fix it

- The transport construction matches production code line for line (`email.ts:18-26`): same host, port,
  `secure: port === 465` (false for 587), same `auth` shape. There is no misconfiguration to correct in the
  repo — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_NOTIFICATION_EMAIL` are all
  present and parse against `env.ts:13-18` (otherwise the API would refuse to boot; it is running).
- The rejection happens **before any message is composed**, inside `AUTH`. Code cannot make Google accept a
  credential it is refusing; only a different credential (or a different provider) can.
- Retry/backoff, outbox queues, HTML templates, subject encoding — none of it changes an `EAUTH`.

### 3.5 Exact external action required

Owner action, outside the repository, in this order of preference:

1. **Gmail app password (cheapest, keeps the current transport).** The account owner must sign in to the
   Google account for that mailbox, enable **2-Step Verification** (app passwords are unavailable without
   it), then create an app password (Google Account → Security → App passwords → "Mail"), and replace
   `SMTP_PASS` in `/etc/tecnoria/api.env` with the 16-character value. Then `systemctl restart
   tecnoria-api` is **not** even required — the process reads env at start, so it is: update the file,
   restart `tecnoria-api` (a scheduled, approved action), re-run `verify()`.
   Also check: the account must not have the password changed/recovered since the app password was issued,
   which invalidates it (a frequent cause of exactly this `534`).
2. **Transactional provider (recommended for lead notifications).** Move to a provider with API keys and
   proper deliverability (Postmark/SES/Mailgun/Brevo), and configure **SPF + DKIM + DMARC** for
   `tecnoriasl.com`. The current setup sends *as* `@tecnoriasl.com` through Gmail's SMTP
   (`authUserEqualsFrom:true`), which no repository change can make deliverable at scale.

Until one of those happens, **every** e-mail from this API fails: `auth.ts:144,158` (access request, which
therefore returns `502` after inserting the row — `auth.ts:172-184`) and `auth.ts:209` (password recovery,
which answers `202` regardless, so the failure is invisible).

### 3.6 Fallback verification actually available (and what it is not)

**Production has no mail sink.** Verified on the host:

```
$ systemctl list-unit-files "*mailpit*" --no-legend          → (no rows)
$ docker ps | grep -i "mailpit\|smtp"                        → none
$ ss -lntp | grep -E ":(1025|8025) "                         → no mailpit ports listening
```

Mailpit exists only as a **development** service: `infra/docker-compose.dev.yml:18-27`
(`axllent/mailpit:v1.27`, ports `1025`/`8025`) and `docs/DEPLOYMENT_SSR.md:25`
(`Mailpit SMTP en 127.0.0.1:1025`, UI `http://127.0.0.1:8025`). It is started by
`npm run dev:deps:up` (`package.json:13`) on a developer machine, not on this server.

Therefore, precisely:

- This drill proves the **production SMTP credential is rejected**. It does **not** and cannot prove
  production e-mail delivery.
- The lead-notification path must be verified against the **local Mailpit sink** in the implementation work
  (the B2/V2 notification tasks), asserting: one message enqueued per lead, correct recipient
  (`ADMIN_NOTIFICATION_EMAIL`), the lead's fields present, and no message on a failed insert. That is a
  code-path proof, independent of Gmail.
- Production readiness for notifications stays **BLOCKED** until §3.5 is done; the Mailpit proof must not be
  presented as production delivery evidence.

---

## 4. Consolidated no-touch evidence

Commands that produced the numbers in §1.8, all read-only:

```bash
sudo -u postgres psql -d tecnoria -At -c "select count(*) from contact_messages"
sudo -u postgres psql -l -At -F'|' | cut -d'|' -f1 | grep -c 'tecnoria_restore_drill'
df -h /var/www
sha256sum /var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz
systemctl show -p ActiveEnterTimestamp --value tecnoria-api
systemctl show -p ActiveEnterTimestamp --value tecnoria-web
ls -l --time-style=full-iso /etc/nginx/sites-available/tecnoria.conf
systemctl list-units --type=service --state=running
```

Writes performed during the entire task: **`createdb tecnoria_restore_drill_20261105_0208`**,
**`pg_restore` into it**, **`dropdb tecnoria_restore_drill_20261105_0208`**. Nothing else, on any host.

Repository state at the end of the task (teammates' WAVE B/C edits were in flight in the same checkout and
are **not** mine):

```
$ git status --short
 M apps/web/src/app/app.component.html
 M apps/web/src/app/app.component.ts
 M apps/web/src/app/app.routes.ts
 M apps/web/src/app/site/components/contact-form.component.html
 M apps/web/src/app/site/components/contact-form.component.ts
 M apps/web/src/app/site/components/site-footer.component.ts
 M apps/web/src/app/site/content/site-content.ts
 M apps/web/src/app/site/seo-route-manifest.ts
 M apps/web/src/index.html
 M apps/web/src/sitemap.xml
 M package.json
?? .serena/
?? apps/web/src/app/site/components/consent-banner.component.ts
?? apps/web/src/app/site/pages/cookies-page.component.ts
?? apps/web/src/app/site/services/analytics-events.ts
?? apps/web/src/app/site/services/analytics.service.ts
?? apps/web/src/app/site/services/consent-state.ts
?? apps/web/src/app/site/services/consent.service.ts
?? docs/growth/GROWTH-02-SPEC.md
?? docs/growth/GROWTH-02-TASKS.md
?? docs/growth/_team/GROWTH-02-CONSENT-DISCOVERY.md
?? docs/growth/_team/GROWTH-02-LEAD-DISCOVERY.md
?? docs/growth/_team/gsc-baseline.json
?? scripts/gsc-query.mjs
?? scripts/tests/
?? specs/002-measurement-consent-lead-reliability/
```

`docs/growth/_team/GROWTH-02-INFRA-DRILL.md` (this file) is the only path written by this task; every other
line above belongs to concurrently running teammates (web consent/analytics implementation and planning
documents) and was neither created, edited nor relied upon here.

---

## 5. Appendix — the exact drill script (reproducible)

Piped over SSH stdin as `bash -s`; creates and drops exactly one database; writes no file on the server.

```bash
set -u
TS=20261105_0208
DB="tecnoria_restore_drill_${TS}"
DUMP=/var/backups/tecnoria/postgres/tecnoria_20261105_011458.dump.gz
echo "=== DRILL_ID ==="; echo "$TS $DB"
echo "=== DUMP_FORMAT_MAGIC ==="; gzip -dc "$DUMP" | head -c 5 | od -c | head -2
echo "=== DUMP_SHA256_BEFORE ==="; sha256sum "$DUMP"
echo "=== TOC_LISTING_ONLY (NOT a restore) ==="
echo "TOC_ENTRIES=$(gzip -dc "$DUMP" | pg_restore -l | grep -c . )"
echo "TOC_TABLE_DATA_ENTRIES=$(gzip -dc "$DUMP" | pg_restore -l | grep -c 'TABLE DATA')"
echo "=== LIVE_COUNTS_BEFORE ==="
sudo -u postgres psql -d tecnoria -At -F'|' -c "select 'contact_messages', count(*) from contact_messages union all
  select 'users', count(*) from users union all select 'clients', count(*) from clients union all
  select 'projects', count(*) from projects union all select 'invoices', count(*) from invoices union all
  select 'contracts', count(*) from contracts union all select 'tickets', count(*) from tickets order by 1"
echo "=== CREATEDB ==="
sudo -u postgres createdb "$DB"; echo "createdb_exit=$?"
echo "=== RESTORE (single pass, --no-owner) ==="
set +e
OUT=$(gzip -dc "$DUMP" | sudo -u postgres pg_restore -d "$DB" --no-owner --role=postgres 2>&1)
RC=$?
set -e
echo "pg_restore_exit=$RC"
echo "stderr_stdout_bytes=${#OUT}"
printf '%s\n' "$OUT" | tail -n 20
echo "=== RESTORED_COUNTS ==="   # same union query against "$DB"
echo "=== RESTORED_SCHEMA_SAMPLE ==="   # information_schema.columns count + max(created_at)
echo "=== RESTORED_SEQUENCES_SAMPLE ==="  # count of relkind='S' in public
echo "=== DROPDB ==="
sudo -u postgres dropdb "$DB"; echo "dropdb_exit=$?"
echo "=== PSQL_L_AFTER (residue check) ==="
sudo -u postgres psql -l -At -F'|' | cut -d'|' -f1 | grep "tecnoria" || true
echo "RESIDUE_COUNT=$(sudo -u postgres psql -l -At -F'|' | cut -d'|' -f1 | grep -c 'tecnoria_restore_drill' || true)"
echo "=== DF_AFTER ==="; df -h /var/www /
echo "=== SERVICE_TS_AFTER ==="
echo -n "tecnoria-api "; systemctl show -p ActiveEnterTimestamp --value tecnoria-api
echo -n "tecnoria-web "; systemctl show -p ActiveEnterTimestamp --value tecnoria-web
echo "=== DUMP_SHA256_AFTER ==="; sha256sum "$DUMP"
echo "=== LIVE_CONTACT_AFTER ==="; sudo -u postgres psql -d tecnoria -At -c "select count(*) from contact_messages"
```

To re-run this drill next quarter, change only `TS` (and the `DUMP` path if a newer generation exists) —
never the database name pattern, and never the target database.
