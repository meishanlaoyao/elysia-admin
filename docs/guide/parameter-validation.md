# 参数验证
本章节将会介绍如何在 `Elysia Admin` 项目中实现接口请求、响应参数校验。

基础的 `query` 、`params` 、`body` 校验这里就不展开介绍了，可以阅读：

- [Elysia 参数校验](https://elysiajs.com/essential/validation.html)
- [Elysia TypeBox 文档](https://elysiajs.com/validation/typebox.html)

接下来讲解内部封装的一些常用的参数校验规则。

## 基础 DTO

### BaseResultDto

用于定义标准的单个数据返回格式，包含成功和失败两种响应。

```typescript
import { BaseResultDto } from '@/types/dto';

// 使用示例
app.get('/user/:id', async ({ params }) => {
    // ...
}, BaseResultDto(t.Object({
    id: t.Number(),
    name: t.String(),
    email: t.String(),
})));
```

返回格式：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com"
    }
}
```

### BaseResultListDto

用于定义标准的列表数据返回格式，包含分页信息。

```typescript
import { BaseResultListDto } from '@/types/dto';

// 使用示例
app.get('/users', async ({ query }) => {
    // ...
}, BaseResultListDto(t.Object({
    id: t.Number(),
    name: t.String(),
})));
```

返回格式：
```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "list": [
            { "id": 1, "name": "张三" },
            { "id": 2, "name": "李四" }
        ],
        "total": 100
    }
}
```

### BaseListQueryDto

用于定义标准的列表查询参数，包含分页、排序、时间范围等常用字段。

```typescript
import { BaseListQueryDto } from '@/types/dto';

// 使用示例
app.get('/users', async ({ query }) => {
    // query 包含: pageNum, pageSize, orderByColumn, sortRule, startTime, endTime
}, {
    query: BaseListQueryDto({
        name: t.Optional(t.String({ description: "用户名" })),
        status: t.Optional(t.Number({ description: "状态" })),
    })
});
```

内置字段：
- `pageNum`: 页码，默认 1
- `pageSize`: 每页数量，默认 10
- `orderByColumn`: 排序字段（可选）
- `sortRule`: 排序规则（可选）
- `startTime`: 开始时间（可选）
- `endTime`: 结束时间（可选）

## CRUD DTO 生成器

`CrudDto` 提供了一套标准化的 CRUD 接口 DTO 生成方法，可以快速创建增删改查接口的参数校验。

### CrudDto.create

创建新增接口的 DTO，可以指定必填字段。

```typescript
import { CrudDto } from '@/types/dto';
import { insertUserSchema, selectUserSchema } from '@/database/schema/user';

app.post('/user', async ({ body }) => {
    // ...
}, CrudDto.create(
    insertUserSchema,
    selectUserSchema,
    ['name', 'email'] // 必填字段
));
```

### CrudDto.update

创建更新接口的 DTO，主键必填，其他字段可选。

```typescript
import { CrudDto } from '@/types/dto';
import { selectUserSchema } from '@/database/schema/user';

app.put('/user', async ({ body }) => {
    // ...
}, CrudDto.update(
    selectUserSchema,
    'id', // 主键字段名
    { reason: t.Optional(t.String()) } // 额外字段（可选）
));
```

### CrudDto.list

创建列表查询接口的 DTO，支持分页和自定义查询字段。

```typescript
import { CrudDto } from '@/types/dto';
import { selectUserSchema } from '@/database/schema/user';

app.get('/users', async ({ query }) => {
    // ...
}, CrudDto.list(
    selectUserSchema,
    {
        name: t.Optional(t.String({ description: "用户名" })),
        status: t.Optional(t.Number({ description: "状态" })),
    }
));
```

### CrudDto.findAll

创建查询所有数据接口的 DTO（不分页）。

```typescript
import { CrudDto } from '@/types/dto';
import { selectUserSchema } from '@/database/schema/user';

app.get('/users/all', async ({ query }) => {
    // ...
}, CrudDto.findAll(
    selectUserSchema,
    {
        status: t.Optional(t.Number({ description: "状态" })),
    }
));
```

### CrudDto.findOne

创建查询单条数据接口的 DTO。

```typescript
import { CrudDto } from '@/types/dto';
import { selectUserSchema } from '@/database/schema/user';

app.get('/user/:id', async ({ params }) => {
    // ...
}, CrudDto.findOne(selectUserSchema));
```

## 工具函数

### CreateUpdateDto

手动创建更新 DTO，主键必填，其他字段可选，自动处理日期字段。

```typescript
import { CreateUpdateDto } from '@/types/dto';
import { selectUserSchema } from '@/database/schema/user';

const updateDto = CreateUpdateDto(selectUserSchema, 'id');
```

### ParseDateFields

将日期字符串转换为 Date 对象，用于处理前端传递的日期字符串。

```typescript
import { ParseDateFields } from '@/types/dto';

app.post('/user', async ({ body }) => {
    const data = ParseDateFields(body);
    // data.createTime 和 data.updateTime 已转换为 Date 对象
});
```