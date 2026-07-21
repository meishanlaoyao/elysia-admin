# Backend Architecture Contract (STRICT)

This project follows:

- modular monolith
- layered architecture
- strict separation of concerns
- unified repository abstraction
- dynamic route registry
- unified result wrapper

DO NOT redesign architecture.
DO NOT introduce new abstraction layers.
DO NOT modify core infrastructure.

---

# Module Standard Structure (MANDATORY)

Every business module MUST contain exactly four core files:

modules/{moduleName}/
    dto.ts
    handle.ts
    route.ts
    task.ts

Do not add extra files unless explicitly required.
Do not rename files.
Do not change folder structure.

---

# dto.ts (Validation Layer)

Responsibility:
- Define request validation schema
- Define DTO types
- Transform input data only

Allowed:
- schema definition
- type definition
- input transform

Forbidden:
- business logic
- database access
- repository usage
- calling handle
- http handling
- importing core/database
- importing repository

dto.ts must be pure and side-effect free.

**Validation error (required):** every validated field in `dto.ts` must include `error: '中文提示'` (use `error`, not `errorMessage`). Required body fields: `'${description}不能为空'`; constrained fields: semantic messages like `'用户名格式错误'`. Without `error`, the frontend receives JSON instead of readable text. List query `t.Optional` fields may omit `error`.

---

# handle.ts (Business Layer)

Responsibility:
- Implement business logic
- Use repository abstraction
- Call shared utilities
- Call infrastructure clients

Allowed:
- repository functions
- QueryBuilder
- shared utilities
- infrastructure clients
- transaction wrapper
- import exported functions from other modules' `handle.ts` (see Cross-Table Data Access below)

Forbidden:
- direct pg usage
- raw SQL
- Elysia instance usage
- route definition
- modifying core layer
- importing another module's `@database/schema` for cross-table queries

All database operations MUST use existing repository functions.

Do NOT introduce new ORM.
Do NOT rewrite repository.
Do NOT replace QueryBuilder.

---

# Cross-Table Data Access (STRICT)

When a module needs data from a table owned by another module:

1. **Table ownership:** each module may directly `import` and query only its own table schemas (e.g. `system-user` owns tables in `system_user.ts`).
2. **Cross-table access:** to read or write another module's table, do **NOT** import that table's schema in your `handle.ts`. Instead, call an exported function from the owning module's `handle.ts`: `import { GetXxx } from '@/modules/{owner}/handle'`.
3. **Naming convention:**
   - Route handler functions (internal) = lower camelCase (`create`, `findList`, `update`, `remove`)
   - Cross-module exported functions (public API) = PascalCase (`GetUserBy`, `GetDeptInfoById`, `RegisterUser`)

Correct (consumer — e.g. `system-user/handle.ts`):

```ts
import { GetDeptInfoById } from '@/modules/system-dept/handle';

const dept = await GetDeptInfoById(user.deptId);
```

Wrong (consumer directly imports another module's schema):

```ts
import { systemDeptSchema } from '@database/schema/system_dept';

const dept = await FindOneByKey(systemDeptSchema, 'deptId', user.deptId);
```

Owner module (e.g. `system-dept/handle.ts`) exports PascalCase helpers:

```ts
export async function GetDeptInfoById(deptId: string) {
    return FindOneByKey(systemDeptSchema, 'deptId', deptId);
}
```

If the required helper does not exist yet, add it in the **owning** module's `handle.ts` first, then import it from the consumer.

---

# route.ts (HTTP Mapping Layer)

Responsibility:
- Define HTTP routes
- Bind dto and handle
- Export IRouteModule

Allowed:
- parameter validation
- call handle
- wrap result using unified result format

Forbidden:
- business logic
- database access
- repository usage
- complex logic
- modifying infrastructure

route.ts must be thin and declarative.

---

# task.ts (Scheduled Task Layer)

Responsibility:
- Define scheduled tasks
- Export ITaskModule

Allowed:
- call handle functions
- define cron expression

Forbidden:
- business logic duplication
- direct database access
- route registration
- http handling

Task logic must reuse handle functions when possible.

---

# Core Layer Protection (DO NOT MODIFY)

The following are protected:

core/database/*
core/repository.ts
core/transaction.ts
core/route-registry.ts
core/task-registry.ts
core/result.ts

Never:
- refactor core layer
- redesign route loading mechanism
- redesign task registry
- replace repository abstraction
- introduce new database layer

---

# Shared Layer Rules

shared/
- pure utility functions only
- no business logic
- no database access
- no http handling
- no module dependency
- no side effects on import
- functions must be stateless

Dependency direction:
modules → shared only

shared must NOT import modules.
shared must NOT import core/database.

---

# Infrastructure Layer Rules

infrastructure/
- external service clients only
- storage providers only
- no business logic

modules may call infrastructure.
infrastructure must NOT depend on modules.

---

# Unified Result Contract

All HTTP responses must use unified result wrapper.

Do not return raw objects.
Do not return raw arrays.
Do not change response structure.

---

# Repository Usage Rules

Always:
- use existing CRUD abstraction
- use QueryBuilder
- use transaction wrapper if needed

Never:
- write raw SQL directly
- access pg.ts directly
- create new repository abstraction
- introduce ORM

---

# Module Creation Rules

When generating a new module:

1. Create folder under modules/{moduleName}
2. Create exactly four files:
   - dto.ts
   - handle.ts
   - route.ts
   - task.ts
3. Put business logic only in handle.ts
4. dto.ts must contain validation only
5. route.ts must be thin
6. task.ts must reuse handle logic
7. Follow existing export pattern strictly
8. Do not modify other modules
9. Do not modify core layer

Always follow existing module pattern.
Never redesign structure.

---

# AI Behavior Rules

When generating code:

1. Explain plan in max 5 lines
2. List files to create or modify
3. Do not refactor unrelated files
4. Do not modify folder structure
5. Do not introduce new dependency
6. Generate minimal code
7. Follow existing naming conventions
8. Ask before modifying database schema
9. No over-engineering
10. Respect dependency direction strictly

If conflict exists between this document and existing project pattern,
always follow existing project pattern.