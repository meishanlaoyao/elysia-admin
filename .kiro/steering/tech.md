---
inclusion: always
---

# Tech Stack & Engineering Constraints

## Stack

- **Frontend:** Vue 3, TypeScript, Art Design Pro, Element Plus
- **Backend:** Elysia, Bun; data access via repository + schema — no ad-hoc raw SQL in modules

## Strict Dependency Direction

```
admin → server (HTTP only)

modules → core
modules → shared
modules → infrastructure

core  ✗→ modules
shared ✗→ modules
infrastructure ✗→ modules   (sandbox via worker-sandbox/, not infrastructure → modules)

shared ✗→ core/database       (cron + Redis lock: server/src/infrastructure/cron/cron-scheduler.ts)
```

## Generation Principles

1. Plan in **≤5 lines** + file list before coding
2. **Minimal diff** — no unrelated abstraction or refactors
3. **No new dependencies** unless user asks
4. Match existing patterns; **ask before schema changes**
5. No over-engineering

## Live references to `.ai/` (do not duplicate long templates in steering)

#[[file:.ai/AI_MODULE_WORKFLOW.md]]

#[[file:.ai/AI_CODE_EXAMPLES.md]]

#[[file:.ai/AI_PAGE_QUALITY.md]]

#[[file:.ai/AI_CONTEXT_CAPSULE.md]]

- **Module workflow:** `AI_MODULE_WORKFLOW.md` (prefer Skill checklist; full file only if ambiguous)
- **Code templates:** `AI_CODE_EXAMPLES_BACKEND.md` / `AI_CODE_EXAMPLES_FRONTEND.md` (section only)
- **Page quality + quick ref:** `AI_PAGE_QUALITY.md`, `AI_CONTEXT_CAPSULE.md` (on demand)