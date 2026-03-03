# Architecture

- frontend-backend separated
- backend: modular monolith
- layered architecture
- strict separation of concerns
- dependency direction must be respected

---

# Admin (Vue3 + TypeScript)

admin/src/

api/
- api request layer only
- no business logic
- no direct fetch outside this folder

components/
- UI only
- no business logic
- no direct http request

store/
- state management only
- no direct http request
- no business logic

router/
- routing only
- no business logic

hooks/
- reusable composition logic only
- no business logic

types/
- type definitions only

Rules:
- no backend logic in frontend
- use existing api layer only
- no new state library
- no direct database access

---

# Server (Elysia + Bun)

server/src/

app.ts
- create Elysia instance only
- middleware registration only
- no business logic

index.ts
- bootstrap only
- no business logic

config/
- environment configuration only
- no business logic
- no database query
- no side effects

constants/
- constant definitions only

---

# Core Layer (Infrastructure Mechanisms)

core/

database/
- pg.ts (database connection only)
- redis.ts (redis connection only)
- redis-lock.ts (distributed lock only)
- repository.ts (generic CRUD only)
- transaction.ts (transaction control only)

cache.ts
- cache abstraction only

check.ts
- validation helpers only

result.ts
- response wrapper only

route-registry.ts
- dynamic route loading only

route.ts
- route interface definitions only

task-registry.ts
- task loading only

task.ts
- task interface only

Rules:
- infrastructure layer only
- no business logic
- no module-specific code

---

# Modules (Business Layer)

modules/{moduleName}/

dto.ts
- request validation only
- schema definition only

handle.ts
- business logic only
- use repository functions only
- no direct database driver usage

route.ts
- route definition only
- export IRouteModule only

Rules:
- one module per folder
- no cross-module import
- no infrastructure modification

--- 

# Infrastructure

infrastructure/

clients/
- external service clients only

storage/
- storage providers only
- no business logic

---

# Shared (Pure Utilities)

shared/

- pure reusable utilities only
- no business logic
- no database access
- no http handling
- no module dependency
- no side effects on import
- functions must be stateless
- dependency direction: modules → shared only

Files:
bcrypt.ts (password hash only)
jwt.ts (token sign/verify only)
logger.ts (logging only)
cron.ts (cron helpers only)
uuid.ts (id generation only)
time.ts (time helpers only)
color.ts (color helpers only)
ip.ts (ip helpers only)
htmltemplate.ts (html template only)
rescode.ts (response codes only)