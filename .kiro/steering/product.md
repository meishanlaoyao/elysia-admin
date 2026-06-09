---
inclusion: always
---

# Product Overview (elysia-admin)

**elysia-admin** is a full-stack admin system: **Vue 3** (Art Design Pro) frontend + **Elysia + Bun** backend.

## Typical Dev Tasks

- **New CRUD list page:** follow `.ai/AI_MODULE_WORKFLOW.md`; types/api/views layers; permissions aligned with backend
- **New backend module:** `server/src/modules/{group}-{name}/` with dto/handle/route (required); optional task.ts; handoff SQL in `server/database/sql/`

## Goal

Minimal, style-consistent changes — no unrelated tech stack or dependencies.