# Code Generation Rules

When generating code:

1. explain plan in max 5 lines
2. list files to create or modify
3. do not refactor unrelated files
4. do not modify folder structure
5. do not introduce new dependency
6. generate minimal code
7. follow existing patterns strictly
8. ask before modifying database schema
9. use existing repository functions only
10. no over-engineering
11. soft-delete-safe uniqueness (checks include soft-deleted rows; new unique → partial index `WHERE del_flag = false`)
12. form validation on both sides (frontend `rules` + backend `dto.ts` with Chinese `error`)
13. every exported `handle.ts` function needs JSDoc (purpose, `@param`, `@returns`; non-trivial flows list numbered steps)
14. **Rule-file language:** when adding or editing prose in English AI rule docs (`.ai/`, `.cursor/rules/`, synced IDE rules), write in **English**. Scope = this edit only — do **not** bulk-translate existing Chinese paragraphs. Chinese is OK only for product copy (`dto`/`form` `error`, UI labels, `dict_name`/`dict_label`) and listed Chinese trigger phrases. Code-side identifiers (`dict_type`, `permission`, `path`, `component`, `name`) stay English.
15. **`dict_type` naming:** short semantic English `snake_case` (prefer 2–3 segments, ≤32 chars); prefer `{entity}_{attr}` (`goods_status`); reuse via MCP; **do not** create a dict for pure boolean enable/disable — see [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md)

---

# Backend Rules

- always use repository functions
- do not use raw SQL directly
- do not access pg.ts directly
- no business logic in route.ts
- no database logic in dto.ts
- always return unified result format
- never read or modify `server/database/sql/pg.sql` (backup snapshot only)
- response DTO must declare join/assembled fields or they are stripped
- entity dropdowns use cached `/options` endpoint — never paginated `/list`

---

# Frontend Rules

- use api/ folder for http
- no business logic in components
- no direct fetch
- no direct store mutation outside store
- follow existing typing patterns
- form `rules` must align with backend `dto.ts` constraints and Chinese tips
- entity dropdowns use `/options` API — never `/list`
