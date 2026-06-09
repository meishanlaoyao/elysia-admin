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
- **`server/database/sql/{module}-init.sql`:** dict, menu, permissions, seed — separate from DDL notes

---

## Checklist

- [ ] Checked `server/database/schema/` for existing tables
- [ ] Main table has `BaseSchema`; pure junction does not
- [ ] Sort field named `sort` if needed
- [ ] Names not excessively long
- [ ] Junction deletes use hard delete
