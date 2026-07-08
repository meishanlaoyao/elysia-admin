# Code Examples Index (Token-Optimized)

**Do NOT read this index as a code template.** Open only the file and section matching your task.

| Task | Read |
|------|------|
| Backend (`dto` / `handle` / `route` / `task`) | [AI_CODE_EXAMPLES_BACKEND.md](./AI_CODE_EXAMPLES_BACKEND.md) — matching section only |
| Frontend (types / api / views / dict) | [AI_CODE_EXAMPLES_FRONTEND.md](./AI_CODE_EXAMPLES_FRONTEND.md) — matching section only |
| Full-stack module | Each side **on demand** — never read both files in full by default |

Ops/tooling (MCP, handoff SQL, dict checklists): [AI_CONTEXT_CAPSULE.md](./AI_CONTEXT_CAPSULE.md) — only when relevant.

Module workflow: prefer Skill `.cursor/skills/elysia-module-dev/`; [AI_MODULE_WORKFLOW.md](./AI_MODULE_WORKFLOW.md) only when scope is ambiguous.

---

## Backend sections ([AI_CODE_EXAMPLES_BACKEND.md](./AI_CODE_EXAMPLES_BACKEND.md))

| Section | When |
|---------|------|
| `dto.ts — Validation error` | Any validated `dto.ts` field |
| `dto.ts — Using CrudDto` | Standard CRUD create/list/update DTO |
| `dto.ts — Manual body` | Non-CrudDto or custom validation |
| `handle.ts — Standard CRUD` | Module business logic |
| `route.ts` | Route binding |
| `task.ts` | Queue/cron exports |

## Frontend sections ([AI_CODE_EXAMPLES_FRONTEND.md](./AI_CODE_EXAMPLES_FRONTEND.md))

| Section | When |
|---------|------|
| `types/api/{module}.d.ts` | API types |
| `api/{group}/{module}.ts` | HTTP client |
| `useDictStore` | Dict-backed columns/forms |
| `index.vue` | List page |
| `xxx-search.vue` | Search bar |
| `xxx-dialog.vue` | Create/edit dialog |

---

## Naming Convention Quick Reference

| Element | Pattern | Example |
|---|---|---|
| Backend module folder | `{group}-{name}` | `business-goods` |
| Backend permission | `{group}:{name}:{action}` | `business:goods:create` |
| Backend primary key | `{name}Id` | `goodsId` |
| Frontend type namespace | `Api.{Group}{Name}` | `Api.BusinessGoods` |
| Frontend API function | `fetch{Action}{Name}` | `fetchCreateGoods` |
| Frontend page | `views/{group}/{name}/index.vue` | `views/business/goods/index.vue` |
| Frontend search | `{name}-search.vue` | `goods-search.vue` |
| Frontend dialog | `{name}-dialog.vue` | `goods-dialog.vue` |
| Frontend type file | `types/api/{group}-{name}.d.ts` | `types/api/business-goods.d.ts` |