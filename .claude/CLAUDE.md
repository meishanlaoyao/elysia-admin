# Elysia Admin

Full-stack admin: **Vue 3 + TypeScript** (`admin/`) + **Elysia + Bun** (`server/`).

## Commands

| Area | Command | cwd |
|------|---------|-----|
| Backend dev | `bun run dev` | `server/` |
| Backend + workers | `bun run dev:all` | `server/` |
| Backend test | `bun test` | `server/` |
| Module scaffold (backend) | `bun run create:module {slug} --tag "..."` | `server/` |
| Module scaffold (admin) | `bun run create:page {group} {name} --tag "..."` | `server/` |
| Frontend dev | `pnpm dev` | `admin/` |
| Frontend lint | `pnpm lint` | `admin/` |

## Module dev trigger

When the task matches **new CRUD module**, **business-***, **menu permission**, **handoff sql**, or **schema design**:

- Read `.ai/AI_MODULE_WORKFLOW.md`
- **Standard CRUD:** read `.ai/AI_MODULE_SCAFFOLD.md` ? run `create:module` + `create:page` from `server/` when schema exists
- Code templates: `.ai/AI_CODE_EXAMPLES_BACKEND.md` / `.ai/AI_CODE_EXAMPLES_FRONTEND.md` (section only; index: `AI_CODE_EXAMPLES.md`)
- Handoff SQL output: `server/database/sql/{module-name}-init.sql`
- Trigger phrases: `? module dev workflow` / `??? SOP` / `?????` / `??????`
- Soft delete & uniqueness; form validation both sides; `handle.ts` JSDoc; entity `/options` + cache; response DTO completeness; **NEVER modify** `pg.sql`

## Large task / full project trigger

When the request names **multiple business feature modules** or a full subsystem/project (judge by module volume, **not** file-change count):

- Read `.ai/AI_PHASED_TASKS.md`; write under `.claude/feature-tasks/{slug}/`
- Do **not** start coding until the task pack exists and the user picks a phase
- Trigger phrases: `????` / `?????` / `?????` / `??????`

## Scoped rules

Path-specific rules live in `.claude/rules/`:

- `general.md` ? always apply
- `backend.md` ? `server/src/**`
- `frontend.md` ? `admin/src/**`

## `.ai/` doc index

| File | Purpose |
|------|---------|
| `AI_MODULE_WORKFLOW.md` | Main SOP |
| `AI_MODULE_SCAFFOLD.md` | CRUD scaffold CLI |
| `AI_PHASED_TASKS.md` | Multi-module / full-project task packs |
| `AI_CODE_EXAMPLES.md` | Template index |
| `AI_CODE_EXAMPLES_BACKEND.md` / `_FRONTEND.md` | Code templates |
| `AI_PAGE_QUALITY.md` | List/search/dialog quality |
| `AI_SCHEMA_GUIDE.md` | Table design |
| `AI_HANDOFF_SQL.md` | Menu/dict SQL |
| `AI_MCP_SETUP.md` | Postgres MCP (read-only) |
| `AI_CONTEXT_CAPSULE.md` | One-page quick ref |

**Git (read-only for AI):** no `git add` / `commit` / `push` unless the user explicitly asks.

**NEVER read or modify** `server/database/sql/pg.sql` (backup snapshot only).
