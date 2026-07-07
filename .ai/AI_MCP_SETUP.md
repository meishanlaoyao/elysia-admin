# MCP Setup Recommendations

Configure these in Cursor or any MCP-capable IDE before module development. AI **MUST** prefer MCP read-only verification over guessing IDs or dict rows.

**Runtime DB facts (dict, menu, permissions):** Postgres MCP read-only **first**. **NEVER** read `server/database/sql/pg.sql` — backup file; may not match live DB.

---

## Required: Postgres (`user-postgres`)

**Read-only uses:**

- Verify tables and columns vs schema files
- Query `system_dict_type` / `system_dict_data` for business dict
- Query `system_menu` for parent `menu_id`, `MAX(sort)`, duplicate `permission`
- Query `system_role` for `system_role_menu` inserts

**Forbidden:**

- MCP for DDL, migrations, or business writes
- MCP replacing drizzle schema as source of truth

**When MCP unavailable — AI MUST:**

- State: "Postgres MCP not connected — verify menu/dict IDs before running SQL"
- Prefer `SELECT ... INTO` / CTE subqueries in handoff SQL
- Still write full file to `server/database/sql/`

---

## Recommended: Chrome DevTools (`user-chrome-devtools`)

**Optional uses:**

- Smoke-test list/dialog layout after frontend work
- Verify permission button visibility

**Non-blocking** for backend or SQL generation.

---

## Suggested Order

```
1. Postgres MCP → tables / dict / menu
2. Code (backend → frontend)
3. server/database/sql/{module}-init.sql
4. (Optional) Chrome DevTools → UI check
```

---

## Related

- [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md)
- [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md)