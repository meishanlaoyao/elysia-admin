# Backend Module Structure

**Module scaffold (standard CRUD):** from `server/` run `bun run create:module {group-name} --tag "..."` — generates `route.ts`, `dto.ts`, `handle.ts`. See `.ai/AI_MODULE_SCAFFOLD.md`.

| Command | cwd | Purpose |
|---------|-----|---------|
| `bun run create:module {slug} --tag "..."` | `server/` | Backend CRUD skeleton |
| `bun run create:page {group} {name} --tag "..."` | `server/` | Admin types + api + views (output to `../admin`) |

Every module under `server/src/modules/{group}-{name}/` should contain:

```
modules/{group}-{name}/
    dto.ts      ← Elysia 校验 + 路由片段（body/query/response 等）；必要时可含 `afterHandle` 等 hook
    handle.ts   ← business logic only
    route.ts    ← HTTP mapping only
    task.ts     ← 供 BullMQ / 沙箱 worker 调度的导出函数（按需添加；无任务可不建此文件）
```

No extra files. No renaming. Route auto-registers on startup.

**`task.ts`**：仅当模块需要向 `server/src/worker-sandbox/` 注册队列/定时任务时添加。

**跨模块 `handle`（跨表数据访问）：**

- 每个模块只能直接查询**自己拥有**的表 schema。
- 需要访问其他模块的表时，必须调用**表所属模块** `handle.ts` 导出的 PascalCase 函数 — **禁止**直接 `import` 该模块的 `@database/schema` 跨表查询。
- 路由处理函数 = 小写驼峰（`create`、`findList`）；跨模块导出函数 = 首字母大写驼峰（`GetUserBy`、`GetDeptInfoById`）。
- 若所需函数尚不存在，先在所属模块 `handle.ts` 中实现并导出，再在调用方 `import`。
- 新业务模块优先单模块内聚，避免网状依赖。

---

# Layer Rules (Strict)

| File | Allowed | Forbidden |
|---|---|---|
| `dto.ts` | Elysia schema、响应 DTO、可选 `afterHandle` 等 hook | 复杂业务编排、直接 DB |
| `handle.ts` | 本模块 schema + repository、QueryBuilder、shared、infrastructure；其他模块已导出的 handle 函数 | raw SQL、直连 pg、在 handle 里 new Elysia、为跨表查询直接 import 其他模块的 `@database/schema` |
| `route.ts` | bind dto+handle, return result | business logic, DB access |
| `task.ts` | export plain functions, call handle functions | duplicate business logic, direct DB access |

---

# Repository Functions (from `@/core/database/repository`)

```ts
InsertOne(schema, ctx)                          // insert, no return
InsertOneAndRes(schema, ctx)                    // insert, return record
InsertMany(schema, ctx, dataArray)              // bulk insert
FindOneByKey(schema, 'primaryKey', value)       // find by key
FindAll(schema, whereSQL, options?)             // find all (no pagination)
FindPage(schema, whereSQL, paginationOptions)   // paginated query
UpdateByKey(schema, 'primaryKey', ctx)          // update by key
UpdateByKeyAndRes(schema, 'primaryKey', ctx)    // update, return record
SoftDeleteByKeys(schema, 'primaryKey', ctx)     // soft delete (sets delFlag=true)
HardDelete(schema, whereSQL)                    // permanent delete
HardDeleteByKeys(schema, 'primaryKey', values) // permanent delete by keys
FindAllWithJoin(schema, builder, options?)      // find all with join
FindPageWithJoin(schema, builder, options)      // paginated with join
```

# QueryBuilder (chain syntax)

```ts
const where = CreateQueryBuilder(xxxSchema)
    .eq('delFlag', false)     // exact match — skip if value is undefined/null/''
    .like('name', name)       // %name% fuzzy
    .ilike('title', title)    // case-insensitive fuzzy
    .ne('type', 'x')          // not equal
    .in('statusId', [1,2])    // IN array
    .gt('amount', 0)          // greater than
    .gte('score', 60)         // greater than or equal
    .lt('age', 18)            // less than
    .dateRange('createTime', startTime, endTime)  // date range
    .isNull('deletedAt')      // IS NULL
    .isNotNull('approvedAt')  // IS NOT NULL
    .build()                  // returns SQL | undefined
```

# Response Format

```ts
return BaseResultData.ok()           // success, no data
return BaseResultData.ok(data)       // success with data
return BaseResultData.fail(500, err) // error
return BaseResultData.fail(404)      // not found
```

---

# DTO Validation Error Messages (Required)

`dto.ts` validation fields **MUST** include `error: '...'` with a readable Chinese user-facing message. Without it, `error-handler` returns JSON instead of readable text to the frontend.

| Scenario | Rule |
|---|---|
| Required body fields (non-`t.Optional`) | `error: '${description}不能为空'` |
| Constrained fields (`minLength` / `format` / `minimum` etc.) | Semantic `error`, e.g. `'用户名格式错误'` |
| List query `t.Optional` fields | `error` optional (omitted values skip validation) |
| Property name | Use **`error`**, never `errorMessage` |

Reference: `server/src/modules/auth/dto.ts`, `server/src/modules/system-user/dto.ts`.

---

# CrudDto (dto.ts shortcut)

```ts
import { CrudDto } from '@/types/dto';
import { InsertXxx, SelectXxx } from "@database/schema/xxx";

export const CreateDto = CrudDto.create(
    InsertXxx,
    SelectXxx,
    ['requiredField1', 'requiredField2'],
    { requiredField1: '字段1', requiredField2: '字段2' },  // fieldLabels → 自动生成 error
);
export const UpdateDto = CrudDto.update(SelectXxx, 'xxxId');
export const ListDto   = CrudDto.list(SelectXxx, { extraField: t.Optional(t.String()) });
```

---

# Route meta options

```ts
meta: {
    isAuth: true,           // requires login
    isLog: true,            // log operation
    permission: 'group:name:action',  // permission code
    ipRateLimit: '60:10',   // 10 requests per 60 seconds
}
```

---

# Schema sync (db:push)

After creating or editing files under `server/database/schema/`:

1. Check `.ai/dev-preferences.local.md` for `db_push: allowed`
2. If allowed → run `bun run db:push` in `server/` and report result
3. If not set → ask developer once whether AI may run `db:push`; on yes, write preference file then run
4. If developer declines → remind them to run manually; do not run

**Handoff SQL (`server/database/sql/*-init.sql`):** generate file only. **NEVER** run via scripts, MCP write/execute, psql, or ad-hoc code.

**DB facts (dict/menu/runtime data):** Postgres MCP read-only **first**; then `server/database/schema/`. **NEVER read** `server/database/sql/pg.sql` (stale backup).

---

# File Reading Rules for Backend Tasks

- **New module**: read only `server/src/modules/system-api/` as reference, then use templates above
- **Modify module**: read only the specific file being changed
- **Need schema**: read only `database/schema/{table}.ts` for the table used
- **Need repository signature**: check the list above first; read `core/database/repository.ts` only if not listed
- **DO NOT** read other modules, core layer, or infrastructure unless explicitly required