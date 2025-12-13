# 数据库操作

## Drizzle ORM

项目使用 Drizzle ORM 进行数据库操作，提供类型安全的 API 和优秀的开发体验。

## 数据库表结构

### 基础字段

所有表都继承自 `BaseSchema`，包含以下通用字段：

```typescript
{
    createBy: varchar('create_by', { length: 64 }),    // 创建者
    createTime: timestamp('create_time').defaultNow(), // 创建时间
    updateBy: varchar('update_by', { length: 64 }),    // 更新者
    updateTime: timestamp('update_time').defaultNow(), // 更新时间
    remark: varchar('remark', { length: 500 }),        // 备注
    delFlag: boolean('del_flag').default(false),       // 删除标志（软删除）
}
```

### 定义表结构

以系统用户表为例：

```typescript
import { pgTable, bigserial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemUserSchema = pgTable(
    'system_user',
    {
        userId: bigserial('user_id', { mode: 'number' }).primaryKey(),
        username: varchar('username', { length: 64 }).notNull().unique(),
        password: varchar('password', { length: 255 }).notNull(),
        nickname: varchar('nickname', { length: 64 }),
        email: varchar('email', { length: 64 }),
        phone: varchar('phone', { length: 11 }),
        sex: varchar('sex', { length: 1 }).default('0'),
        avatar: varchar('avatar', { length: 255 }),
        ...BaseSchema,
    }
);

// 生成插入和查询的 Schema
export const InsertSystemUser = createInsertSchema(systemUserSchema);
export const SelectSystemUser = createSelectSchema(systemUserSchema);
```

## 数据库操作 API

项目封装了一套通用的数据库操作函数，位于 `src/common/db.ts`。

### 插入操作

#### 插入单条记录

```typescript
import { InsertOne } from '@/common/db';
import { systemUserSchema } from '@/schema/system_user';

await InsertOne(systemUserSchema, {
    username: 'admin',
    password: 'hashed_password',
    email: 'admin@example.com'
});
```

#### 批量插入

```typescript
import { InsertMany } from '@/common/db';

await InsertMany(systemUserSchema, [
    { username: 'user1', password: 'pass1' },
    { username: 'user2', password: 'pass2' }
]);
```

### 查询操作

#### 根据主键查询

```typescript
import { FindOneByKey } from '@/common/db';

const user = await FindOneByKey(
    systemUserSchema, 
    systemUserSchema.userId, 
    1
);
```

#### 查询所有记录

```typescript
import { FindAll } from '@/common/db';

// 查询所有未删除的用户
const users = await FindAll(
    systemUserSchema,
    eq(systemUserSchema.delFlag, false)
);
```

#### 分页查询

```typescript
import { FindPage } from '@/common/db';

const { list, total } = await FindPage(
    systemUserSchema,
    eq(systemUserSchema.delFlag, false),
    {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'createTime',
        sortRule: 'desc'
    }
);
```

### 更新操作

```typescript
import { UpdateByKey } from '@/common/db';

await UpdateByKey(
    systemUserSchema,
    systemUserSchema.userId,
    1,
    { nickname: '新昵称', email: 'new@example.com' }
);
```

### 删除操作（软删除）

```typescript
import { SoftDeleteByKeys } from '@/common/db';

// 软删除多个用户
await SoftDeleteByKeys(
    systemUserSchema,
    systemUserSchema.userId,
    [1, 2, 3]
);
```

## 查询条件构建器

项目提供了强大的查询条件构建器 `QueryBuilder`，用于构建复杂查询。

### 基本用法

```typescript
import { CreateQueryBuilder } from '@/common/db';
import { systemUserSchema } from '@/schema/system_user';

const where = CreateQueryBuilder(systemUserSchema)
    .eq('delFlag', false)
    .like('username', 'admin')
    .in('sex', ['1', '2'])
    .dateRange('createTime', '2024-01-01', '2024-12-31')
    .build();

const users = await FindAll(systemUserSchema, where);
```

### 支持的条件方法

#### 相等/不等

```typescript
.eq('username', 'admin')           // username = 'admin'
.ne('status', 'deleted')           // status != 'deleted'
```

#### 数组条件

```typescript
.in('userId', [1, 2, 3])           // userId IN (1, 2, 3)
.notIn('status', ['banned'])       // status NOT IN ('banned')
```

#### 模糊匹配

```typescript
.like('username', 'admin')         // username LIKE '%admin%'
.notLike('email', 'test')          // email NOT LIKE '%test%'
.ilike('nickname', 'John')         // nickname ILIKE '%John%' (不区分大小写)
.leftLike('username', 'admin')     // username LIKE '%admin'
.rightLike('username', 'admin')    // username LIKE 'admin%'
```

#### 比较运算

```typescript
.gt('age', 18)                     // age > 18
.gte('age', 18)                    // age >= 18
.lt('age', 60)                     // age < 60
.lte('age', 60)                    // age <= 60
```

#### 时间范围

```typescript
.dateRange('createTime', '2024-01-01', '2024-12-31')
.between('createTime', '2024-01-01', '2024-12-31')
.notBetween('createTime', '2024-01-01', '2024-12-31')
```

#### NULL 判断

```typescript
.isNull('deletedAt')               // deletedAt IS NULL
.isNotNull('email')                // email IS NOT NULL
```

#### 逻辑运算

```typescript
// OR 条件
CreateQueryBuilder(systemUserSchema)
    .eq('delFlag', false)
    .or(builder => {
        builder.eq('status', 'active').eq('status', 'pending');
    })
    .build();

// NOT 条件
CreateQueryBuilder(systemUserSchema)
    .not(builder => {
        builder.eq('status', 'banned');
    })
    .build();
```

#### 自定义条件

```typescript
import { and, or, eq } from 'drizzle-orm';

CreateQueryBuilder(systemUserSchema)
    .custom(
        or(
            eq(systemUserSchema.username, 'admin'),
            eq(systemUserSchema.email, 'admin@example.com')
        )
    )
    .build();
```

### 链式调用

```typescript
const where = CreateQueryBuilder(systemUserSchema)
    .eq('delFlag', false)
    .like('username', searchText)
    .in('sex', ['1', '2'])
    .gte('age', 18)
    .dateRange('createTime', startTime, endTime)
    .isNotNull('email')
    .build();
```

### 条件管理

```typescript
const builder = CreateQueryBuilder(systemUserSchema);

// 获取条件数量
console.log(builder.length);

// 清空所有条件
builder.clear();

// 使用 OR 连接所有条件
const orCondition = builder.buildOr();
```

## 数据库迁移

### 推送 Schema 到数据库

```bash
bun run db:push
```

### 从数据库拉取 Schema

```bash
bun run db:pull
```

### 生成迁移文件

```bash
bunx drizzle-kit generate
```

### 执行迁移

```bash
bunx drizzle-kit migrate
```

## 最佳实践

1. **类型安全**: 始终使用 Schema 定义的类型
2. **软删除**: 使用 `SoftDeleteByKeys` 而不是物理删除
3. **查询构建**: 使用 `QueryBuilder` 构建复杂查询
4. **事务处理**: 对于多个相关操作，使用数据库事务
5. **索引优化**: 为常用查询字段添加索引
6. **连接池**: 合理配置数据库连接池大小
