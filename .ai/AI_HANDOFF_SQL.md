# Handoff SQL Specification

After module development, merge SQL for the developer into **one file**:

```
server/database/sql/{module-name}-init.sql
```

Example: `server/database/sql/business-goods-init.sql`

Developer runs manually in local/test — **NEVER** pretend SQL was executed.

**NEVER read** `server/database/sql/pg.sql` for dict/menu/runtime data — it is a backup snapshot that may not match the live database. Use Postgres MCP (read-only) first; see [AI_MCP_SETUP.md](./AI_MCP_SETUP.md).

---

## Forbidden — AI must NOT execute handoff SQL

AI **MUST NOT** run or apply handoff SQL on behalf of the developer:

- Temporary scripts (bun, node, psql, shell one-liners, seed runners, one-off migration helpers)
- Postgres MCP or any tool for **INSERT/UPDATE/DELETE/DDL** on handoff SQL content
- Ad-hoc API endpoints, CLI wrappers, tests, or worker tasks created "just to apply SQL"

**Only allowed:** generate/update the `*-init.sql` file, state the path, remind developer to run manually.

---

## File Structure (Fixed Order)

```sql
-- ============================================================
-- {module-name} init SQL
-- Target: local dev (confirm NOT production)
-- MCP summary: parent_menu_id=xxx, max_sort=yyy, dict_type exists/new
-- ============================================================

BEGIN;

-- ---------- 1. Data dictionary (if missing) ----------
-- INSERT INTO system_dict_type ...
-- INSERT INTO system_dict_data ...

-- ---------- 2. Menu ----------
-- INSERT INTO system_menu ... RETURNING menu_id;

-- ---------- 3. Menu buttons (optional) ----------
-- INSERT INTO system_menu_btn ...

-- ---------- 4. Role permissions (optional) ----------
-- INSERT INTO system_role_menu ...

-- ---------- 5. Seed data (optional) ----------

COMMIT;
```

---

## Before Writing SQL — Query DB (when Postgres MCP available)

### Dictionary

```sql
SELECT dict_id, dict_type FROM system_dict_type WHERE dict_type = 'your_dict_type';
SELECT dict_code, dict_label, dict_value FROM system_dict_data WHERE dict_type = 'your_dict_type';
```

- Exists: skip or comment only in handoff file
- Missing: generate `INSERT` aligned with [`system_dict.ts`](../server/database/schema/system_dict.ts)

### Menu

```sql
SELECT menu_id, title, path FROM system_menu WHERE path = '/business' AND del_flag = false;

SELECT COALESCE(MAX(sort), 0) + 1 AS next_sort
FROM system_menu WHERE parent_id = :parent_id AND del_flag = false;

SELECT permission FROM system_menu_btn WHERE permission LIKE 'business:goods:%';
```

- **NEVER** hardcode `menu_id = 123` without MCP (unless documented in header comment)

### Role

```sql
SELECT role_id, role_code FROM system_role WHERE role_code = 'admin' AND del_flag = false;
```

---

## Menu INSERT Example (subquery, no magic IDs)

```sql
WITH parent AS (
    SELECT menu_id FROM system_menu
    WHERE path = '/business' AND del_flag = false
    LIMIT 1
),
next_sort AS (
    SELECT COALESCE(MAX(m.sort), 0) + 1 AS sort_val
    FROM system_menu m, parent p
    WHERE m.parent_id = p.menu_id AND m.del_flag = false
),
new_menu AS (
    INSERT INTO system_menu (
        path, name, component, title, icon, sort, status, parent_id,
        keep_alive, del_flag, create_time
    )
    SELECT
        '/business/goods', 'BusinessGoods', '/business/goods/index', '商品管理', 'ri:shopping-bag-line',
        ns.sort_val, true, p.menu_id, true, false, NOW()
    FROM parent p, next_sort ns
    RETURNING menu_id
)
INSERT INTO system_menu_btn (menu_id, title, sort, status, permission, del_flag, create_time)
SELECT menu_id, '新增', 1, true, 'business:goods:create', false, NOW() FROM new_menu
UNION ALL
SELECT menu_id, '编辑', 2, true, 'business:goods:update', false, NOW() FROM new_menu
UNION ALL
SELECT menu_id, '删除', 3, true, 'business:goods:delete', false, NOW() FROM new_menu;
```

> `path`, `component`, `permission` **MUST** match `route.ts` and frontend auth exactly. UI labels may be Chinese; permission strings stay English pattern.

---

## Dictionary INSERT Example

```sql
INSERT INTO system_dict_type (dict_name, dict_type, status, del_flag, create_time)
VALUES ('商品状态', 'business_goods_status', true, false, NOW())
ON CONFLICT (dict_type) DO NOTHING;

INSERT INTO system_dict_data (dict_sort, dict_label, dict_value, dict_type, status, del_flag, create_time)
VALUES
    (1, '上架', '1', 'business_goods_status', true, false, NOW()),
    (2, '下架', '0', 'business_goods_status', true, false, NOW())
ON CONFLICT DO NOTHING;
```

> Use `WHERE NOT EXISTS` if no unique constraint for idempotency.

---

## Role-Menu Link Example

```sql
INSERT INTO system_role_menu (role_id, menu_id, menu_btn_id)
SELECT r.role_id, m.menu_id, b.btn_id
FROM system_role r
CROSS JOIN system_menu m
JOIN system_menu_btn b ON b.menu_id = m.menu_id
WHERE r.role_code = 'admin'
  AND m.path = '/business/goods'
  AND b.permission IN ('business:goods:create', 'business:goods:update', 'business:goods:delete');
```

---

## Permission String Convention

**MUST** match across `route.ts` `meta.permission`, frontend `auth.hasAuth`, and SQL:

```
{group}:{name}:{action}
```

Example: `business:goods:create`, `business:goods:list`

---

## Fallback Without MCP

1. Header: `⚠ Postgres MCP unavailable — verify parent_id / path before run`
2. Prefer subqueries on `system_menu.path`
3. List manual verification items in delivery notes
4. **Do NOT** read `server/database/sql/pg.sql` as a substitute — use schema files for structure only

---

## Related

- [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)
- [AI_MCP_SETUP.md](./AI_MCP_SETUP.md)