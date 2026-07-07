---
inclusion: auto
name: ai-ops-supplement
description: Elysia Admin module workflow, Postgres MCP read-only, handoff SQL, menu/RBAC, data dict, page quality, git read-only. For new CRUD modules, menu permissions, dict alignment, seed SQL, MCP schema checks.
---

# AI Ops & Module Workflow (summary)

Full SOP:

#[[file:.ai/AI_MODULE_WORKFLOW.md]]

- Scaffold (CRUD boilerplate): #[[file:.ai/AI_MODULE_SCAFFOLD.md]]

Sub-guides:

- Page quality: #[[file:.ai/AI_PAGE_QUALITY.md]]
- Schema: #[[file:.ai/AI_SCHEMA_GUIDE.md]]
- Handoff SQL: #[[file:.ai/AI_HANDOFF_SQL.md]]
- MCP: #[[file:.ai/AI_MCP_SETUP.md]]
- Form layout: #[[file:.ai/AI_UI_LAYOUT.md]]
- Quick ref: #[[file:.ai/AI_CONTEXT_CAPSULE.md]]

## Key points

- **Flow:** check `server/database/schema/` → **scaffold** (`create:module` + `create:page` from `server/`) → dict (no hardcoded enums) → frontend polish → single SQL at `server/database/sql/{module}-init.sql`
- **Postgres MCP:** read-only for tables/dict/menu IDs; **MUST** prefer MCP over `pg.sql`; never DDL/write via MCP
- **NEVER read** `server/database/sql/pg.sql` — backup; may not match live DB
- **`db:push`:** after schema edits, check `.ai/dev-preferences.local.md`; ask once, then remember — see `.ai/AI_SCHEMA_GUIDE.md`
- **Handoff SQL:** generate file only; developer runs manually; **NEVER** ad-hoc scripts/MCP execute
- **Menu SQL:** query live DB before INSERT; permissions match `route.ts` and frontend auth
- **Page quality:** `art-full-height`, `useDictStore`, see `AI_PAGE_QUALITY.md`
- **Git:** AI read-only — no add/commit/push