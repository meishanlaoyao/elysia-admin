# Backend Code Examples (Copy These)

Copy patterns exactly. Do NOT invent new patterns.

**Index only:** [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md) — do not read both frontend and backend files unless the task needs both.

---

## dto.ts — Validation error (Required)

`dto.ts` 中带校验的字段**必须**包含 `error: '中文提示'`（用 `error`，禁止 `errorMessage`）。否则全局 `error-handler` 返回给前端的 `msg` 会是 JSON 结构而非可读文字。参考 `server/src/modules/auth/dto.ts`。

| 场景 | 要求 |
|------|------|
| 必填 body 字段 | `error: '${description}不能为空'` |
| 带约束字段（`minLength`/`format`/`minimum` 等） | 语义化 `error`，如 `'用户名格式错误'` |
| List 查询 `t.Optional` 字段 | 可不写 `error` |

## dto.ts — Using CrudDto (Preferred)

```ts
import { t } from 'elysia';
import { InsertXxx, SelectXxx } from "@database/schema/xxx";
import { CrudDto } from '@/types/dto';

// Create DTO: required fields + fieldLabels（脚手架自动生成；手写时传入 label 以生成 error）
export const CreateDto = CrudDto.create(
    InsertXxx,
    SelectXxx,
    ['fieldA', 'fieldB'],
    { fieldA: '字段A', fieldB: '字段B' },
    { fieldA: 'string', fieldB: 'number' },
);

// Update DTO: specify primary key field name
export const UpdateDto = CrudDto.update(SelectXxx, 'xxxId');

// List DTO: add extra query fields beyond pageNum/pageSize/orderBy/time-range
export const ListDto = CrudDto.list(
    SelectXxx,
    {
        fieldA: t.Optional(t.String({ description: "字段A" })),
        fieldB: t.Optional(t.String({ description: "字段B" })),
    }
);
```

## dto.ts — Manual body definition (when CrudDto is not enough)

```ts
import { t } from 'elysia';
import { BaseResultDto, BaseListQueryDto } from '@/types/dto';

export const CreateDto = {
    body: t.Object({
        name: t.String({ description: '名称', minLength: 1, error: '名称不能为空' }),
        price: t.Number({ description: '价格', minimum: 0, error: '价格不能小于0' }),
        status: t.Optional(t.Boolean({ description: '状态' })),
        remark: t.Optional(t.String({ description: '备注' })),
    }),
    ...BaseResultDto(t.Object({ xxxId: t.Number() })),
};

export const ListDto = {
    query: BaseListQueryDto({
        name: t.Optional(t.String({ description: '名称' })),
        status: t.Optional(t.Boolean({ description: '状态' })),
    }),
};
```

## dto.ts — Response DTO completeness (Required)

Elysia filters the response by the `response` schema. **Fields missing from the response DTO are stripped** — the frontend never receives them.

| Scenario | Rule |
|----------|------|
| Plain CRUD (`SelectXxx` only) | `CrudDto.create/update/list/findOne` is fine |
| Join / aggregate / assembled fields | Must extend response, e.g. `t.Composite([SelectXxx, t.Object({ deptName: t.Optional(t.String()) })])` |
| Changed `handle.ts` return shape | **MUST** sync the matching dto `response` in the same change |
| Unsure about full shape | Prefer omitting response DTO for that route over shipping an incomplete one |

```ts
import { t } from 'elysia';
import { BaseResultListDto, BaseListQueryDto } from '@/types/dto';
import { SelectXxx } from '@database/schema/xxx';

// Good — join field declared in response
export const ListDto = {
    query: BaseListQueryDto({ /* 查询字段 */ }),
    ...BaseResultListDto(
        t.Composite([
            SelectXxx,
            t.Object({ deptName: t.Optional(t.String({ description: '部门名称' })) }),
        ]),
    ),
};

// Bad — SelectXxx alone strips deptName before it reaches the frontend
export const ListDto = CrudDto.list(SelectXxx);
```

When the frontend reports "field missing", check the response DTO first.

---

## handle.ts — Standard CRUD

> 未捕获异常由全局 `app.onError` 统一记录 stack 并返回 500；业务错误直接 `return BaseResultData.fail(4xx, msg)`，不要在路由 handler 里写通用 try/catch。
>
> **JSDoc required:** every exported function needs a one-line purpose, `@param`, `@returns`. Non-trivial flows (transaction, cache invalidation, cross-module calls) list numbered steps in the comment.

```ts
import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll,
} from '@/core/database/repository';
import { xxxSchema } from '@database/schema/xxx';

/**
 * 创建记录
 * @param ctx 请求上下文，body 见 CreateDto
 * @returns BaseResultData.ok()
 */
export async function create(ctx: Context) {
    await InsertOne(xxxSchema, ctx);
    return BaseResultData.ok();
}

/**
 * 分页查询列表（排除软删）
 * @param ctx 请求上下文，query 见 ListDto
 * @returns BaseResultData.ok({ list, total })
 */
export async function findList(ctx: Context) {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn = 'createTime',
        sortRule = 'desc',
        startTime,
        endTime,
        fieldA,
        fieldB,
    } = ctx.query;
    const whereCondition = CreateQueryBuilder(xxxSchema)
        .eq('delFlag', false)
        .like('fieldA', fieldA)
        .eq('fieldB', fieldB)
        .dateRange('createTime', startTime, endTime)
        .build();
    const res = await FindPage(xxxSchema, whereCondition, {
        pageNum,
        pageSize,
        orderByColumn,
        sortRule,
    });
    return BaseResultData.ok(res);
}

/**
 * 按主键查询详情（软删视为不存在）
 * @param ctx 请求上下文，params.id 为主键
 * @returns BaseResultData.ok(data) 或 fail(404)
 */
export async function findOne(ctx: Context) {
    const id = Number(ctx.params.id);
    const data = await FindOneByKey(xxxSchema, 'xxxId', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
}

/**
 * 按主键更新
 * @param ctx 请求上下文，body 见 UpdateDto
 * @returns BaseResultData.ok()
 */
export async function update(ctx: Context) {
    await UpdateByKey(xxxSchema, 'xxxId', ctx);
    return BaseResultData.ok();
}

/**
 * 软删除（设置 delFlag=true）
 * @param ctx 请求上下文，params.ids 为主键（可批量）
 * @returns BaseResultData.ok()
 */
export async function remove(ctx: Context) {
    await SoftDeleteByKeys(xxxSchema, 'xxxId', ctx);
    return BaseResultData.ok();
}
```

## handle.ts — Uniqueness check (include soft-deleted rows)

Column-level `.unique()` still blocks re-insert after soft delete. Uniqueness checks in `handle.ts` **MUST** decide whether soft-deleted rows count, and return a readable Chinese message — **NEVER** silent failure or auto-rename.

```ts
import { Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
// FindAll / CreateQueryBuilder / InsertOne / BaseResultData — same as Standard CRUD above

/**
 * 创建商品
 * 流程：1) 校验编码唯一（含软删记录）2) 写入 3) 失效选项缓存
 * @param ctx 请求上下文，body 见 CreateDto
 * @returns BaseResultData.ok() 或 fail(400, 中文提示)
 */
export async function create(ctx: Context) {
    const { code } = ctx.body;
    const dupWhere = CreateQueryBuilder(xxxSchema).eq('code', code).build();
    const existing = await FindAll(xxxSchema, dupWhere, { limit: 1 });
    if (existing.length > 0) {
        const tip = existing[0].delFlag
            ? '该编码已被占用（存在已删除记录）'
            : '该编码已存在';
        return BaseResultData.fail(400, tip);
    }
    await InsertOne(xxxSchema, ctx);
    await Del(CacheEnum.BASE_OPTIONS + 'xxx');
    return BaseResultData.ok();
}
```

For **new tables**, prefer partial unique indexes (`WHERE del_flag = false`) instead of column `.unique()` — see [AI_SCHEMA_GUIDE.md](./AI_SCHEMA_GUIDE.md). Changing existing unique indexes is a schema change: ask the developer first; put DDL in handoff SQL only.

## handle.ts — Options endpoint + cache

Dropdown / select data **MUST** use a dedicated cached endpoint — **NEVER** the paginated `/list` with a large `pageSize`.

Reference pattern: `system-dict` (`/system/dict/data/all` + `WithCache` + `Del` on write).

```ts
import { WithCache } from '@/core/cache';
import { Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';

/**
 * 下拉选项（缓存）
 * @returns BaseResultData.ok([{ label, value }, ...])
 */
export async function findOptions() {
    const data = await WithCache(CacheEnum.BASE_OPTIONS + 'xxx', async () => {
        const where = CreateQueryBuilder(xxxSchema).eq('delFlag', false).build();
        // FindAll only supports orderByColumn / sortRule / limit — no column projection; slim via map
        const rows = await FindAll(xxxSchema, where, {
            orderByColumn: 'sort',
            sortRule: 'asc',
        });
        return rows.map((r) => ({ label: r.name, value: r.xxxId }));
    });
    return BaseResultData.ok(data);
}

// create / update / remove 成功后：
await Del(CacheEnum.BASE_OPTIONS + 'xxx');
```

1. Prefer `CacheEnum.BASE_OPTIONS + 'xxx'` (existing prefix) or add a dedicated key in `server/src/constants/enum.ts`
2. Route: `GET /group/xxx/options` → `findOptions` (not `/list`)
3. Invalidate cache after create / update / remove

This is an **explicit exception** to "no default Redis for CRUD boilerplate".

```ts
// Prefer existing prefix
await WithCache(CacheEnum.BASE_OPTIONS + 'xxx', async () => { /* ... */ });
await Del(CacheEnum.BASE_OPTIONS + 'xxx');
```
### QueryBuilder chaining reference

```ts
CreateQueryBuilder(xxxSchema)
    .eq('status', true)          // exact match (skips if undefined/null/'')
    .ne('type', 'excluded')      // not equal
    .like('name', name)          // %name% fuzzy match
    .ilike('title', title)       // case-insensitive fuzzy match
    .in('typeId', [1,2,3])       // IN array
    .dateRange('createTime', startTime, endTime)  // date range
    .gt('amount', 0)             // greater than
    .isNull('deletedAt')         // IS NULL
    .build()
```

---

## handle.ts — Cross-Table Data Access (Correct vs Wrong)

When a module needs data from a table owned by another module, call the owning module's exported PascalCase function — do **NOT** import that table's schema.

```ts
// Correct — consumer (e.g. system-user/handle.ts)
import { GetDeptInfoById } from '@/modules/system-dept/handle';

export async function findOne(ctx: Context) {
    const user = await FindOneByKey(systemUserSchema, 'userId', ctx.params.id);
    const dept = await GetDeptInfoById(user.deptId);
    return BaseResultData.ok({ ...user, dept });
}

// Wrong — directly importing another module's schema
import { systemDeptSchema } from '@database/schema/system_dept';

const dept = await FindOneByKey(systemDeptSchema, 'deptId', user.deptId);
```

Owner module exports PascalCase helpers:

```ts
// system-dept/handle.ts
export async function GetDeptInfoById(deptId: string) {
    return FindOneByKey(systemDeptSchema, 'deptId', deptId);
}
```

Route handlers stay lower camelCase (`create`, `findList`); cross-module exports use PascalCase (`GetUserBy`, `GetDeptInfoById`).

---

## route.ts — Declarative Route Module

```ts
import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, remove, update } from './handle';
import { CreateDto, ListDto, UpdateDto } from "./dto";

const XxxModule: IRouteModule = {
    tags: '模块名称',
    routes: [
        {
            url: '/group/xxx',
            method: 'post',
            summary: '创建',
            dto: CreateDto,
            handle: create,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:create' }
        },
        {
            url: '/group/xxx/list',
            method: 'get',
            summary: '查询列表',
            dto: ListDto,
            handle: findList,
            meta: { isAuth: true, permission: 'group:xxx:query' }
        },
        {
            url: '/group/xxx/:id',
            method: 'get',
            summary: '查询详情',
            handle: findOne,
            meta: { isAuth: true, permission: 'group:xxx:query' }
        },
        {
            url: '/group/xxx',
            method: 'put',
            summary: '更新',
            dto: UpdateDto,
            handle: update,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:update' }
        },
        {
            url: '/group/xxx/:ids',
            method: 'delete',
            summary: '删除',
            handle: remove,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:delete' }
        },
    ]
};

export default XxxModule;
```

---

## task.ts — Scheduled Task Functions

task.ts exports plain functions. The function name must match the `jobName` stored in the database.

```ts
import { logger } from "@/shared/logger";
// import handle functions if business logic is needed
// import { findList } from "./handle";

export function xxxDailySync(args?: string) {
    logger.info(`xxxDailySync 执行, args: ${args}`);
    // call handle functions here, do NOT duplicate business logic
}

export function xxxCleanup() {
    logger.info('xxxCleanup 执行');
}
```