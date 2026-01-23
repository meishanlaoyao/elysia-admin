# 路由系统

## 路由架构

项目采用模块化的路由架构，每个业务模块独立管理自己的路由。

## 路由模块结构

每个路由模块包含三个核心文件：

```
routes/
└── system-user/
    ├── route.ts      # 路由定义
    ├── dto.ts        # 数据传输对象（DTO）
    └── handle.ts     # 业务处理函数
```

## 路由定义

### 基本结构

```typescript
import type { IRouteModule } from "@/common/route";

const routeModule: IRouteModule = {
    tags: '模块标签',
    routes: [
        {
            url: '/path',
            method: 'get',
            summary: '接口描述',
            dto: RequestDto,
            handle: handlerFunction,
        }
    ]
};

export default routeModule;
```

### 路由接口定义

```typescript
export interface IRoute {
    url: string                              // 路由路径
    method: 'get' | 'post' | 'put' | 'delete' // HTTP 方法
    summary: string                          // 接口描述（用于 OpenAPI）
    dto?: any                                // 数据传输对象
    handle: Function                         // 处理函数
}

export interface IRouteModule {
    tags: string                             // 模块标签（用于 OpenAPI 分组）
    routes: IRoute[]                         // 路由列表
}
```

## 完整示例：系统用户模块

### 1. 路由定义 (route.ts)

```typescript
import type { IRouteModule } from "@/common/route";
import { CreateDto, ListDto, UpdateDto } from "./dto";
import { create, findAll, findList, findOne, update, remove } from "./handle";

const routeModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        {
            url: '/system/user',
            method: 'post',
            summary: '创建用户',
            dto: CreateDto,
            handle: create,
        },
        {
            url: '/system/user/all',
            method: 'get',
            summary: '查询所有用户',
            handle: findAll,
        },
        {
            url: '/system/user/list',
            method: 'get',
            summary: '分页查询用户',
            dto: ListDto,
            handle: findList,
        },
        {
            url: '/system/user/:id',
            method: 'get',
            summary: '查询用户详情',
            handle: findOne,
        },
        {
            url: '/system/user',
            method: 'put',
            summary: '更新用户',
            dto: UpdateDto,
            handle: update,
        },
        {
            url: '/system/user/:ids',
            method: 'delete',
            summary: '删除用户',
            handle: remove,
        },
    ]
};

export default routeModule;
```

### 2. DTO 定义 (dto.ts)

```typescript
import { t } from 'elysia';
import { InsertSystemUser, SelectSystemUser } from "@/schema/system_user";
import { BaseResultDto, BaseListQueryDto, BaseResultListDto } from '@/common/dto';

// 创建用户 DTO
export const CreateDto = {
    body: t.Pick(InsertSystemUser, ['username', 'password', 'email', 'phone']),
    ...BaseResultDto(SelectSystemUser),
};

// 查询列表 DTO
export const ListDto = {
    query: BaseListQueryDto({
        username: t.Optional(t.String({ description: "用户名" })),
        nickname: t.Optional(t.String({ description: "昵称" })),
        email: t.Optional(t.String({ description: "邮箱" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        sex: t.Optional(t.String({ description: "性别" })),
    }),
    ...BaseResultListDto(t.Omit(SelectSystemUser, ['password'])),
};

// 更新用户 DTO
export const UpdateDto = {
    body: SelectSystemUser,
    ...BaseResultDto(SelectSystemUser),
};
```

### 3. 业务处理 (handle.ts)

```typescript
import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { systemUserSchema } from '@/schema/system_user';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll
} from '@/common/db';

// 创建用户
export async function create(ctx: Context) {
    try {
        const data = ctx.body;
        await InsertOne(systemUserSchema, data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 查询所有用户
export async function findAll() {
    try {
        const where = CreateQueryBuilder(systemUserSchema)
            .eq('delFlag', false)
            .build();
        const data = await FindAll(systemUserSchema, where);
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 分页查询
export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            username,
            nickname,
        } = ctx.query;

        const whereCondition = CreateQueryBuilder(systemUserSchema)
            .eq('delFlag', false)
            .like('username', username)
            .like('nickname', nickname)
            .dateRange('createTime', startTime, endTime)
            .build();

        const { list, total } = await FindPage(systemUserSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });

        return BaseResultData.ok({ list, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 查询详情
export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(systemUserSchema, systemUserSchema.userId, id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 更新用户
export async function update(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = ctx.body;
        await UpdateByKey(systemUserSchema, systemUserSchema.userId, id, data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 删除用户（软删除）
export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number);
        await SoftDeleteByKeys(systemUserSchema, systemUserSchema.userId, ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

## 路由注册

所有路由模块在 `src/routes/index.ts` 中统一注册：

```typescript
import type { Elysia } from "elysia";
import type { IRouteModule } from "@/common/route";

import SystemUserModule from "./system-user/route";

const routeList: IRouteModule[] = [
    SystemUserModule,
    // 添加更多模块...
];

export function RegisterRoutes(app: Elysia) {
    routeList.forEach(module => {
        module.routes.forEach(route => {
            (app as any)[route.method](route.url, route.handle, {
                detail: {
                    tags: [module.tags],
                    summary: route.summary
                },
                ...route.dto
            });
        });
    });
}
```

## 创建新的路由模块

### 步骤 1: 创建模块目录

```bash
mkdir src/routes/your-module
```

### 步骤 2: 定义数据表 Schema

```typescript
// src/schema/your_table.ts
import { pgTable, bigserial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const yourTableSchema = pgTable('your_table', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    ...BaseSchema,
});

export const InsertYourTable = createInsertSchema(yourTableSchema);
export const SelectYourTable = createSelectSchema(yourTableSchema);
```

### 步骤 3: 创建 DTO

```typescript
// src/routes/your-module/dto.ts
import { t } from 'elysia';
import { InsertYourTable, SelectYourTable } from "@/schema/your_table";
import { BaseResultDto, BaseListQueryDto, BaseResultListDto } from '@/common/dto';

export const CreateDto = {
    body: t.Pick(InsertYourTable, ['name']),
    ...BaseResultDto(SelectYourTable),
};

export const ListDto = {
    query: BaseListQueryDto({
        name: t.Optional(t.String({ description: "名称" })),
    }),
    ...BaseResultListDto(SelectYourTable),
};
```

### 步骤 4: 创建处理函数

```typescript
// src/routes/your-module/handle.ts
import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { yourTableSchema } from '@/schema/your_table';
import { InsertOne, FindPage, CreateQueryBuilder } from '@/common/db';

export async function create(ctx: Context) {
    try {
        await InsertOne(yourTableSchema, ctx.body);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function findList(ctx: Context) {
    try {
        const { pageNum = 1, pageSize = 10, name } = ctx.query;
        const where = CreateQueryBuilder(yourTableSchema)
            .eq('delFlag', false)
            .like('name', name)
            .build();
        const { list, total } = await FindPage(yourTableSchema, where, {
            pageNum, pageSize
        });
        return BaseResultData.ok({ list, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 步骤 5: 定义路由

```typescript
// src/routes/your-module/route.ts
import type { IRouteModule } from "@/common/route";
import { CreateDto, ListDto } from "./dto";
import { create, findList } from "./handle";

const routeModule: IRouteModule = {
    tags: '你的模块',
    routes: [
        {
            url: '/your-module',
            method: 'post',
            summary: '创建',
            dto: CreateDto,
            handle: create,
        },
        {
            url: '/your-module/list',
            method: 'get',
            summary: '查询列表',
            dto: ListDto,
            handle: findList,
        },
    ]
};

export default routeModule;
```

### 步骤 6: 注册路由

```typescript
// src/routes/index.ts
import YourModule from "./your-module/route";

const routeList: IRouteModule[] = [
    SystemUserModule,
    YourModule,  // 添加新模块
];
```

## 路由最佳实践

1. **RESTful 设计**: 遵循 RESTful API 设计规范
2. **统一响应**: 使用 `BaseResultData` 统一响应格式
3. **错误处理**: 在 handle 函数中捕获并处理错误
4. **参数验证**: 使用 DTO 进行参数验证
5. **软删除**: 使用软删除而不是物理删除
6. **分页查询**: 列表接口应支持分页
7. **模块化**: 保持模块独立，便于维护
