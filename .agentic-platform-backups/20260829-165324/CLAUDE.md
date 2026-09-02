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

Use repository evidence before assumptions. For codebase, architecture, dependency, or data-flow questions, query Graphify first when `graphify-out/graph.json` exists; use its scoped query/path/explain output to identify the smallest relevant file set. Do not bulk-read generated graph artifacts.

For non-trivial changes: understand → graph discovery → plan → implement narrowly → test → independent review when practical → verify. Preserve repository architecture and unrelated working-tree changes. Select skills and a focused specialist only when they materially help; do not create persistent swarms.

Never hardcode secrets, providers, credentials, or machine-local assumptions. Never claim a check passed unless it was executed. Keep context lean without skipping security, migrations, dependency inspection, or validation. Refresh Graphify after material structural changes.

For UI work, use the existing design system and assess responsive layouts, keyboard/focus behavior, accessibility, loading/empty/error/success states, and light/dark themes where supported. Do not present placeholders or fake metrics as working product behavior.
<!-- END AGENTIC-ENGINEERING-PLATFORM -->
