# Elysia Admin

Full-stack admin: **Vue 3 + TypeScript** (`admin/`) + **Elysia + Bun** (`server/`).

## Commands

| Area | Command | cwd |
|------|---------|-----|
| Backend dev | `bun run dev` | `server/` |
| Backend + workers | `bun run dev:all` | `server/` |
| Backend test | `bun test` | `server/` |
| Frontend dev | `pnpm dev` | `admin/` |
| Frontend lint | `pnpm lint` | `admin/` |

## Module dev trigger

When the task matches **new CRUD module**, **business-***, **menu permission**, **handoff sql**, or **schema design**:

- Read `.ai/AI_MODULE_WORKFLOW.md`
- Code templates: `.ai/AI_CODE_EXAMPLES.md` (primary — do not duplicate inline)
- Handoff SQL output: `server/database/sql/{module-name}-init.sql`
- Trigger phrases: `按 module dev workflow` / `走完整 SOP`

## Scoped rules

Path-specific rules live in `.claude/rules/`:

- `general.md` — always apply
- `backend.md` — `server/src/**`
- `frontend.md` — `admin/src/**`

## `.ai/` doc index

| File | Purpose |
|------|---------|
| `AI_MODULE_WORKFLOW.md` | Main SOP |
| `AI_CODE_EXAMPLES.md` | Code templates |
| `AI_PAGE_QUALITY.md` | List/search/dialog quality |
| `AI_SCHEMA_GUIDE.md` | Table design |
| `AI_HANDOFF_SQL.md` | Menu/dict SQL |
| `AI_MCP_SETUP.md` | Postgres MCP (read-only) |
| `AI_CONTEXT_CAPSULE.md` | One-page quick ref |

**Git (read-only for AI):** no `git add` / `commit` / `push` unless the user explicitly asks.
