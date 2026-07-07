---
description: Global architecture, dependency direction, file-reading discipline (always apply)
alwaysApply: true
---

# Project Overview

Full-stack admin system: **Vue 3 + TypeScript** frontend (Art Design Pro) + **Elysia + Bun** backend.

```
elysia-admin/
├── admin/src/        # Frontend (Vue 3)
└── server/src/       # Backend (Elysia + Bun)
    ├── modules/      # Business logic — one folder per module
    ├── worker-sandbox/  # Sandbox worker task registry (queue processor imports here only)
    ├── types/        # Hand-written importable types (*.ts); types/ambient/ for *.d.ts only
    ├── core/         # Infrastructure (DO NOT modify)
    ├── shared/       # Pure utilities (stateless)
    └── infrastructure/ # External clients
```

---

# Dependency Direction (Strict)

```
admin → server (HTTP only)

modules → core
modules → shared
modules → infrastructure

core  ✗→ modules
shared ✗→ modules
infrastructure ✗→ modules   (sandbox processor registers via worker-sandbox/, not infrastructure → modules)

shared ✗→ core/database       (cron + Redis lock: server/src/infrastructure/cron/cron-scheduler.ts)
```

**Server types:** `server/src/types/*.ts` = importable business/shared types; `server/src/types/ambient/*.d.ts` = ambient declarations only — do not put large business interfaces in ambient/.

---

# Generation Principles

1. Explain plan in **max 5 lines** before writing code
2. List files to create or modify
3. Generate **minimal** code — no extra abstraction
4. Follow existing patterns strictly (see `.ai/AI_CODE_EXAMPLES.md`)
5. Do NOT introduce new dependencies
6. Do NOT refactor unrelated files
7. Ask before modifying database schema
8. No over-engineering

---

# Module Dev Triggers

When the task matches **new CRUD module**, **business-***, **menu permission**, **handoff sql**, or **schema design**:

- Read `.ai/AI_MODULE_WORKFLOW.md` or use skill `.cursor/skills/elysia-module-dev/`
- **Standard single-table CRUD** with schema ready → read `.ai/AI_MODULE_SCAFFOLD.md`; prefer `bun run create:module` + `bun run create:page` from `server/` before hand-writing CRUD files
- Sub-guides: `AI_SCHEMA_GUIDE.md`, `AI_HANDOFF_SQL.md`, `AI_PAGE_QUALITY.md`, `AI_UI_LAYOUT.md`, `AI_MCP_SETUP.md`

For built-in UI paths, MCP, dict/menu alignment: read `.ai/AI_CONTEXT_CAPSULE.md` **only if needed** — it does **not** replace `AI_CODE_EXAMPLES.md`.

**Handoff SQL:** merge dict/menu/permission SQL into `server/database/sql/{module-name}-init.sql` for the developer to run **manually only** (see `.ai/AI_HANDOFF_SQL.md`). **NEVER** run handoff SQL via scripts, psql, MCP write/execute, or ad-hoc code. **NEVER** pretend SQL was executed.

**Git (read-only for AI):** `git status` / `git diff` / `git log` allowed. Do **not** `git add`, `commit`, `push`, or `stash` unless the user explicitly asks.

---

# File Reading Discipline (Token Budget)

> Rules and `.ai/AI_CODE_EXAMPLES.md` contain enough context.
> Read source files **only when strictly necessary**.

**NEVER read these (ever):**
- `node_modules/`
- `dist/` or `build/`
- `server/database/sql/pg.sql` (backup snapshot; may not match live DB — use Postgres MCP or schema files)
- `admin/src/components/core/` (unless fixing a core component bug)
- `server/src/core/` (unless the task explicitly touches infrastructure)
- `database/schema/` other than the one table directly used in the current task

**Read at most ONE reference module/page** when creating something new **without scaffold**:
- Backend new module → read only `server/src/modules/system-api/`
- Frontend new page → read only `admin/src/views/system/user/`

**After module scaffold (`create:module` / `create:page`):** read only generated module/view files + the one schema file — **do not** read `system-api/` or `system/user/` for boilerplate

**When modifying existing code:**
- Read only the specific file being modified
- Read direct imports only if their type signatures are needed

**Do NOT:**
- Scan entire directories to "understand the project"
- Read all modules to find a pattern — use `.ai/AI_CODE_EXAMPLES.md` instead
- Read `core/repository.ts` unless you need an obscure function not in the examples

---

# `.ai` Doc Index (same as Cursor rules)

- **`AI_MODULE_WORKFLOW.md`** — module dev main SOP
- **`AI_MODULE_SCAFFOLD.md`** — `create:module` + `create:page` CRUD boilerplate (run from `server/`)
- **`AI_CODE_EXAMPLES.md`** — code templates (primary for implementation)
- **`AI_PAGE_QUALITY.md`** — list/search/dialog quality
- **`AI_CONTEXT_CAPSULE.md`** — one-page quick ref
- **`AI_SCHEMA_GUIDE.md`** / **`AI_HANDOFF_SQL.md`** / **`AI_UI_LAYOUT.md`** / **`AI_MCP_SETUP.md`**
- **Cursor Skill:** `.cursor/skills/elysia-module-dev/SKILL.md`
- Others: `AI_MODULE_STANDARD.md`, `AI_FRONTEND_RULES.md`, etc. — open when relevant only