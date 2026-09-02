# CLAUDE.md - Webtecnoria Agent Guide

## Project Context
Webtecnoria is a monorepo containing an Angular SSR web application, a custom API, and shared types.

## Behavioral Rules
- **Conciseness**: Avoid wordy explanations.
- **Type Safety**: Leverage shared types for all cross-app communication.
- **Root Cleanliness**: Do not store temporary files in the root.

## Build & Test Commands
- Full Build: `npm run build`
- Build Types: `npm run build:types`
- Web Build (SSR): `npm run build:ssr:web`
- API Build: `npm run build:api`
- Dev Mode: `npm run dev`

## Role-Specific Missions

### [ARCHITECT]
Guard the monorepo's structural integrity. Focus on API scalability and type-safe integration.

### [DEVELOPER]
Implement core features across Angular and Node.js. Follow the Architect's patterns.

### [TESTER]
Ensure high-quality releases through rigorous API and E2E testing.

### [UX/UI]
Owner of the web application's visual excellence. Deliver premium, state-of-the-art designs.

<!-- BEGIN AGENTIC-ENGINEERING-PLATFORM -->
# Managed engineering policy

Use repository evidence before assumptions. For non-local codebase, architecture, dependency, or data-flow questions, query Graphify first when `graphify-out/graph.json` exists; use scoped query/path/explain output to find the smallest relevant source set. Never bulk-read generated graph artifacts.

For non-trivial changes: understand → graph discovery → plan → implement narrowly → test → independent review when practical → verify. Preserve unrelated work. Claude Code may delegate to globally installed native agents; Codex must use its own supported decomposition and review workflow, not Claude agent files.

Never hardcode secrets or claim unexecuted checks. Refresh Graphify after material structural changes. UI work must assess responsive, keyboard/focus, accessibility, and all interaction states.
<!-- END AGENTIC-ENGINEERING-PLATFORM -->
