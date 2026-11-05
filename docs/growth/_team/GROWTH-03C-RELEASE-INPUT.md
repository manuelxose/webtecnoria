# GROWTH-03C — Release input: H-10 root cause and rollback readiness

Task `t1` · member `release-engineer` · attempt `fd1dc923-b6ed-4ab1-9c32-7dc566c54864`
Route (as assigned): `openrouter-minimax / minimax/minimax-m3.1-flash` (L2). Cost UNKNOWN (no provider usage sample).
Evidence date: 2026-11-05, host `contabo` (vmi2962975), server clock CET (UTC+01:00).

**Read-only discipline honoured.** Only HTTP `GET`, file reads, `systemctl show|is-active`, `cat`, `grep`, `find`, `sha256sum`, `cmp`, `stat`, `gzip -t`, `pg_restore -l`, `curl` and `gh api` were used.
Not done: no `systemctl start/stop/restart/reload`, no `git pull`, no deploy, no nginx reload, no cache purge, no write to `/var/www`, no change to `/var/www/bin/publish-frontend-release.sh`.

---

## 1. H-10 verdict

### Classification: **B — invalid smoke-test assumption (shell defect).** Not A, not C, not D, not E.

The application is healthy. The gate is broken.

* Every smoke request returned `200` with the **full 125,377-byte** home page.
* The expected text `TecnoRia` was **present 13 times** in that body (first at byte offset **243**).
* The failure is produced by the shell, at `publish-frontend-release.sh` **line 240**, under `set -euo pipefail` (**line 2**).

```bash
# /var/www/bin/publish-frontend-release.sh  (sha256 d0499d3edbcf59cc0a1e7a1933973e9562e1b5b1ac7a0bfc0351237cd8ab2cfd)
2:  set -euo pipefail
227: verify_expected_text() {
240:    if printf '%s' "${body}" | grep -Fq "${EXPECTED_TEXT}"; then
246:    echo "Expected text not found on ${PUBLIC_URL}: ${EXPECTED_TEXT}" >&2
247:    exit 1
```

Shell semantics, exactly:

1. `grep -q` exits **on the first match**. The match is at byte 243 of a 125,096-byte body, so `grep` exits while `printf` is still writing.
2. The write end of the pipe then receives `SIGPIPE` → `printf` dies with status **141** (128 + 13).
3. `pipefail` makes the **pipeline** status the rightmost non-zero status, i.e. **141**, even though `grep` itself returned 0.
4. `printf … | grep -Fq …` is the condition of an `if`, so `errexit` does not abort; the `else` branch is taken, the loop sleeps 3 s and retries.
5. After 5 attempts the function prints `Expected text not found on https://tecnoriasl.com/: TecnoRia` and `exit 1` → the Actions step goes red.

**Proof that `grep` succeeded and `printf` died** (the `if` condition's exit status is 141, and removing `pipefail` makes it 0):

```
===== D1: PIPESTATUS of the exact line-240 pipeline (3 samples) =====
sample=1 pipeline_rc=141 PIPESTATUS=(0,)
sample=2 pipeline_rc=141 PIPESTATUS=(0,)
sample=3 pipeline_rc=141 PIPESTATUS=(0,)
===== D4: the exact if-statement from line 240 =====
IF_RESULT=else_branch_taken rc=141
```

Note: the `PIPESTATUS=(0,)` rendering is an artefact of my own probe — the assignment `rc=$?` resets `PIPESTATUS` before it was printed. The decisive values are `pipeline_rc=141` and `IF_RESULT=else_branch_taken rc=141`.

### Reproduction — commands and real output

```bash
# run on contabo, read-only
body="$(curl -fsS --max-time 15 --retry 3 --retry-connrefused --retry-delay 1 \
        --resolve "tecnoriasl.com:443:127.0.0.1" -k "https://tecnoriasl.com/" || true)"
echo "BODY_BYTES=${#body}"
set -o pipefail; printf '%s' "$body" | grep -Fq "TecnoRia"; echo "rc=$?"
```

```
BODY_BYTES=125096
BODY_SHA256=e908b423ac84eb5bf61f79924c32b1345c4bf7a1c5efd4af26cc0f5b6afdf8a2
FIRST_MATCH_OFFSET=243
OCCURRENCES=13
WIRE_BYTES_NO_CAPTURE=125377
```

| experiment | N | rc = 0 | rc = 141 | other |
|---|---:|---:|---:|---:|
| **exact line-240 semantics** (`set -o pipefail`) | 50 | 0 | **50** | 0 |
| exact line-240 semantics | **200** | 0 | **200** | 0 |
| same pipeline **without** `pipefail` | 50 | **50** | 0 | 0 |
| same pipeline without `pipefail` | 100 | **100** | 0 | 0 |
| `grep -Fc` (counts, no early exit) **with** `pipefail` | 1 | **1** | 0 | 0 |
| `grep -Fq … <<< "$body"` (here-string, no pipe) | 1 | **1** | 0 | 0 |

```
===== D2: N=50 WITH pipefail (exact script semantics) =====
WITH_PIPEFAIL N=50 rc0=0 rc141=50 other=0
===== D3: N=50 WITHOUT pipefail (pipefail removed) =====
WITHOUT_PIPEFAIL N=50 rc0=50 rc141=0 other=0
===== K5: alternative fix - grep -c (no early exit) and here-string (no pipe) =====
grep_Fc_count=13
grep_Fc_count_with_pipefail:
  rc=0
bash herestring (temp-file backed, no pipe):
  rc=0
```

### The captain's hypothesis: CONFIRMED, with one correction that matters

**Confirmed:** mechanism, file, line 240, `set -euo pipefail` at line 2, `grep -q` early exit + `printf` SIGPIPE + `pipefail`, and the "not an application failure" conclusion.

**Refuted:** *"a smaller page under 64 KiB would not trigger SIGPIPE"*. There is **no 64 KiB threshold**. The failure is a **race** between `grep` exiting and `printf` finishing its writes. Measured on the live origin bodies with the exact line-240 semantics, N = 200 each:

| consumer of the shared script | captured body bytes | first match offset | rc = 0 | rc = 141 | failure rate |
|---|---:|---:|---:|---:|---:|
| `tecnoria-web` | 125,096 | 243 | 0 | **200** | **100 %** |
| `electroria-web` | 247,575 | 290 | 0 | **200** | **100 %** |
| `auctorio-studio` | 63,996 | 109 | 115 | 85 | **42.5 %** |
| `talkaris-portal` | 57,091 | 100 | 162 | 38 | **19 %** |

`talkaris-portal` (57 KB, **below** 64 KiB) fails 19 % of the time and `auctorio-studio` (64 KB) fails 42.5 % of the time. A sub-64 KiB page is **not** safe.

### Why it is position- and size-dependent (same live body, N = 100 each)

```
PATTERN_AT_FIRST_20_BYTES   N=100 rc0=0   rc141=100 other=0
PATTERN_AT_MIDDLE_OFFSET_60000 N=100 rc0=4 rc141=96  other=0
PATTERN_AT_LAST_20_BYTES    N=100 rc0=100 rc141=0   other=0
```

If the match is at the very end, `grep` cannot exit until it has read everything, so `printf` finishes first and the pipeline returns 0. With the real match at byte 243, `grep` exits almost immediately.

Failure rate vs. body size (prefix of the live body, `TecnoRia` still at offset 243):

| size | N | failure rate |
|---:|---:|---:|
| 10,000 | 100 | 0 % |
| 60,000 | 100 | 19 % |
| 65,000 | 100 | 38 % |
| 70,000 | 100 | 54 % |
| 100,000 | 200 | 66 % |
| 110,000 | 200 | 67 % |
| 117,000 | 200 | 68 % |
| 117,727 | 200 | 72 % |
| 120,000 | 200 | 75 % |
| **125,096 (live)** | 200 | **100 %** |

There is no sharp cliff — the probability rises smoothly and reaches 100 % only at the current body size. (Pipe capacity was not measurable on this host; `getconf PIPE_BUF` returns nothing here. The Linux default pipe capacity of 65,536 bytes is platform documentation, **not** a value I measured.)

### The four Actions runs do NOT share one cause

| run | window (UTC / CET) | duration | real cause |
|---|---|---:|---|
| `41967316734` | 04:21:43–04:21:45Z / 06:21:43 CET | 2.4 s | **different cause (E).** The step ran `sudo bash -c 'set -euo pipefail; … /var/www/webtecnoria/infra/deploy-webtecnoria.sh'`; sudoers only allows the bare path, so it failed before touching the server: `sudo: a terminal is required to read the password` → `Process exited with status 1`. It never reached the smoke gate. Already fixed by commit `273fc3f`, which uses the bare permitted path. |
| `41968001174` | 04:28:18–04:29:13Z / 06:28:18 CET | 55 s | **H-10 (B).** Published release `20261105_052852`, restarted the service, then 5 failed smoke attempts (05:28:57–05:29:10 CET) → `Expected text not found on https://tecnoriasl.com/: TecnoRia` → exit 1. |
| `41968459303` | 04:32:46–04:33:37Z / 06:32:46 CET | 52 s | **H-10 (B).** Build identical → `staging build is identical to current release, skipping new release publish` + `skipping restart`; 5 failed smoke attempts (05:33:21–05:33:34 CET) → exit 1. |
| `41969593283` | 04:43:52–04:44:45Z / 06:43:52 CET | 53 s | **H-10 (B).** Same shape; 5 failed smoke attempts (05:44:29–05:44:42 CET) → exit 1. |

**The captain's premise is wrong on one point and right on another.**

* Wrong: run `41968001174` did **not** pass the assertion at 05:28–05:29 CET. It **failed** it at 05:29:13 CET. The "pass" at that time was the *deploy* half: the release was published and the service restarted successfully, and the site served `200` with the expected text. The 05:44 failure belongs to run `41969593283` (05:44:45 CET).
* Right: the assertion **did** pass at 01:22–01:30 CET — five runs reached `==> tecnoria-web: release published`:

```
41940740641  00:22:20.446Z  publishing release          00:22:32.473Z  release published
41941195359  00:25:58.354Z  skipping new release publish 00:26:02.504Z  release published
41941382024  00:27:29.040Z  skipping new release publish 00:27:29.660Z  release published
41941402601  00:28:11.293Z  skipping new release publish 00:28:12.302Z  release published
41941711947  00:30:16.963Z  skipping new release publish 00:30:18.489Z  release published
```

### Is the failure timing-dependent? **Yes — and this is the answer to the earlier passes.**

* The defect was **already present** in the passing runs. `git show 3c7cdb9:infra/bin/publish-frontend-release.sh` (the commit published as `20261105_012220`) contains the **identical** `printf '%s' "${body}" | grep -Fq "${EXPECTED_TEXT}"` under the same `set -euo pipefail`.
* The match position was the same in both builds: `TecnoRia` sits at **offset 223** in the SSR shell of *both* `20261105_012220/server/index.server.html` and `20261105_052852/server/index.server.html` (it is the `<title>`), and at offset **243** in the rendered page of both.
* The **only** material difference is the body size: **117,727 bytes** then (nginx `$body_bytes_sent`, origin-direct) vs **125,377 bytes** now. The change came from `d54b4cf` (consent mode v2 + cookie UI + consent-gated `generate_lead`), which added `consent-banner.component.ts` (556 lines), `cookies-page.component.ts` (240 lines), `analytics.service.ts`, `consent.service.ts`, `consent-state.ts`, `analytics-events.ts`, `app.component.html` (5 lines) and `apps/web/src/index.html` (56 changed lines).

So the earlier passes are the **same race landing in the "pass" branch**. At the old size the measured pass probability is of the order of tens of percent per attempt (72 % failure at 117,727 bytes on the current body's prefix); at 125,096 bytes it is **0 %** (200/200). Five consecutive first-attempt passes are possible but statistically unusual, and the exact old body string can no longer be re-measured (the releases are SSR-only — no static `index.html` is retained on disk), so the old per-attempt probability is not directly measurable today. The honest statement is:

> The gate has been latently broken since the smoke assertion was introduced. The site's home page crossed from "usually passes" to "always fails" when it grew from 117,727 to 125,377 bytes. The application was never at fault.

It is **not** C (readiness race): every request returned `200` with the complete body and the expected text was present. It is **not** D (external/network/caching): the six smoke requests are logged by nginx as `127.0.0.1 … "GET / HTTP/2.0" 200 125377` and the origin body is byte-stable (3 consecutive fetches → identical size and SHA-256 `e908b423…`, `cmp` reports no difference).

### Correct minimal fix (assessed only — nothing was changed)

`verify_expected_text` line 240 — one of these, both measured `rc = 0`:

```bash
# FIX A (recommended — smallest possible diff: "-q" -> "-c", plus discard the count)
if printf '%s' "${body}" | grep -Fc "${EXPECTED_TEXT}" >/dev/null; then

# FIX B (equivalent — removes the pipe entirely; bash here-string)
if grep -Fq "${EXPECTED_TEXT}" <<< "${body}"; then
```

`grep -c` does not exit early, so it consumes the whole input and `printf` never receives `SIGPIPE`; its exit status is still 0 **iff** there is at least one match, so the assertion semantics are unchanged. The fix can only remove false negatives; it cannot introduce a false positive.

**Do not**: remove `pipefail` globally (it protects other checks); change `EXPECTED_TEXT` (the text *is* present — 13 occurrences); add `|| true` (that would delete the assertion); shorten the retry loop (it is the right defence for a real readiness race).

### Blast radius on the other projects that share the script

* Executed copy: `/var/www/bin/publish-frontend-release.sh` (sha256 `d0499d3e…`, 8,657 B, mtime 2026-11-05 01:18:05 CET). The repo checkout copy `/var/www/webtecnoria/infra/bin/publish-frontend-release.sh` is **byte-identical** (same sha256).
* Actual consumers — `grep -rn 'publish-frontend-release' /var/www` — **4 apps at 6 call sites**:

| consumer | `PUBLIC_URL` / `EXPECTED_TEXT` | measured exposure |
|---|---|---|
| `tecnoria-web` | `https://tecnoriasl.com/` / `TecnoRia` | **100 %** failure (200/200) — blocked today |
| `electroria-web` | `https://electroria.com/` / `Instalaciones eléctricas profesionales en Galicia` | **100 %** failure (200/200) — same latent defect, body 247,575 B |
| `talkaris-portal` | `https://talkaris.com/` / `Talkaris` | 19 % (38/200) — flaky |
| `auctorio-studio` | `https://auctorio.com/` / `AI content operations platform` | 42.5 % (85/200) — flaky |

* **Correction to the captain's list:** `guiatv` and `embarcarte` do **not** use this script (verified: no reference in their deploy scripts; they have their own `/etc/cron.d/guiatv` and `/etc/cron.d/embarcarte` entries). The shared consumers are **tecnoria-web, electroria-web, talkaris-portal and auctorio-studio**.
* The edit is inside a function shared by all four, so it changes the smoke outcome for all four identically — a strict improvement for each, but it **is** shared-infrastructure surgery and must be coordinated with the other three owners. It cannot be scoped to tecnoria: there is no environment knob that swaps the implementation, and setting `EXPECTED_TEXT=""` would silently delete the assertion for tecnoria (line 230–232 returns 0 immediately).
* **Propagation warning:** the deploy pipeline does **not** install `infra/bin/*` into `/var/www/bin`. `/var/www/webtecnoria/infra/deploy-webtecnoria.sh` only calls `/var/www/bin/deploy-tecnoria-web.sh` (line 69) and contains no copy/install step. Therefore the fix must be (1) committed in `infra/bin/publish-frontend-release.sh` **and** (2) installed into `/var/www/bin/publish-frontend-release.sh` as a separate, coordinated operation, after which both copies must hash equal again.

---

## 2. Release and rollback readiness

### Current active release

```
/var/www/webtecnoria/apps/web/releases/current -> /var/www/webtecnoria/apps/web/releases/20261105_052852
```

`release.json`:

```json
{"app":"tecnoria-web","releasedAt":"2026-11-05T05:28:53+01:00","service":"tecnoria-web.service","fingerprint":"25fd5e80281dd50b569ed023c5b7c7500ac828951c751e22498134637d087c61"}
```

### Releases, newest first (fingerprints recomputed with the script's own `release_fingerprint` algorithm)

| # | release id | releasedAt (CET) | fingerprint (`release.json` = recomputed) | status |
|---|---|---|---|---|
| 1 | `20261105_052852` | 2026-11-05 05:28:53 | `25fd5e80281dd50b569ed023c5b7c7500ac828951c751e22498134637d087c61` | **CURRENT** |
| 2 | `20261105_012220` | 2026-11-05 01:22:21 | `6d5562e19f74b7d8fff2ca7df52672bf4d33419495bec32bf5d1b2c880df73fa` | **rollback target** |
| 3 | `20261105_011656` | 2026-11-05 01:16:57 | `96dd1d3fd10bc9c331138ed95a7ac12f3da375ca3afaa62579264597f3805e10` | retained |
| 4 | `20261105_011306` | 2026-11-05 01:13:07 | `cd339ef2b68d9ed96c3412bf811b8e84c5ee16815ff8505c8769b589834f6dec` | retained |
| 5 | `20261105_010433` | 2026-11-05 01:04:34 | `f24f44554f774128a8c007525a610991c2348352bbe6aa432e2018d21615206e` | retained |
| 6 | `20261105_010038` | 2026-11-05 01:00:39 | `4609fbc84e3be4638e23f71fb4eeca255b65e7952b39ea59c72a2a365bf44b4d` | retained |

All six recomputed fingerprints **MATCH** their stored value → the release material on disk is intact and hash-verifiable.

**Retention risk:** `KEEP_RELEASES=5` (line 23) and `cleanup_old_releases` (line 210) deletes everything older than the five newest, skipping the current one. `20261105_012220` therefore survives only about **four more publishes**; after that it is deleted and the cheap in-place rollback disappears (the fingerprint above is the rebuild recipe).

### Does a release retain server + browser + prerendered routes?

| release | `browser/` files | `server/` files | `server/server.mjs` | `server/index.server.html` | `prerendered-routes.json` |
|---|---:|---:|---|---|---|
| `20261105_052852` (current) | 108 | 95 | yes (886,500 B) | yes | `{"routes": {}}` |
| `20261105_012220` | 107 | 93 | yes | yes | `{"routes": {}}` |
| `20261105_011656` | 107 | 93 | yes | yes | `{"routes": {}}` |
| `20261105_011306` | 107 | 93 | yes | yes | `{"routes": {}}` |
| `20261105_010433` | 107 | 93 | yes | yes | `{"routes": {}}` |
| `20261105_010038` | 107 | 93 | yes | yes | `{"routes": {}}` |

**Answer:** `browser/` (7.2 MB) and `server/` (3.6 MB) are fully retained in every release, so the SSR entry point survives a rollback. **Prerendered routes: there are none** — `prerendered-routes.json` is `{"routes": {}}` in every release and the Angular build prints `Prerendered 0 static routes.` The site is 100 % server-side rendered, so nothing prerendered can be lost by a rollback. **The web rollback is safe.**

### Service state (read-only)

```
tecnoria-web.service  active / running  MainPID=1190447  NRestarts=0
                      ExecMainStartTimestamp=Thu 2026-11-05 05:28:54 CET
                      WorkingDirectory=/var/www/webtecnoria/apps/web
                      FragmentPath=/etc/systemd/system/tecnoria-web.service
tecnoria-api.service  active / running  MainPID=1193861
                      ExecMainStartTimestamp=Thu 2026-11-05 05:44:11 CET
```

`/etc/systemd/system/tecnoria-web.service`:

```
ExecStart=/var/www/bin/run-release-entry.sh /var/www/webtecnoria/apps/web/releases/current/server/server.mjs
```

`/var/www/bin/run-release-entry.sh` resolves the symlink with `readlink -f "$1"` **at process start** and then `exec`s node on it. ⇒ **a rollback is exactly: repoint the `current` symlink + restart the service.** No rebuild, no npm install, no migration replay.

### DB backup state

* Script: `/var/www/webtecnoria/infra/bin/backup-tecnoria-db.sh` — 580 B, mode `-rwxr-xr-x`, mtime 2026-11-05 01:16:32 CET, sha256 `b89353623ca2d081f401c6f8fbeaa9cb8f5ddd07f2ad5d30c4a1b15486445fbe`. Backs up `tecnoria` and `tecnoria_chat` with `pg_dump -Fc | gzip -9`, verifies with `gzip -t` + `pg_restore -l`, `chmod 0640`, 7-day retention.
* Cron target `/usr/local/sbin/tecnoria-db-backup` (580 B, mode 0750) is content-identical.
* Schedule: `/etc/cron.d/tecnoria-db-backup` → `30 3 * * * root /usr/local/sbin/tecnoria-db-backup >> /var/log/tecnoria-db-backup.log 2>&1` (daily 03:30 CET). No systemd timer exists for it.
* **A fresh backup exists.** Newest pair 2026-11-05 03:30 CET (`tecnoria_20261105_033002.dump.gz` 18,707 B; `tecnoria_chat_20261105_033002.dump.gz` 479,321 B); previous pair 01:14:58 CET. Four files total, all in `/var/backups/tecnoria/postgres` (dir mode 0750).
* **Read-only integrity check (mine):** `gzip -t` **OK** and `pg_restore -l` **OK** for **all four** dumps.
* **Finding (low severity, non-blocking for a web-only release, but must be fixed):** the 03:30 **chat** dump has mode **0644** (world-readable) instead of the script's `chmod 0640`, and `/var/log/tecnoria-db-backup.log` contains only **one** `backup ok:` line (for the `tecnoria` DB). The archive itself verifies, but the cron run's chat iteration clearly did not complete as written (it stopped between creating the file and the `chmod`/`printf`), and a chat-DB dump left world-readable is a local-exposure issue. Action for the operator: `chmod 640` the file, run a fresh backup and confirm **two** `backup ok:` lines, and find out why the chat iteration aborted. The newest backup is ~13.5 h old at 17:30 CET; the next scheduled run is 2026-11-06 03:30 CET.

### Rollback cost and exact commands

**Cost:** one atomic symlink repoint + one `systemctl restart tecnoria-web.service` ⇒ roughly **1–3 s of web downtime**. No rebuild, no npm install, no database rollback, no API restart. The DB stays at the newer schema: migrations `001`–`009` are additive and re-runnable (the runner re-applies every file on every release, and `006_support.sql` / `002_blog_workflow.sql` were hardened to be re-runnable in `0a10c6c`).

> These commands were **not executed** — the task is read-only. They are the operator's rollback procedure.

```bash
# 0) pre-checks (read-only)
readlink -e /var/www/webtecnoria/apps/web/releases/current
cat    /var/www/webtecnoria/apps/web/releases/current/release.json
grep -o '"fingerprint":"[a-f0-9]*"' \
     /var/www/webtecnoria/apps/web/releases/20261105_012220/release.json
#   expect: "fingerprint":"6d5562e19f74b7d8fff2ca7df52672bf4d33419495bec32bf5d1b2c880df73fa"

# 1) atomic symlink repoint — identical mechanism to point_current_to_release (script lines 70-78)
ln -sfn /var/www/webtecnoria/apps/web/releases/20261105_012220 \
       /var/www/webtecnoria/apps/web/releases/.current_tmp
mv -Tf /var/www/webtecnoria/apps/web/releases/.current_tmp \
       /var/www/webtecnoria/apps/web/releases/current

# 2) restart the SSR service (it re-resolves `current` at start)
systemctl restart tecnoria-web.service

# 3) verify
systemctl show -p MainPID -p ExecMainStartTimestamp tecnoria-web.service
readlink -e /var/www/webtecnoria/apps/web/releases/current
curl -fsS -o /dev/null -w '%{http_code}\n' https://tecnoriasl.com/
curl -fsS -k --resolve 'tecnoriasl.com:443:127.0.0.1' https://tecnoriasl.com/ | grep -Fq TecnoRia && echo TEXT_OK
```

---

## 3. Blockers and release recommendation

1. **BLOCKER — H-10 blocks the next push.** The smoke gate will fail again unless `/var/www/bin/publish-frontend-release.sh` line 240 is fixed. That file is shared with `electroria-web`, `talkaris-portal` and `auctorio-studio`; changing it is infrastructure surgery outside GROWTH-03C's write scope and needs the operator and the other owners. It is *not* a tecnoria-only edit.
2. **Important operational nuance:** in all three smoke-failing runs the release **was** published and the service **was** restarted **before** the failure. A red pipeline therefore currently means *"the new release is live and the job is red"* — it is not evidence that the deploy did not happen. That is exactly why `20261105_052852` is live and why `tecnoria-api.service` restarted at 05:44:11 CET (run `41969593283`).
3. **Non-blocking finding — DB backup:** the 03:30 chat dump is world-readable (0644) and its cron iteration did not log completion. Fix + take a fresh verified backup before releasing.
4. **Non-blocking risk — rollback window:** `KEEP_RELEASES=5` means `20261105_012220` is deleted after roughly four more publishes.
5. **Recommended sequence (not executed):** (a) commit the one-line fix in `infra/bin/publish-frontend-release.sh`; (b) install it into `/var/www/bin/publish-frontend-release.sh` after coordinating with the three other apps; (c) confirm both copies hash equal; (d) re-run the exact line-240 pipeline against the live body and confirm `rc = 0` (with `pipefail` still on); (e) take a fresh DB backup and confirm two `backup ok:` lines; (f) only then push `origin/master`.
6. **Independent review by a different model family is still mandatory before the production release** (team-level requirement; not satisfied by this diagnostic task, which changed no application code).

**Final status of this task: PASS — diagnosis complete, evidence captured, no production state changed.**
|