# Dependency Direction (Strict)

admin → server (via http only)

modules → core
modules → shared
modules → infrastructure
modules → other modules' exported `handle.ts` functions (PascalCase cross-module API only)

modules must NOT import another module's `@database/schema` for cross-table access
(use the owning module's exported handle function instead)

core must NOT depend on modules
shared must NOT depend on modules
infrastructure must NOT depend on modules

shared must NOT import core/database
shared must NOT import modules

core must NOT import modules

---

# Protected Layer (DO NOT MODIFY)

- core/database/*
- core/repository.ts
- core/transaction.ts
- core/route-registry.ts
- core/task-registry.ts

Do not:
- rewrite CRUD abstraction
- introduce new ORM
- replace repository layer
- change route registration mechanism
- refactor infrastructure layer