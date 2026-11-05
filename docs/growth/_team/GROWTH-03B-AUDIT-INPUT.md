# GROWTH-03B — Independent audit input

Auditor: `independent-reviewer` (DeepSeek V4 Pro, different model family from every MiniMax implementer).
Task: t7 / G03B-07. Scope: evidence, methodology, code and diff of TECNORIA-GROWTH-03B.
Base: HEAD `894e7c6e057df3e7bacb8b15f39c1d3b47e98ae7` + working-tree changes.
Method: targeted reads/greps + read-only `node --test`, `npm run test:seo`, JSON re-derivation. No file modified except this one.

## Scope verdicts

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| 1 | GSC interpretation | PASS | `scripts/gsc-query-page.mjs:29` read-only scope; `:176-201` pagination; `:30,:150-158` offset; `:306-315` dimension-less totals only; `:39-40,:334-335` legacy hosts excluded; `:404` low-volume caveat. Independently re-derived below. |
| 2 | Cannibalisation verdict | PASS | Same-query test re-derived: article/service shared query set EMPTY in d28 and d90. Not keyword-overlap reasoning. Caveat present in methodology. See G03B-F6. |
| 3 | Perf harness methodology | PASS | Device applied pre-nav `perf-baseline.mjs:782-787` before `:843`; DPR read-back `:700-701,:898-904`; throttle pre-nav `:797-804`; cache cleared `:806-807`; 20/20 samples; median+MAD rule `:90-91,:415-469`; source labels `:93-94,:1482-1510`. See G03B-F1/F3. |
| 4 | Device emulation correctness | PASS | Fresh browser context + re-applied override per sample `:718-734`; constant UA `:73-74,:792-796`; all recorded samples DPR=3. No post-measurement mutation. |
| 5 | SEO regressions | PASS | Diff touches only anchor text + one sidebar link; no canonical/title/meta/robots/JSON-LD. `npm run test:seo` re-run → PASS (33 routes). |
| 6 | Test quality | PASS | `test:seo` and both new suites independently re-run (6/6, 6/6). SSR assertions non-tautological. See G03B-F4/F5. |
| 7 | Security | PASS | No `private_key`/`access_token`/secret in any export; GSC scope read-only; no lead PII. See G03B-F7. |
| 8 | Consent preservation | PASS | Harness default `consent:"none"` `perf-baseline.mjs:149,:218-220,:234`; only grants when `--consent accepted` `:854`. |
| 9 | Git diff scope | PASS | All changes inside scripts/, qa/qa-manifest.json, package.json, apps/web/src/app/site/**, docs/growth/**; nothing in apps/api/**, infra/**, .github/**. See G03B-F2. |

## Independently re-derived numeric claims (from `docs/growth/_team/gsc-query-page-2026-11-05.json`)

- d28 `2026-10-06..2026-11-02` totals 3 clicks / 210 impressions — **CONFIRMED** (dimension-less totals).
- d90 `2026-08-05..2026-11-02` totals 15 / 725 — **CONFIRMED**.
- d480 `2025-07-11..2026-11-02` totals 79 / 35299 — **CONFIRMED**.
- Row counts d28 33/19/30, d90 64/35/60, d480 809/92/511, `pagesFetched=1`, `truncated=false`, `warnings=[]` — **CONFIRMED**.
- Cost article `/blog/cuanto-cuesta-desarrollar-software-medida`: d28 8 rows / 115 imp / 0 clicks, d90 12 rows / 267 imp / 0 clicks — **CONFIRMED** (positions d90 16.93–51.00).
- Service `/servicios/desarrollo-software-medida`: d28 2 rows / 2 imp, d90 5 rows / 54 imp (52 imp = 3 "soria" web/WordPress queries) — **CONFIRMED**.
- `http://tecnoriasl.com/` indexed separately: d90 12 rows / 21 imp / 0 clicks — **CONFIRMED**.
- Shared query set (article ∩ service) in d28 and d90 — **EMPTY** (independently re-derived).

Perf JSON (`perf-baseline-2026-11-05.json`) re-derivation: home 10/10, service 10/10 successful; all samples `devicePixelRatio=3`; medians home LCP 874 ms / CLS 0.0000 / 15.5 long tasks / blocking 3945 ms / JS 1360.2 KiB / 34 req / TTFB 145.6 ms; service LCP 700 ms / CLS 0.0220 / 3 / 1289.5 ms / 1337.4 KiB / 36 req / 87.2 ms; `env.git.commit=894e7c6…`, `sourceChangedDuringRun=false`, `servedTreeChangedDuringRun=false` — **CONFIRMED**.

## Findings

| id | severity | file:line | problem | evidence | required fix | blocks release |
|----|----------|-----------|---------|----------|--------------|----------------|
| G03B-F1 | medium | `docs/growth/_team/perf-baseline-2026-11-05-AFTER-links.json` (vs main) | The "reproducible baseline" is methodologically reproducible, but the **absolute medians drift ~15–20 % across measurement sessions** on this machine. `BEFORE-links`/main (13:58:36Z) home LCP median 874 ms; `AFTER-links` (14:06:13Z) home runA/B LCP 1076/1008 ms (~1042 median). Service 700 ms vs 760/852 ms (~806). Within-session run-to-run is only −3.9…−4.0 %, which understates cross-session variance. | `AFTER-links` runToRunVariation home lcp runA=1076 runB=1008 (−6.3 %); service 760→852 (+12.1 %). Harness records CPU/browser/git correctly and disclaims field data. | Treat any future "did X regress LCP?" comparison as needing a ≥20 % tolerance or a dedicated/CI-controlled host; never cite the −4 % figure as the expected total variability. Document the two-session spread in the final audit. | No |
| G03B-F2 | medium | `.gitignore` (missing) ; `.dsh-tmp/README.md:3` | `.dsh-tmp/` (24 diagnostic `.mjs` scratch scripts) and `.serena/` (IDE tooling) are **untracked AND not gitignored**. `.dsh-tmp/README.md` claims ".dsh-tmp is ignored", but `.gitignore` has no such entry, and `git status --porcelain` shows both as `??`. A delivery-time `git add -A` would commit scratch/cost-accounting helpers. No secrets found in them. | `git status --porcelain` → `?? .dsh-tmp/`, `?? .serena/`; `Select-String .gitignore` for `dsh-tmp|serena` → no match. | Exclude `.dsh-tmp/` and `.serena/` from the delivery commit, or add both to `.gitignore` before delivery. | No |
| G03B-F3 | low | `docs/growth/_team/perf-baseline-2026-11-05.json` vs `-BEFORE-links.json` | The two files are byte-identical duplicates (same `generatedAt` 13:58:36.909Z, same runToRun). The "BEFORE-links" name is misleading: that snapshot's `git.dirtyPaths` already contains the 6 link/anchor files, so it is not a pre-links measurement. | `fs.readFileSync` sizes both 381260 B; identical `generatedAt`. | Either drop the duplicate or rename it to the main baseline and correct the "BEFORE" semantics in the final report. | No |
| G03B-F4 | low | `scripts/tests/perf-baseline.test.mjs:94-98,:35-45` | Two assertions are weaker than they appear: (a) test "DPR asserted" is a loose regex (`invalid|dpr`), and the recorded-sample check falls back `sample.devicePixelRatio ?? sample.effectiveDpr ?? 3`, which would **pass with 3 by default if the field were ever absent** (latent tautology); (b) test "override before navigation" is a textual `indexOf` order check, not an execution-order guarantee. The recorded JSON *does* contain `devicePixelRatio`, so the tests are currently meaningful. | `node --test scripts/tests/perf-baseline.test.mjs` → 6/6 pass. | Tighten: assert the recorded sample has an explicit DPR field (no `?? 3` default), and document that the order check is source-textual. | No |
| G03B-F5 | low | `scripts/tests/internal-links.test.mjs:30-42,:54-67,:70-72` | The data-invariant tests regex-parse TypeScript source (`manifestPaths`, `servicePaths`, `serviceArticleLinks` slugs, a fixed 1400-char `CONTENT.slice` window) instead of importing the data model. Fragile to renames/refactors and to entry growth beyond the slice window. Coverage is rescued by the real SSR assertions in `scripts/seo-check.ts` (which independently passed). | `node --test scripts/tests/internal-links.test.mjs` → 6/6 pass. | Acceptable; optionally refactor to import the TS data module. Not required before release. | No |
| G03B-F6 | low | `docs/growth/_team/gsc-query-page-2026-11-05.json` methodology (string) | "Cannibalisation is REFUTED" is slightly strong given GSC suppresses anonymised/low-volume rows: a shared query with genuinely low impressions would be absent. The substantive conclusion — no shared query in the observed d28/d90 data, distinct informational vs commercial intent — is correct and the caveat *is* present in the tool's methodology text. | Re-derived shared-query set = empty; `gsc-query-page.mjs:404` states "A missing row is NOT proof of zero impressions." | Soften "REFUTED" to "no observed cannibalisation in available GSC data" in the final report. | No |
| G03B-F7 | low | `scripts/gsc-query-page.mjs:382` ; export `serviceAccountEmail` | The export records `serviceAccountEmail: guiatv-gsc@guia-tv-8fe3c.iam.gserviceaccount.com` (an identifier, not a secret — no private_key/token present). The GCP project name `guia-tv` differs from the site being queried; worth the Lead confirming this service account is intentionally scoped to the `tecnoriasl.com` Search Console property. | `node -e` scan → `private_key:false`, `access_token:false`, single email = the service account. | Confirm intentional SA/property binding; consider not recording the SA email in the committed export if it is not needed for audit. | No |

Counts: blocker 0 · high 0 · medium 2 · low 5.

## Verdict

**PASS WITH FINDINGS** — no blocker and no high-severity finding. The GSC interpretation, cannibalisation verdict, perf-harness methodology, device emulation, SEO-regression surface, test quality, security, and consent preservation all verify. The two medium findings (cross-session perf drift, non-gitignored scratch dirs) are release-enablement cautions, not correctness defects; the Lead must (a) exclude/ignore `.dsh-tmp/` and `.serena/` and (b) carry the perf-drift caveat into the final audit before delivery.
