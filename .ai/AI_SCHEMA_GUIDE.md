# Database Schema Design Guide

**First step** when developing a module: check [`server/database/schema/`](../server/database/schema/). **MUST ask developer** before changing schema files.

---

## Main Table (Business Entity)

**Examples:** product, merchant, order — core CRUD object.

**MUST:**

- Spread `...BaseSchema` (`create_time`, `create_by`, `update_time`, `update_by`, `del_flag`, `remark`) — see [`base-schema.ts`](../server/database/base-schema.ts)
- Primary key: `bigserial`, name per project convention (`roleId`, `goodsId`, etc.)
- Soft delete: `SoftDeleteByKeys` (`del_flag`)

**Sort field:**

- When ordering is needed, field name **MUST** be `sort` (`integer`, default `0`)
- **NEVER** `orderNum`, `sortOrder`, `displayOrder`, etc.

**Naming:**

- Keep table and column names short and clear
- Examples: `business_merchant`, `system_dept`

**References:** [`system_dept.ts`](../server/database/schema/system_dept.ts), [`business_merchant.ts`](../server/database/schema/business_merchant.ts)

---

## Pure Junction Table (M2M / Link Only)

**Examples:** role–menu link with no extra business fields.

**MUST:**

- Store **only** two (or project-standard) FK columns
- **NO** `BaseSchema`
- **NO** `sort`, `remark`, or other fields

**Delete:**

- **Hard delete:** `HardDelete` / `HardDeleteByKeys`
- **NEVER** soft delete for simple links

**Reference:** [`system_role_menu`](../server/database/schema/system_role.ts)

---

## Child / Config Table

**Examples:** merchant payment config — belongs to main entity with its own fields.

**Rules:**

- Business fields as needed + usually `...BaseSchema`
- FK to parent table
- Not subject to pure junction minimal rule

**Reference:** [`business_merchant_configs`](../server/database/schema/business_merchant.ts)

---

## Handoff SQL vs Drizzle

- **Drizzle schema:** structural source of truth (developer approval required)
- **`server/database/sql/{module}-init.sql`:** dict, menu, permissions, seed — separate from DDL; **developer runs manually only**

---

## Apply schema (`db:push`)

After creating or editing files under `server/database/schema/` (with developer approval):

1. Check [`.ai/dev-preferences.local.md`](./dev-preferences.local.example.md) for `db_push: allowed`
2. **If allowed** → run `bun run db:push` in `server/` and report result
3. **If not set** → ask developer once whether AI may run `db:push`; on yes, create `.ai/dev-preferences.local.md` with `db_push: allowed` then run
4. **If developer declines** → remind them to run manually in `server/`; do not run

See [dev-preferences.local.example.md](./dev-preferences.local.example.md) for the preference file format.

---

## DB truth source (runtime data)

When verifying dict, menu, permissions, or other **live DB state**:

| Priority | Source | Use |
|----------|--------|-----|
| 1 | **Postgres MCP** (read-only SELECT) | Actual database — **MUST use first** when available |
| 2 | `server/database/schema/` | Table/column structure when MCP unavailable |
| — | **`server/database/sql/pg.sql`** | **NEVER read** — backup snapshot; may not match live DB |

**NEVER** use `pg.sql` as a substitute for MCP or live queries. See [AI_MCP_SETUP.md](./AI_MCP_SETUP.md), [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md).

---

## Checklist

- [ ] Checked `server/database/schema/` for existing tables
- [ ] Main table has `BaseSchema`; pure junction does not
- [ ] Sort field named `sort` if needed
- [ ] Names not excessively long
- [ ] Junction deletes use hard delete