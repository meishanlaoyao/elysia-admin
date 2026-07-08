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

---

## handle.ts — Standard CRUD

> 未捕获异常由全局 `app.onError` 统一记录 stack 并返回 500；业务错误直接 `return BaseResultData.fail(4xx, msg)`，不要在路由 handler 里写通用 try/catch。

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

export async function create(ctx: Context) {
    await InsertOne(xxxSchema, ctx);
    return BaseResultData.ok();
}

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

export async function findOne(ctx: Context) {
    const id = Number(ctx.params.id);
    const data = await FindOneByKey(xxxSchema, 'xxxId', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
}

export async function update(ctx: Context) {
    await UpdateByKey(xxxSchema, 'xxxId', ctx);
    return BaseResultData.ok();
}

export async function remove(ctx: Context) {
    await SoftDeleteByKeys(xxxSchema, 'xxxId', ctx);
    return BaseResultData.ok();
}
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