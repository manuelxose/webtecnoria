# AGENTS.md - Webtecnoria AI Agents

Standardized role-based agents for the Webtecnoria monorepo.

## Available Agent Roles

| Role | Mission | Primary Tools |
|------|---------|---------------|
| **Architect** | Monorepo structure & API design | analysis, planning |
| **Developer** | Full-stack implementation | write_to_file, etc. |
| **Tester** | QA, API/E2E testing | npm run ..., grep_search |
| **UX/UI** | Angular visual excellence | generate_image, CSS |

## Optimization Policy
- **Hierarchical Context**: Start by reading `package.json` and `CLAUDE.md`.
- **Targeted Edits**: Use `multi_replace_file_content` for non-contiguous changes.
- **Context Loading**: Only read files relevant to the current role mission.

Shared workspace skills are cataloged at `/var/www/.agents/skills/manifest.json` and load on demand. Use Graphify for structural context and Vercel/Impeccable for applicable web work.

<!-- BEGIN AGENTIC-ENGINEERING-PLATFORM -->
# Managed engineering policy

Use repository evidence before assumptions. For codebase, architecture, dependency, or data-flow questions, query Graphify first when `graphify-out/graph.json` exists; use its scoped query/path/explain output to identify the smallest relevant file set. Do not bulk-read generated graph artifacts.

For non-trivial changes: understand → graph discovery → plan → implement narrowly → test → independent review when practical → verify. Preserve repository architecture and unrelated working-tree changes. Select skills and a focused specialist only when they materially help; do not create persistent swarms.

Never hardcode secrets, providers, credentials, or machine-local assumptions. Never claim a check passed unless it was executed. Keep context lean without skipping security, migrations, dependency inspection, or validation. Refresh Graphify after material structural changes.

For UI work, use the existing design system and assess responsive layouts, keyboard/focus behavior, accessibility, loading/empty/error/success states, and light/dark themes where supported. Do not present placeholders or fake metrics as working product behavior.
<!-- END AGENTIC-ENGINEERING-PLATFORM -->
