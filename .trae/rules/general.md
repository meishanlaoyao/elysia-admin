---
description: 全局架构约束、依赖方向和文件读取纪律（任何文件均生效）
alwaysApply: true
---

# Project Overview

Full-stack admin system: **Vue 3 + TypeScript** frontend (Art Design Pro) + **Elysia + Bun** backend.

```
elysia-admin/
├── admin/src/        # Frontend (Vue 3)
└── server/src/       # Backend (Elysia + Bun)
    ├── modules/      # Business logic — one folder per module
    ├── core/         # Infrastructure (DO NOT modify)
    ├── shared/       # Pure utilities (stateless)
    └── infrastructure/ # External clients
```

---

# Dependency Direction (Strict)

```
admin → server (HTTP only)

modules → core
modules → shared
modules → infrastructure

core  ✗→ modules
shared ✗→ modules
infrastructure ✗→ modules
shared ✗→ core/database
```

---

# Generation Principles

1. Explain plan in **max 5 lines** before writing code
2. List files to create or modify
3. Generate **minimal** code — no extra abstraction
4. Follow existing patterns strictly (see `.ai/AI_CODE_EXAMPLES.md`)
5. Do NOT introduce new dependencies
6. Do NOT refactor unrelated files
7. Ask before modifying database schema
8. No over-engineering

---

# File Reading Discipline (Token Budget)

> The rules files and `.ai/AI_CODE_EXAMPLES.md` already contain everything needed.
> Read actual source files **only when strictly necessary**.

**Supplement (tooling / ops, not code templates):** when the task involves built-in UI paths, Postgres MCP read-only scope, hand-off SQL for the developer to run, dict/menu alignment, or permission checklists — read `.ai/AI_CONTEXT_CAPSULE.md` **only if needed**; it does **not** replace `AI_CODE_EXAMPLES.md`.

**NEVER read these (ever):**
- `node_modules/`
- `dist/` or `build/`
- `admin/src/components/core/` (unless fixing a core component bug)
- `server/src/core/` (unless the task explicitly touches infrastructure)
- `database/schema/` other than the one table directly used in current task

**Read at most ONE reference module/page** when creating something new:
- Backend new module → read only `server/src/modules/system-api/` as reference
- Frontend new page → read only `admin/src/views/system/user/` as reference

**When modifying existing code:**
- Read only the specific file being modified
- Read direct imports only if their type signatures are needed

**Do NOT:**
- Scan entire directories to "understand the project"
- Read all modules to find a pattern — use `.ai/AI_CODE_EXAMPLES.md` instead
- Read `core/repository.ts` unless you need an obscure function not in the examples

---

# `.ai` 文档索引（与 Cursor 规则同源）

- **`AI_CODE_EXAMPLES.md`**：代码模板与实现模式的首选事实来源（实现 CRUD、路由、前后端对齐时优先查阅）。
- **`AI_CONTEXT_CAPSULE.md`**：MCP、内置 UI 路径、手执 SQL、菜单/权限/字典等运维向补充，按需阅读。
- 其他：`AI_MODULE_STANDARD.md`、`AI_FRONTEND_RULES.md`、`AI_STRUCTURE.md`、`AI_DEPENDENCY.md`、`AI_GENERATION.md`、`AI_FEATURE_TEMPLATE.md` — 与专题相关时再打开，避免通读。
