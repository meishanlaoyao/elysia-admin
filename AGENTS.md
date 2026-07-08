# Elysia Admin — Codex Global Rules

> **Maintainer:** synced with [`.cursor/rules/general.mdc`](.cursor/rules/general.mdc) — edit both when changing global rules.
> **Cursor users:** canonical copy is `general.mdc`; this file avoids duplicating the full tree for token savings.

Full-stack admin: **Vue 3 + TypeScript** (`admin/`) + **Elysia + Bun** (`server/`). Structure: [`.ai/AI_STRUCTURE.md`](.ai/AI_STRUCTURE.md).

---

# Dependency Direction (Strict)

```
admin → server (HTTP only)
modules → core | shared | infrastructure
core/shared/infrastructure ✗→ modules
shared ✗→ core/database
```

---

# Generation Principles

1. Plan ≤5 lines → list files → minimal code
2. Patterns: backend → `.ai/AI_CODE_EXAMPLES_BACKEND.md`; frontend → `.ai/AI_CODE_EXAMPLES_FRONTEND.md` (**section only**)
3. No new deps; no unrelated refactors; ask before schema changes
4. **`dto.ts`:** validated fields need `error` with Chinese user-facing text (`error`, not `errorMessage`)

---

# Module Dev Triggers

- **Prefer** `.cursor/skills/elysia-module-dev/SKILL.md`; `AI_MODULE_WORKFLOW.md` only if ambiguous
- Standard CRUD → `AI_MODULE_SCAFFOLD.md` + `create:module` / `create:page`
- Layered rules: [`server/AGENTS.md`](server/AGENTS.md) (backend), [`admin/AGENTS.md`](admin/AGENTS.md) (frontend)

**Handoff SQL:** file only — developer runs manually. **Git:** read-only unless user asks.

---

# File Reading Discipline (Token Budget)

**Template routing:** backend → `AI_CODE_EXAMPLES_BACKEND.md`; frontend → `AI_CODE_EXAMPLES_FRONTEND.md`; index → `AI_CODE_EXAMPLES.md` (~40 lines). **Never** read both template files in full unless task needs both.

**Doc budget:** edit one file → target file only; scaffold done → generated files + schema only; full-stack → ≤3 `.ai` docs per turn.

**Never:** `node_modules/`, `dist/`, `pg.sql`, `server/src/core/`, scan all modules.

**After scaffold:** no `system-api/` / `system/user/` reference reads.

Full rules: [`.cursor/rules/general.mdc`](.cursor/rules/general.mdc)

---

# `.ai` Doc Index

| File | Purpose |
|------|---------|
| `AI_CODE_EXAMPLES.md` | Template index |
| `AI_CODE_EXAMPLES_BACKEND.md` / `_FRONTEND.md` | Code templates |
| `AI_MODULE_SCAFFOLD.md` | CRUD CLI |
| `AI_MODULE_WORKFLOW.md` | Full SOP |
| `AI_CONTEXT_CAPSULE.md` | Ops quick ref |

Full index: [`.ai/README.md`](.ai/README.md)