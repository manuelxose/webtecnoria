# Skills, tooling and provenance

**Date:** 2026-11-05
**Rule:** a skill is only claimed as active after it is discoverable by the agent catalog and its
instructions were actually read. Repository convention keeps AI tooling local-only; `.dsh/` and
`.specify/` are gitignored.

## 1. GitHub Spec Kit

| Item | Evidence |
|---|---|
| CLI | `specify 1.3.0` (`specify --version`) |
| Integration | `specify init --here --force --non-interactive --integration dsh` |
| DSH skills | installed under `.dsh/skills/speckit-*`; catalog showed `speckit-constitution`, `speckit-specify`, `speckit-plan`, `speckit-tasks`, `speckit-implement`, `speckit-converge`, etc. |
| Project artifacts | `.specify/memory/constitution.md`, `specs/001-seo-growth-transformation/{spec,plan,tasks}.md` |
| Status | active as a spec-authoring front-end; not a bypass of engineering gates |

## 2. Ponytail

| Item | Evidence |
|---|---|
| Source | https://github.com/DietrichGebert/ponytail (MIT) |
| Install | global skill at `~/.agents/skills/ponytail/SKILL.md` |
| Use | smallest complete change; no new dependency for the SEO repair; reused Angular/Express and the existing release scripts |
| Status | active/used |

## 3. Marketing skills

Source: https://github.com/coreyhaines31/marketingskills (MIT). Installed project-scoped under
`.dsh/skills/` and visible in the DSH catalog:

- `seo-audit`, `site-architecture`, `schema`, `content-strategy`, `programmatic-seo`, `ai-seo`,
  `copywriting`, `copy-editing`, `cro`, `analytics`, `conversion-tracking`, `competitors`,
  `link-building`, `free-tools`.

Selected only where relevant. Programmatic SEO was explicitly restricted to genuinely
differentiated pages (see `KEYWORD-STRATEGY.md`); no city/service matrix was generated.

## 4. Automated SEO auditor

Source: https://github.com/seo-skills/seo-audit-skill (MIT), CLI package `@seomator/seo-audit@7.0.0`.
Run in a temp directory via `npx`, not added as a runtime dependency:

```bash
npx --yes @seomator/seo-audit@7.0.0 audit https://tecnoriasl.com \
  --format json --no-cwv --no-save \
  --output docs/growth/_team/seomator-baseline.json
```

Output: `docs/growth/_team/seomator-baseline.json` (178 KB, score 89/100).
It is a diagnostic input, not a Google ranking signal. False positives recorded:

- `/cdn-cgi/l/email-protection` “broken internal link” — Cloudflare email obfuscation.
- `security-leaked-secrets` — the Google OAuth **client ID** is public, not a secret.
- mobile horizontal scroll from image `width="1024"` — global CSS has `img { max-width: 100% }`;
  still needs a real mobile check.
- “no privacy policy link” — the footer link exists.
- LocalBusiness warnings — the unverified LocalBusiness markup was removed.

## 5. Microsoft TokenEconomizer

Source: https://github.com/microsoft/TokenEconomizer.
**Not installed.** It has no DeepSeek Harness adapter in this installation. Its Claude Code/Codex/
Copilot hooks were not added to global configuration; doing so would be untested and out of scope.
This is a documented compatibility limitation, not a failed install.

## 6. Harness and models

- DSH session model: `deepseek-official/deepseek-flash` (captain).
- AgentTeams members: `deepseek-v4-pro` for SEO and infra audits; `deepseek-flash` for growth research.
- Independent review: Claude Sonnet 5.5 via `subagent_claude_code` (two reviews). Opus was not used.
- No claim is made that the harness rewrites model routes; model selection is recorded, not
  auto-enforced.
