---
name: elysia-module-dev
description: >-
  Elysia Admin full-stack module workflow: CRUD, schema, dict, menu/permission SQL,
  handoff SQL, form layout, page quality. Use for new modules, admin pages, RBAC,
  drizzle tables. 全栈模块开发、菜单权限、字典、Schema、Handoff SQL。
---

# Elysia Admin Module Development

Follow this checklist; read `.ai/` docs for details. **NEVER skip steps.**

## When to Use

- New `server/src/modules/{group}-{name}/`
- New `admin/src/views/{group}/{name}/`
- Menu, button permissions, or data dict required
- Database schema design or verification

**Triggers:** `CRUD module`, `business-*`, `menu permission`, `handoff sql`, `schema design`, `admin page`

**User phrases (中文):** `按 module dev workflow`, `走完整 SOP`, `含菜单权限和 handoff SQL`, `全栈模块`, `先用脚手架`, `脚手架已生成`

## 10-Step Checklist

### 1. MCP

- **MUST** use **Postgres MCP** read-only for tables, dict, menu IDs (`.ai/AI_MCP_SETUP.md`) — **first** for runtime data
- **NEVER** read `server/database/sql/pg.sql` (stale backup; use MCP or schema files)
- If unavailable: declare fallback; use SQL subqueries or placeholders

### 2. Schema

- **MUST** check `server/database/schema/` first
- Main table: `...BaseSchema`; sort field name **MUST** be `sort`
- Pure junction table: two FKs only; hard delete
- **MUST** ask developer before changing drizzle schema
- After schema edits: `db:push` per `.ai/AI_SCHEMA_GUIDE.md` — check `.ai/dev-preferences.local.md`; ask once, then remember
- See `.ai/AI_SCHEMA_GUIDE.md`

### 3. Module scaffold (standard CRUD — when schema exists & module is new)

- Read `.ai/AI_MODULE_SCAFFOLD.md`
- From `server/`: `bun run create:module {slug} --tag "..."` then `bun run create:page {group} {name} --tag "..."`
- Run in Agent mode when appropriate, or instruct user
- **If scaffold ran:** skip hand-writing CRUD boilerplate — go to steps 5–8 for incremental work
- **If skipped:** continue with step 4 as full backend generation

### 4. Plan (no code yet — if scaffold not used)

- Goal, module name, tables, CRUD, permissions, task/frontend need (≤5 lines)

### 5. Backend

- **Scaffold already ran:** edit `handle.ts` / extend `dto.ts` only; do **not** regenerate `route.ts` from templates
- **No scaffold:** `dto.ts` / `handle.ts` / `route.ts` / `task.ts` (optional); `.ai/AI_CODE_EXAMPLES.md`; reference `system-api/` only
- `meta.permission`: `group:name:action`

### 6. Dict

- **NEVER** hardcode business enums in backend or frontend
- MCP query `system_dict_type` / `system_dict_data`
- Missing items → handoff SQL

### 7. Frontend (if needed)

- **Scaffold already ran:** polish generated vue files; dict + layout per `.ai/AI_PAGE_QUALITY.md` / `.ai/AI_UI_LAYOUT.md`
- **No scaffold:** reference `admin/src/views/system/user/` only
- Permission strings **MUST** match backend
- **MUST** read `.ai/AI_PAGE_QUALITY.md` and `.ai/AI_UI_LAYOUT.md` before finishing

### 8. Handoff SQL

- Single file: `server/database/sql/{module-name}-init.sql`
- Order: dict → menu/buttons → role permissions → seed data
- Menu INSERT **MUST** query live DB first (Postgres MCP)
- **Deliver file only** — developer runs manually; **NEVER** scripts/MCP execute/ad-hoc code to apply SQL
- See `.ai/AI_HANDOFF_SQL.md`

### 9. Git Read-Only

- Allowed: `status` / `diff` / `log`
- **NEVER** `add` / `commit` / `push` / `stash` unless user explicitly asks

### 10. Optimization (on demand only)

- Default: no indexes/cache
- Only when clear performance need; state reason
- **NEVER** auto-add Redis for boilerplate CRUD

## Delivery Format — MUST output in this order

1. **Plan** (≤5 lines)
2. **Files** changed / created
3. **Schema note** (existing / proposed — ask before DDL)
4. **Code** (by file)
5. **Handoff SQL path:** `server/database/sql/{module}-init.sql`
6. **MCP summary** OR `"Postgres MCP unavailable"` fallback
7. **Quality checklist** (permissions ×3, dict, layout, git untouched)

## Doc Index

| Doc | Purpose |
|-----|---------|
| `.ai/AI_MODULE_WORKFLOW.md` | Full SOP |
| `.ai/AI_MODULE_SCAFFOLD.md` | `create:module` + `create:page` CLI |
| `.ai/AI_CODE_EXAMPLES.md` | Code templates |
| `.ai/AI_PAGE_QUALITY.md` | List/search/dialog quality |
| `.ai/AI_SCHEMA_GUIDE.md` | Table design |
| `.ai/AI_HANDOFF_SQL.md` | SQL templates |
| `.ai/AI_UI_LAYOUT.md` | Form span layout |
| `.ai/AI_MCP_SETUP.md` | MCP setup |
| `.ai/AI_CONTEXT_CAPSULE.md` | One-page quick ref |