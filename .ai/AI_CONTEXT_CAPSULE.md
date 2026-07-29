# AI Context Quick Reference

**Does NOT replace** [AI_CODE_EXAMPLES_BACKEND.md](./AI_CODE_EXAMPLES_BACKEND.md) / [AI_CODE_EXAMPLES_FRONTEND.md](./AI_CODE_EXAMPLES_FRONTEND.md). Full SOP: **[AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)** (prefer Skill checklist first).

---

## Doc Map

| Scenario | Read |
|----------|------|
| New business module | [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) + Skill `.cursor/skills/elysia-module-dev/` |
| Standard CRUD + schema exists | [AI_MODULE_SCAFFOLD.md](./AI_MODULE_SCAFFOLD.md) — run `create:module` + `create:page` first |
| Write backend code | [AI_CODE_EXAMPLES_BACKEND.md](./AI_CODE_EXAMPLES_BACKEND.md) — section only |
| Write frontend code | [AI_CODE_EXAMPLES_FRONTEND.md](./AI_CODE_EXAMPLES_FRONTEND.md) — section only |
| Table design | [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md) |
| Dict / menu SQL | [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md) |
| Page quality | [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md) |
| MCP setup | [AI_MCP_SETUP.md](./AI_MCP_SETUP.md) |
| Form layout | [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md) |
| Full index | [README.md](./README.md) |

---

## MCP

- **Postgres (required):** read-only tables/dict/menu IDs; **NEVER** DDL/write via MCP; **MUST** prefer MCP over `pg.sql` → [AI_MCP_SETUP.md](./AI_MCP_SETUP.md)
- **Chrome DevTools (optional):** UI smoke after frontend

---

## Schema & SQL (Quick)

- **`db:push`:** after schema edits, check `.ai/dev-preferences.local.md`; ask once, then remember — see [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md)
- **Handoff SQL:** generate `server/database/sql/{module}-init.sql` only; developer runs manually; **NEVER** ad-hoc scripts or MCP execute
- **NEVER read or modify** `server/database/sql/pg.sql` (stale backup only)

---

## Core Rules (Quick)

1. **Schema first:** check `server/database/schema/`; main table + `BaseSchema`; junction = two FKs only; sort field name `sort`
2. **Soft delete & unique:** uniqueness checks include soft-deleted rows; new unique constraints → partial unique index `WHERE del_flag = false`
3. **Standard CRUD scaffold:** when schema exists and module is new → [AI_MODULE_SCAFFOLD.md](./AI_MODULE_SCAFFOLD.md) (`bun run create:module` + `create:page` from `server/`) before hand-writing CRUD files
4. **No hardcoded enums:** align `system_dict_*`; missing → `server/database/sql/{module}-init.sql`
5. **Form validation both sides:** frontend `rules` + backend `dto.ts` Chinese `error`; entity dropdowns → cached `/options` (not `/list`)
6. **Permissions ×3:** `route.ts` ↔ frontend auth ↔ SQL `permission`
7. **Menu SQL:** query DB (MCP) before INSERT; one merged SQL file
8. **Git read-only:** status/diff/log OK; no add/commit/push unless user asks
9. **Optimize on demand:** no default indexes/Redis for CRUD boilerplate — **except** options endpoints (always cache)

---

## Built-in UI

- Paths: `@/components/core/forms/`, `@/components/core/tables/`
- Reference page: `admin/src/views/system/user/` — do NOT read all of `components/core`

---

## Excel

- Export: `ArtExcelExport` + list data
- Import: needs dedicated API — do not invent bulk write without confirmation