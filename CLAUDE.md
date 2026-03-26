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
