# AI Context Quick Reference

**Does NOT replace** [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md). Full SOP: **[AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)**.

---

## Doc Map

| Scenario | Read |
|----------|------|
| New business module | [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) + Skill `.cursor/skills/elysia-module-dev/` |
| Standard CRUD + schema exists | [AI_MODULE_SCAFFOLD.md](./AI_MODULE_SCAFFOLD.md) — run `create:module` + `create:page` first |
| Write code | [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md) |
| Table design | [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md) |
| Dict / menu SQL | [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md) |
| Page quality | [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md) |
| MCP setup | [AI_MCP_SETUP.md](./AI_MCP_SETUP.md) |
| Form layout | [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md) |
| Full index | [README.md](./README.md) |

---

## MCP

- **Postgres (required):** read-only tables/dict/menu IDs; **NEVER** DDL/write via MCP → [AI_MCP_SETUP.md](./AI_MCP_SETUP.md)
- **Chrome DevTools (optional):** UI smoke after frontend

---

## Core Rules (Quick)

1. **Schema first:** check `server/database/schema/`; main table + `BaseSchema`; junction = two FKs only; sort field name `sort`
2. **Standard CRUD scaffold:** when schema exists and module is new → [AI_MODULE_SCAFFOLD.md](./AI_MODULE_SCAFFOLD.md) (`bun run create:module` + `create:page` from `server/`) before hand-writing CRUD files
3. **No hardcoded enums:** align `system_dict_*`; missing → `server/database/sql/{module}-init.sql`
4. **Permissions ×3:** `route.ts` ↔ frontend auth ↔ SQL `permission`
5. **Menu SQL:** query DB (MCP) before INSERT; one merged SQL file
6. **Git read-only:** status/diff/log OK; no add/commit/push unless user asks
7. **Optimize on demand:** no default indexes/Redis for CRUD boilerplate

---

## Built-in UI

- Paths: `@/components/core/forms/`, `@/components/core/tables/`
- Reference page: `admin/src/views/system/user/` — do NOT read all of `components/core`

---

## Excel

- Export: `ArtExcelExport` + list data
- Import: needs dedicated API — do not invent bulk write without confirmation
