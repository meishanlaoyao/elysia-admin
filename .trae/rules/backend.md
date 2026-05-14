---
description: 后端模块规范（Elysia + Bun），包含文件结构、repository 用法和完整代码模式
globs: server/src/**/*.ts
alwaysApply: false
---

# Backend Module Structure

Every module under `server/src/modules/{group}-{name}/` must contain exactly:

```
modules/{group}-{name}/
    dto.ts      ← validation only
    handle.ts   ← business logic only
    route.ts    ← HTTP mapping only
    task.ts     ← scheduled task functions (required, can be empty)
```

No extra files. No renaming. Route auto-registers on startup.

---

# Layer Rules (Strict)

| File | Allowed | Forbidden |
|---|---|---|
| `dto.ts` | schema definition, type definition | business logic, DB access, calling handle |
| `handle.ts` | repository functions, QueryBuilder, shared utils, infrastructure clients | raw SQL, direct pg access, Elysia instance, cross-module import |
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

# CrudDto (dto.ts shortcut)

```ts
import { CrudDto } from '@/types/dto';
import { InsertXxx, SelectXxx } from "@database/schema/xxx";

export const CreateDto = CrudDto.create(InsertXxx, SelectXxx, ['requiredField1', 'requiredField2']);
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

# File Reading Rules for Backend Tasks

- **New module**: read only `server/src/modules/system-api/` as reference, then use templates above
- **Modify module**: read only the specific file being changed
- **Need schema**: read only `database/schema/{table}.ts` for the table used
- **Need repository signature**: check the list above first; read `core/database/repository.ts` only if not listed
- **DO NOT** read other modules, core layer, or infrastructure unless explicitly required
