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

**User phrases (中文):** `按 module dev workflow`, `走完整 SOP`, `含菜单权限和 handoff SQL`, `全栈模块`

## 9-Step Checklist

### 1. MCP

- **MUST** use **Postgres MCP** read-only for tables, dict, menu IDs (`.ai/AI_MCP_SETUP.md`)
- If unavailable: declare fallback; use SQL subqueries or placeholders

### 2. Schema

- **MUST** check `server/database/schema/` first
- Main table: `...BaseSchema`; sort field name **MUST** be `sort`
- Pure junction table: two FKs only; hard delete
- **MUST** ask developer before changing drizzle schema
- See `.ai/AI_SCHEMA_GUIDE.md`

### 3. Plan (no code yet)

- Goal, module name, tables, CRUD, permissions, task/frontend need (≤5 lines)

### 4. Backend

- `dto.ts` / `handle.ts` / `route.ts` / `task.ts` (optional)
- Templates: `.ai/AI_CODE_EXAMPLES.md`; reference: `system-api/` only
- `meta.permission`: `group:name:action`

### 5. Dict

- **NEVER** hardcode business enums in backend or frontend
- MCP query `system_dict_type` / `system_dict_data`
- Missing items → handoff SQL

### 6. Frontend (if needed)

- Reference: `admin/src/views/system/user/` only
- Permission strings **MUST** match backend
- **MUST** read `.ai/AI_PAGE_QUALITY.md` and `.ai/AI_UI_LAYOUT.md` before finishing

### 7. Handoff SQL

- Single file: `server/database/sql/{module-name}-init.sql`
- Order: dict → menu/buttons → role permissions → seed data
- Menu INSERT **MUST** query DB first (MCP)
- See `.ai/AI_HANDOFF_SQL.md`

### 8. Git Read-Only

- Allowed: `status` / `diff` / `log`
- **NEVER** `add` / `commit` / `push` / `stash` unless user explicitly asks

### 9. Optimization (on demand only)

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
| `.ai/AI_CODE_EXAMPLES.md` | Code templates |
| `.ai/AI_PAGE_QUALITY.md` | List/search/dialog quality |
| `.ai/AI_SCHEMA_GUIDE.md` | Table design |
| `.ai/AI_HANDOFF_SQL.md` | SQL templates |
| `.ai/AI_UI_LAYOUT.md` | Form span layout |
| `.ai/AI_MCP_SETUP.md` | MCP setup |
| `.ai/AI_CONTEXT_CAPSULE.md` | One-page quick ref |