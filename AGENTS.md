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

Use repository evidence before assumptions. For non-local codebase, architecture, dependency, or data-flow questions, query Graphify first when `graphify-out/graph.json` exists; use scoped query/path/explain output to find the smallest relevant source set. Never bulk-read generated graph artifacts.

For non-trivial changes: understand → graph discovery → plan → implement narrowly → test → independent review when practical → verify. Preserve unrelated work. Claude Code may delegate to globally installed native agents; Codex must use its own supported decomposition and review workflow, not Claude agent files.

Never hardcode secrets or claim unexecuted checks. Refresh Graphify after material structural changes. UI work must assess responsive, keyboard/focus, accessibility, and all interaction states.
<!-- END AGENTIC-ENGINEERING-PLATFORM -->
