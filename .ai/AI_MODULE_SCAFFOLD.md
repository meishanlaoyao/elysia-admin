# Module Scaffold (CRUD Boilerplate Generator)

**Purpose:** Generate standard backend + admin CRUD skeleton from an **existing** Drizzle schema via CLI scripts in `server/`. Reduces token use and speeds up module work — AI then applies **incremental** changes only.

**Human-readable command details:** [docs/architecture/commands.md](../docs/architecture/commands.md#模块脚手架命令)

---

## When to Use

- Single main table, **standard CRUD** (create / list / detail / update / soft delete)
- Schema file exists: `server/database/schema/{group}_{name}.ts` (e.g. `business_goods.ts` for slug `business-goods`)
- Target directories **do not exist yet:**
  - `server/src/modules/{group}-{name}/`
  - `admin/src/views/{group}/{name}/` (and related types/api files)

---

## When NOT to Use

- Multi-table modules, junction-only tables, jsonb-heavy forms, custom non-CRUD routes
- Extending an **existing** module (edit files in place instead)
- Schema not created yet → follow [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md) and **ask developer** before DDL

---

## Commands (run from `server/`)

### Backend — `create:module`

Generates `route.ts`, `dto.ts`, `handle.ts` under `server/src/modules/{group}-{name}/`.

```bash
cd server
bun run create:module business-goods --tag 商品管理
```

| Option | Meaning |
|--------|---------|
| `--tag <name>` | **Required.** OpenAPI group label (Chinese OK) |
| `--schema business_goods` | Schema file name without `.ts` (default: slug → snake, e.g. `business-goods` → `business_goods`) |
| `--dry-run` | Preview only, no files written |

### Admin — `create:page`

Generates 5 files under `admin/src/` (script runs from `server/`, output goes to `../admin`):

```bash
cd server
bun run create:page business goods --tag 商品管理
```

| Option | Meaning |
|--------|---------|
| `--tag <name>` | **Required.** Page / module display name |
| `--schema business_goods` | Same as `create:module` |
| `--dry-run` | Preview only |

### Recommended sequence

```bash
cd server
bun run create:module business-goods --tag 商品管理
bun run create:page business goods --tag 商品管理
```

Slug `business-goods` → group `business`, name `goods` for `create:page`.

---

## What Gets Generated

| Area | Paths |
|------|--------|
| Backend | `server/src/modules/{group}-{name}/route.ts`, `dto.ts`, `handle.ts` |
| Types | `admin/src/types/api/{group}-{name}.d.ts` |
| API | `admin/src/api/{group}/{name}.ts` |
| Views | `admin/src/views/{group}/{name}/index.vue`, `modules/{name}-search.vue`, `modules/{name}-dialog.vue` |

Routes auto-register in dev — **do not** edit `modules/index.ts`.

**NOT generated:** dict rows, menu/handoff SQL, dynamic menu registration (DB-driven).

---

## After Scaffold — AI Scope

**DO (incremental):**

- `handle.ts` — business rules, validation, transactions, cache, non-trivial queries
- `index.vue` / `*-search.vue` / `*-dialog.vue` — column formatters, dict wiring, layout per [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md) / [AI_UI_LAYOUT.md](./AI_UI_LAYOUT.md)
- `server/database/sql/{module-name}-init.sql` — dict, menu, buttons, role permissions — [AI_HANDOFF_SQL.md](./AI_HANDOFF_SQL.md)
- Extend `dto.ts` only when validation rules differ from generated CrudDto

**DO NOT:**

- Regenerate full CRUD skeleton from [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md) when scaffold files already exist
- Rewrite `route.ts` / `api/*.ts` unless route shape must change
- Read reference modules `system-api/` or `system/user/` for boilerplate — read **generated files** + the one schema file instead

**Templates note:** Use `AI_CODE_EXAMPLES.md` for DTO edge cases or non-CRUD patterns only — not to replace scaffold output.

---

## Agent Mode

When the user asks for a new standard CRUD module and schema exists:

1. Propose or run (with permission) the two commands above from `server/`
2. Confirm files created (or use `--dry-run` first if unsure)
3. Continue workflow: dict → UI polish → handoff SQL

If schema is missing, stop and follow [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md) — do not run scaffold until table exists.

---

## Trigger Phrases

| Language | Examples |
|----------|----------|
| 中文 | `先用脚手架`, `create:module`, `schema 已有生成 CRUD 骨架`, `脚手架已生成` |
| English | `use module scaffold`, `run create:module`, `scaffold already generated` |

After scaffold, user may say: *「脚手架已跑，只补业务和排版」* → follow **After Scaffold — AI Scope** only.

---

## Related

- Main SOP: [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) (Step 2.5)
- Cursor Skill: `.cursor/skills/elysia-module-dev/SKILL.md`