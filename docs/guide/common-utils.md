# 通用工具

项目提供了一系列通用工具函数和类，用于简化开发。

## 响应结果

### BaseResultData

统一的 API 响应格式处理工具，位于 `src/common/result.ts`。

#### 成功响应

```typescript
import { BaseResultData } from '@/common/result';

// 返回成功，不带数据
return BaseResultData.ok();

// 返回成功，带数据
return BaseResultData.ok({ id: 1, name: 'test' });

// 返回成功，带列表数据
return BaseResultData.ok({ list: [], total: 0 });
```

**响应格式**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

#### 失败响应

```typescript
// 使用默认错误信息
return BaseResultData.fail(404);

// 自定义错误信息
return BaseResultData.fail(500, '数据库连接失败');

// 传递错误对象
try {
  // ...
} catch (error) {
  return BaseResultData.fail(500, error);
}
```

**响应格式**

```json
{
  "code": 404,
  "msg": "资源不存在",
  "data": null
}
```

### 响应状态码

项目定义了标准的响应状态码，位于 `src/utils/rescode.ts`：

```typescript
export const ResCode = {
    200: '操作成功',
    400: '请求参数错误',
    401: '未认证',
    403: '未授权',
    404: '资源不存在',
    405: '方法不存在',
    406: '不支持的媒体类型',
    408: '请求超时',
    409: '冲突',
    415: '不支持的媒体类型',
    422: '未处理实体',
    429: '请求过于频繁',
    500: '服务器内部错误',
    503: '服务不可用',
    504: '网关超时',
    505: 'HTTP版本不受支持',
    507: '存储不足',
    508: '循环引用',
    510: '未实现',
    511: '网络认证需要',
    512: '网络连接失败',
};
```

## DTO 工具

### BaseResultDto

用于定义单个对象的响应 DTO：

```typescript
import { t } from 'elysia';
import { BaseResultDto } from '@/common/dto';
import { SelectUser } from '@/schema/user';

export const GetUserDto = {
    ...BaseResultDto(SelectUser),
};
```

生成的响应格式：

```typescript
{
    response: {
        200: {
            code: number,
            msg: string,
            data: User | null
        },
        500: {
            code: number,
            msg: string,
            data: null
        }
    }
}
```

### BaseResultListDto

用于定义列表响应 DTO：

```typescript
import { t } from 'elysia';
import { BaseResultListDto } from '@/common/dto';
import { SelectUser } from '@/schema/user';

export const ListUserDto = {
    ...BaseResultListDto(SelectUser),
};
```

生成的响应格式：

```typescript
{
    response: {
        200: {
            code: number,
            msg: string,
            data: {
                list: User[],
                total: number
            }
        },
        500: {
            code: number,
            msg: string,
            data: null
        }
    }
}
```

### BaseListQueryDto

用于定义分页查询参数 DTO：

```typescript
import { t } from 'elysia';
import { BaseListQueryDto } from '@/common/dto';

export const QueryDto = {
    query: BaseListQueryDto({
        username: t.Optional(t.String({ description: "用户名" })),
        status: t.Optional(t.String({ description: "状态" })),
    }),
};
```

生成的查询参数：

```typescript
{
    pageNo: number,           // 页码，默认 1
    pageSize: number,         // 每页数量，默认 10
    orderByColumn?: string,   // 排序字段，默认 "createTime"
    sortRule?: string,        // 排序规则，默认 "desc"
    startTime?: string,       // 开始时间
    endTime?: string,         // 结束时间
    ...customFields           // 自定义字段
}
```

## 密码加密

### BcryptHash

使用 bcrypt 算法加密密码，位于 `src/common/bcrypt.ts`。

```typescript
import { BcryptHash } from '@/common/bcrypt';

// 加密密码
const hashedPassword = BcryptHash('123456');

// 在创建用户时使用
const user = {
    username: 'admin',
    password: BcryptHash(rawPassword)
};
```

### BcryptCompare

验证密码是否匹配：

```typescript
import { BcryptCompare } from '@/common/bcrypt';

// 验证密码
const isValid = BcryptCompare('123456', hashedPassword);

if (isValid) {
    // 密码正确
} else {
    // 密码错误
}
```

## 时间工具

### GetNowTime

获取当前时间的格式化字符串，位于 `src/common/time.ts`。

```typescript
import { GetNowTime } from '@/common/time';

// 获取当前时间
const now = GetNowTime();
// 输出: "2024-01-01 12:00:00"

// 在日志中使用
console.log(`[${GetNowTime()}] 服务启动成功`);
```

### FormatTime

格式化时间对象：

```typescript
import { FormatTime } from '@/common/time';

const date = new Date();
const formatted = FormatTime(date);
// 输出: "2024-01-01 12:00:00"

// 自定义格式
const customFormat = FormatTime(date, 'YYYY-MM-DD');
// 输出: "2024-01-01"
```

## UUID 生成

### GenerateUUID

生成唯一标识符，位于 `src/common/uuid.ts`。

```typescript
import { GenerateUUID } from '@/common/uuid';

// 生成 UUID
const id = GenerateUUID();
// 输出: "550e8400-e29b-41d4-a716-446655440000"

// 在创建记录时使用
const record = {
    id: GenerateUUID(),
    name: 'test'
};
```

## 数据库客户端

### PostgreSQL 客户端

位于 `src/client/pg.ts`，提供全局的数据库连接实例。

```typescript
import pg from '@/client/pg';
import { systemUserSchema } from '@/schema/system_user';

// 直接使用 Drizzle ORM
const users = await pg.select().from(systemUserSchema);

// 执行原始 SQL
const result = await pg.execute(sql`SELECT * FROM system_user`);
```

### Redis 客户端

位于 `src/client/redis.ts`，提供 Redis 连接实例。

```typescript
import redis from '@/client/redis';

// 设置缓存
await redis.set('key', 'value', 'EX', 3600);

// 获取缓存
const value = await redis.get('key');

// 删除缓存
await redis.del('key');

// 设置对象
await redis.set('user:1', JSON.stringify({ id: 1, name: 'admin' }));

// 获取对象
const user = JSON.parse(await redis.get('user:1'));
```

## 基础 Schema

### BaseSchema

所有数据表都应继承的基础字段，位于 `src/common/schema.ts`。

```typescript
import { BaseSchema } from '@/common/schema';
import { pgTable, bigserial, varchar } from 'drizzle-orm/pg-core';

export const yourTableSchema = pgTable('your_table', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 100 }),
    ...BaseSchema,  // 继承基础字段
});
```

**BaseSchema 包含的字段**：

```typescript
{
    createBy: varchar('create_by', { length: 64 }),      // 创建者
    createTime: timestamp('create_time').defaultNow(),   // 创建时间
    updateBy: varchar('update_by', { length: 64 }),      // 更新者
    updateTime: timestamp('update_time').defaultNow(),   // 更新时间
    remark: varchar('remark', { length: 500 }),          // 备注
    delFlag: boolean('del_flag').default(false),         // 删除标志
}
```

## 使用示例

### 完整的 CRUD 示例

```typescript
import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { BcryptHash } from '@/common/bcrypt';
import { GenerateUUID } from '@/common/uuid';
import { GetNowTime } from '@/common/time';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage
} from '@/common/db';
import { userSchema } from '@/schema/user';

// 创建用户
export async function createUser(ctx: Context) {
    try {
        const { username, password, email } = ctx.body;
        
        // 加密密码
        const hashedPassword = BcryptHash(password);
        
        // 插入数据
        await InsertOne(userSchema, {
            username,
            password: hashedPassword,
            email,
            createBy: 'system',
        });
        
        console.log(`[${GetNowTime()}] 用户创建成功: ${username}`);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 查询用户列表
export async function getUserList(ctx: Context) {
    try {
        const { pageNum, pageSize, username } = ctx.query;
        
        // 构建查询条件
        const where = CreateQueryBuilder(userSchema)
            .eq('delFlag', false)
            .like('username', username)
            .build();
        
        // 分页查询
        const { list, total } = await FindPage(userSchema, where, {
            pageNum,
            pageSize,
            orderByColumn: 'createTime',
            sortRule: 'desc'
        });
        
        return BaseResultData.ok({ list, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 更新用户
export async function updateUser(ctx: Context) {
    try {
        const { id } = ctx.params;
        const data = ctx.body;
        
        // 如果更新密码，需要加密
        if (data.password) {
            data.password = BcryptHash(data.password);
        }
        
        await UpdateByKey(userSchema, userSchema.id, Number(id), data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

// 删除用户
export async function deleteUser(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number);
        await SoftDeleteByKeys(userSchema, userSchema.id, ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

## 最佳实践

1. **统一响应**: 始终使用 `BaseResultData` 返回响应
2. **密码安全**: 使用 `BcryptHash` 加密密码
3. **错误处理**: 使用 try-catch 捕获错误并返回友好提示
4. **日志记录**: 使用 `GetNowTime()` 记录操作时间
5. **类型安全**: 充分利用 TypeScript 类型系统
6. **代码复用**: 使用通用工具函数避免重复代码
