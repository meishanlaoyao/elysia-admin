# AI Module Development Workflow (SOP)

**Purpose:** Step-by-step process for new or extended business modules. Code style: `AI_CODE_EXAMPLES.md`. This file defines **what to do first, what next**.

**NEVER:** skip steps, redesign architecture, change schema without approval, git commit for the developer.

---

## 0. MCP and Tooling

- Recommend Postgres MCP — see [AI_MCP_SETUP.md](./AI_MCP_SETUP.md)
- **Postgres MCP available:** query tables, dict, menu IDs read-only first
- **No MCP:** read `server/database/schema/`; mark SQL placeholders; state "verify IDs before run"

---

## 1. Clarify Scope (MUST — no code yet)

Output (≤5 line plan + list):

1. Feature goal (1–2 sentences)
2. Module name (e.g. `business-goods`)
3. Database tables (existing / to create)
4. CRUD and permission requirements
5. Scheduled task needed? (`task.ts`)
6. Frontend page needed?

---

## 2. Check Schema (first technical step)

1. Search [`server/database/schema/`](../server/database/schema/) for related tables
2. **No table:** design per [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md); **MUST ask developer** before editing drizzle files
3. **Table exists:** read only that schema file for the current task

---

## 3. Backend Module

Directory: `server/src/modules/{group}-{name}/`

| File | Role |
|------|------|
| `dto.ts` | Validation + DTO |
| `handle.ts` | Business logic + repository |
| `route.ts` | HTTP + `meta.permission` |
| `task.ts` | Optional; empty export if no jobs |

- Templates: [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md)
- Reference: `server/src/modules/system-api/` only
- Routes auto-register — **do not** edit `modules/index.ts`
- **NEVER** hardcode business enums — see step 4

---

## 4. Data Dictionary Alignment

- Status/type/options **MUST** align with `system_dict_type` / `system_dict_data`
- With Postgres MCP: read-only query for existing `dict_type` and items
- **Missing:** add INSERTs to handoff SQL — [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md)
- Frontend: dict API / `useDictStore` — **NEVER** hardcoded `options` arrays for business types

---

## 5. Frontend (if required)

- Reference: `admin/src/views/system/user/` only
- Permissions: `v-auth` / `auth.hasAuth` **MUST** match backend `meta.permission`
- **MUST** apply [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md) and [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md)

---

## 6. Generate Merged Handoff SQL

- **Path:** `server/database/sql/{module-name}-init.sql`
- **Order:** dict → menu/buttons → role permissions → seed (optional)
- Menu SQL **MUST** query DB first (MCP) — [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md)
- File header: target env, `BEGIN`/`COMMIT`, MCP query summary
- Developer runs manually — **NEVER** pretend SQL was executed

---

## 7. Git Discipline (Read-Only)

| Allowed | Forbidden (unless user asks) |
|---------|------------------------------|
| `git status` | `git add` |
| `git diff` | `git commit` |
| `git log` | `git push`, `git stash` |

---

## 8. Performance (On Demand Only)

**Default: no optimization.**

Consider only with clear performance need; **MUST** state why:

- **Indexes:** FKs, list filter fields, common `WHERE` combos
- **Redis:** read-heavy + existing cache pattern to reuse

**NEVER** auto-add cache/index for boilerplate CRUD.

---

## 9. Delivery Format — MUST output in order

1. Plan (≤5 lines)
2. Files changed / created
3. Schema note (existing / proposed — ask before DDL)
4. Code (by file)
5. Handoff SQL path: `server/database/sql/{module}-init.sql`
6. MCP query summary OR `"Postgres MCP unavailable"`
7. Quality checklist below

---

## 10. Pre-Delivery Checklist

- [ ] Schema matches drizzle (or DDL clearly marked for developer)
- [ ] Permissions aligned: `route.ts` ↔ frontend auth ↔ SQL `permission`
- [ ] No hardcoded business enums (dict or handoff SQL)
- [ ] Dialog/drawer layout OK — AI_UI_LAYOUT + AI_PAGE_QUALITY
- [ ] `server/database/sql/{module}-init.sql` exists and is runnable in one pass
- [ ] Menu IDs from MCP query, or fallback documented
- [ ] Core untouched; git not committed by AI
- [ ] Deliverables listed for developer

---

## Related Docs

- Architecture: `AI_MODULE_STANDARD.md`, `AI_STRUCTURE.md`
- Legacy template: `AI_FEATURE_TEMPLATE.md` (migrated here)
- Quick ref: `AI_CONTEXT_CAPSULE.md`

**On conflict:** follow **existing module code** in repo, then this file + `AI_CODE_EXAMPLES.md`.
