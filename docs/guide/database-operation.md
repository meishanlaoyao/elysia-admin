---
title: 数据库操作 - Elysia Admin 指南
description: 介绍 Elysia Admin 封装的 PostgreSQL 数据库操作方法，包括增删改查、条件构造器、联表查询、分页查询及事务管理的完整使用指南。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 数据库, DrizzleORM, PostgreSQL, CRUD, 事务, 分页查询, 联表查询
  - - meta
    - property: og:title
      content: 数据库操作 - Elysia Admin 指南
  - - meta
    - property: og:description
      content: 掌握 Elysia Admin 封装的数据库操作方法，涵盖增删改查、条件构造器、事务管理等完整能力。
---

# 数据库操作

本章将介绍 `Elysia Admin` 中封装的常用 `PostgreSQL` 数据库操作方法，包括增删改查和事务管理。

## 插入数据

本节介绍如何向数据库插入数据，包括不返回记录和返回记录两种方式。

### 插入数据（不返回记录）

```ts
InsertOne(schema, ctx, customData);
```

参数说明：
- `schema`：数据库表的 schema 结构，用于定义插入数据的字段
- `ctx`：Elysia 的请求上下文对象，包含请求相关的数据
- `customData`：自定义数据对象，若使用自定义数据，需要将 `ctx` 设置为 `null`（可选参数）

示例：

```ts
import { InsertOne } from '@/core/database/repository';

export async function create(ctx: Context) {
    try {
        await InsertOne(businessMerchantSchema, ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 插入数据（返回记录）

```ts
InsertOneAndRes(schema, ctx, customData);
```

参数说明：
- `schema`：数据库表的 schema 结构，用于定义插入数据的字段
- `ctx`：Elysia 的请求上下文对象，包含请求相关的数据
- `customData`：自定义数据对象，若使用自定义数据，需要将 `ctx` 设置为 `null`（可选参数）

示例：

```ts
import { InsertOneAndRes } from '@/core/database/repository';

export async function create(ctx: Context) {
    try {
        const res = await InsertOneAndRes(businessMerchantSchema, ctx);
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

## 查询数据

本节介绍如何从数据库查询数据，包括单条查询、全部查询、分页查询以及联表查询等多种方式。

### 查询条件关键字

在使用条件查询前，需要了解以下关键字：

| 关键字 | 说明 | 示例 |
| --- | --- | --- |
| `eq` | 精准匹配，等价于 `=` | `eq('id', 1)` |
| `ne` | 不等于，等价于 `!=` | `ne('id', 1)` |
| `in` | 在指定数组中 | `in('id', [1, 2, 3])` |
| `notIn` | 不在指定数组中 | `notIn('id', [1, 2, 3])` |
| `like` | 模糊匹配（区分大小写） | `like('name', '张三')` |
| `ilike` | 模糊匹配（不区分大小写） | `ilike('name', '张三')` |
| `notLike` | 模糊匹配不包含（区分大小写） | `notLike('name', '张三')` |
| `notIlike` | 模糊匹配不包含（不区分大小写） | `notIlike('name', '张三')` |
| `leftLike` | 左模糊匹配（以...结尾） | `leftLike('name', '张三')` |
| `rightLike` | 右模糊匹配（以...开头） | `rightLike('name', '张三')` |
| `gt` | 大于，等价于 `>` | `gt('age', 1)` |
| `gte` | 大于等于，等价于 `>=` | `gte('age', 1)` |
| `lt` | 小于，等价于 `<` | `lt('age', 1)` |
| `lte` | 小于等于，等价于 `<=` | `lte('age', 1)` |
| `between` | 在指定值之间 | `between('age', 1, 10)` |
| `notBetween` | 不在指定值之间 | `notBetween('age', 1, 10)` |
| `dateRange` | 日期范围查询，开始时间和结束时间都可选 | `dateRange('createTime', startTime, endTime)` |
| `isNull` | 是否为 NULL | `isNull('age')` |
| `isNotNull` | 是否不为 NULL | `isNotNull('age')` |
| `or` | 构建 OR 条件 | `or()` |
| `not` | 构建 NOT 条件 | `not()` |
| `join` | 构建 JOIN 条件 | `join()` |
| `custom` | 自定义查询条件 | `custom(SQL)` |

### 查询条件构造器

`CreateQueryBuilder` 可以通过链式调用的方式来生成查询条件。

示例：

```ts
CreateQueryBuilder(businessMerchantSchema)
    .eq('delFlag', false)
    .eq('status', true)
    .dateRange('createTime', startTime, endTime)
    .build();
```

等价于以下 SQL：

```sql
SELECT * 
FROM business_merchant
WHERE del_flag = false 
  AND status = true
  AND create_time BETWEEN startTime AND endTime;
```

### 单条查询

```ts
FindOneByKey(schema, keyColumnName, value);
```

参数说明：
- `schema`：数据库表的 schema 结构，用于定义查询数据的字段
- `keyColumnName`：主键字段名（字符串）
- `value`：主键值

示例：

```ts
import { FindOneByKey } from '@/core/database/repository';

export async function findOne(ctx: Context) {
    try {
        const id = ctx.params.id;
        const res = await FindOneByKey(businessMerchantSchema, 'id', id);
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 全部查询

示例：

```ts
import { CreateQueryBuilder, FindAll } from '@/core/database/repository';

export async function findAll(ctx: Context) {
    try {
        const where = CreateQueryBuilder(systemDictTypeSchema)
            .eq('delFlag', false)
            .build();
        return await FindAll(systemDictTypeSchema, where);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 联表查询全部

示例：

```ts
import { eq } from 'drizzle-orm';
import { CreateQueryBuilder, FindAllWithJoin } from '@/core/database/repository';

export async function findTree(ctx: Context) {
    try {
        const builder = CreateQueryBuilder(systemMenuSchema)
            .eq('delFlag', false)
            .join({
                joinSchema: systemMenuBtnSchema,
                fieldName: 'authList',
                foreignKey: 'menuId',
                primaryKey: 'menuId',
                defaultValue: [],
                where: eq(systemMenuBtnSchema.delFlag, false),
                multiple: true
            });
        const data = await FindAllWithJoin(systemMenuSchema, builder);
        const tree = ListToTree(data, {
            idKey: 'menuId',
            parentKey: 'parentId',
            childrenKey: 'children',
            rootValue: 0,
            sortKey: 'sort',
        });
        return BaseResultData.ok(tree);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 分页查询

示例：

```ts
import { CreateQueryBuilder, FindPage } from '@/core/database/repository';

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            status,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessMerchantSchema)
            .eq('delFlag', false)
            .eq('status', status)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(
            businessMerchantSchema,
            whereCondition,
            {
                pageNum,
                pageSize,
                orderByColumn,
                sortRule
            }
        );
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 联表分页查询

示例：

```ts
import { eq } from 'drizzle-orm';
import { CreateQueryBuilder, FindPageWithJoin } from '@/core/database/repository';

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            status,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessMerchantSchema)
            .eq('delFlag', false)
            .eq('status', status)
            .dateRange('createTime', startTime, endTime)
            .join({
                joinSchema: businessMerchantConfigsSchema,
                fieldName: 'configList',
                foreignKey: 'id',
                primaryKey: 'merchantId',
                defaultValue: [],
                where: eq(businessMerchantConfigsSchema.delFlag, false),
                multiple: true
            });
        const res = await FindPageWithJoin(
            businessMerchantSchema,
            whereCondition,
            {
                pageNum,
                pageSize,
                orderByColumn,
                sortRule
            }
        );
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

## 更新数据

本节介绍如何更新数据库中的数据，支持不返回记录和返回更新后记录两种方式。

### 更新数据（不返回记录）

```ts
UpdateByKey(schema, keyColumnName, ctx, customData);
```

参数说明：
- `schema`：数据库表的 schema 结构
- `keyColumnName`：主键字段名
- `ctx`：Elysia 上下文对象，若传递则会自动更新表中的 `updateBy` 字段，否则需要自行传递
- `customData`：自定义数据更新对象，若使用自定义数据，需要将 `ctx` 设置为 `null`（可选参数）

示例：

```ts
import { UpdateByKey } from '@/core/database/repository';

export async function update(ctx: Context) {
    try {
        await UpdateByKey(systemDeptSchema, 'deptId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 更新数据（返回记录）

```ts
UpdateByKeyAndRes(schema, keyColumnName, ctx, customData);
```

参数说明：
- `schema`：数据库表的 schema 结构
- `keyColumnName`：主键字段名
- `ctx`：Elysia 上下文对象，若传递则会自动更新表中的 `updateBy` 字段，否则需要自行传递
- `customData`：自定义数据更新对象，若使用自定义数据，需要将 `ctx` 设置为 `null`（可选参数）

示例：

```ts
import { UpdateByKeyAndRes } from '@/core/database/repository';

export async function update(ctx: Context) {
    try {
        const res = await UpdateByKeyAndRes(systemDeptSchema, 'deptId', ctx);
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

## 删除数据

本节介绍如何删除数据库中的数据，包括软删除（标记删除）和硬删除（物理删除）两种方式。

### 批量软删除

```ts
SoftDeleteByKeys(schema, keyColumnName, ctx, customData);
```

参数说明：
- `schema`：数据库表的 schema 结构
- `keyColumnName`：主键字段名
- `ctx`：Elysia 上下文对象，若传递则会自动更新表中的 `updateBy` 字段，否则需要自行传递
- `customData`：自定义数据删除数组，若使用自定义数据，需要将 `ctx` 设置为 `null`（可选参数）

示例：

```ts
import { SoftDeleteByKeys } from '@/core/database/repository';

export async function remove(ctx: Context) {
    try {
        await SoftDeleteByKeys(systemApiSchema, 'apiId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### 批量条件硬删除

```ts
HardDelete(schema, where);
```

参数说明：
- `schema`：数据库表的 schema 结构
- `where`：Drizzle ORM 查询条件

示例：

```ts
import { eq } from 'drizzle-orm';
import { HardDelete } from '@/core/database/repository';

await HardDelete(systemRoleMenuSchema, eq(systemRoleMenuSchema.roleId, roleId));
```

### 批量多主键硬删除

```ts
HardDeleteByKeys(schema, keyColumnName, values);
```

参数说明：
- `schema`：数据库表的 schema 结构
- `keyColumnName`：主键字段名
- `values`：主键值数组

示例：

```ts
import { HardDeleteByKeys } from '@/core/database/repository';

await HardDeleteByKeys(systemRoleMenuSchema, 'roleId', [1, 2, 3, 4]);
```

## 数据库事务

本节介绍如何使用事务来确保数据库操作的原子性、一致性、隔离性和持久性（ACID）。事务可以将多个数据库操作作为一个整体执行，要么全部成功，要么全部回滚。

### 简单事务执行

使用 `RunTransaction` 函数执行基本的事务操作：

```typescript
import { RunTransaction } from '@/core/database/transaction';
import { systemUserSchema } from '@/database/schema/system_user';

// 创建用户
const result = await RunTransaction(async (tx) => {
    const user = await tx.insert(systemUserSchema).values({
        userName: 'john',
        nickName: 'John Doe',
        email: 'john@example.com'
    }).returning();
    
    return user[0];
});

console.log('创建的用户:', result);
```

### 多表操作事务

在一个事务中操作多个表：

```typescript
import { RunTransaction } from '@/core/database/transaction';
import { systemUserSchema } from '@/database/schema/system_user';
import { systemRoleSchema } from '@/database/schema/system_role';

const result = await RunTransaction(async (tx) => {
    // 创建用户
    const user = await tx.insert(systemUserSchema).values({
        userName: 'admin',
        nickName: 'Administrator'
    }).returning();
    
    // 创建角色
    const role = await tx.insert(systemRoleSchema).values({
        roleName: 'admin',
        roleKey: 'admin',
        roleSort: 1
    }).returning();
    
    return { user: user[0], role: role[0] };
});
```

### 事务回滚

事务中抛出错误会自动回滚：

```typescript
try {
    await RunTransaction(async (tx) => {
        await tx.insert(systemUserSchema).values({
            userName: 'test'
        });
        
        // 模拟错误
        throw new Error('发生错误，事务将回滚');
        
        // 这行代码不会执行
        await tx.insert(systemRoleSchema).values({
            roleName: 'test'
        });
    });
} catch (error) {
    console.error('事务失败:', error.message);
    // 所有操作都已回滚
}
```

### 构建器模式

使用 `CreateTransaction` 创建更复杂的事务配置：

```typescript
import { CreateTransaction } from '@/core/database/transaction';

const result = await CreateTransaction<{ userId: number }>()
    .isolation('serializable')  // 设置隔离级别
    .onBegin(() => {
        console.log('事务开始');
    })
    .onCommit(() => {
        console.log('事务提交成功');
    })
    .onRollback((error) => {
        console.error('事务回滚:', error.message);
    })
    .execute(async (tx) => {
        const user = await tx.insert(systemUserSchema).values({
            userName: 'builder'
        }).returning();
        
        return { userId: user[0].userId };
    })
    .run();
```

### 隔离级别配置

PostgreSQL 支持四种隔离级别：

```typescript
// 读未提交（最低隔离级别）
await RunTransaction(async (tx) => {
    // 事务逻辑
}, {
    isolationLevel: 'read uncommitted'
});

// 读已提交（PostgreSQL 默认）
await RunTransaction(async (tx) => {
    // 事务逻辑
}, {
    isolationLevel: 'read committed'
});

// 可重复读
await RunTransaction(async (tx) => {
    // 事务逻辑
}, {
    isolationLevel: 'repeatable read'
});

// 串行化（最高隔离级别）
await RunTransaction(async (tx) => {
    // 事务逻辑
}, {
    isolationLevel: 'serializable'
});
```

### 只读事务

对于只读操作，可以使用只读事务提高性能：

```typescript
// 使用构建器
const users = await CreateTransaction()
    .readOnly()
    .execute(async (tx) => {
        return await tx.select().from(systemUserSchema);
    })
    .run();

// 使用选项
const users = await RunTransaction(async (tx) => {
    return await tx.select().from(systemUserSchema);
}, {
    accessMode: 'read only'
});
```

### 生命周期钩子

监听事务的各个阶段：

```typescript
await RunTransaction(async (tx) => {
    // 事务逻辑
    await tx.insert(systemUserSchema).values({ userName: 'hook' });
}, {
    onBegin: async () => {
        console.log('事务开始前的准备工作');
        // 可以执行一些准备操作
    },
    onCommit: async () => {
        console.log('事务提交后的清理工作');
        // 清除缓存、发送通知等
    },
    onRollback: async (error) => {
        console.error('事务回滚，记录日志:', error);
        // 记录错误日志、发送告警等
    },
    onError: (error) => {
        // 自定义错误处理
        console.error('自定义错误处理:', error);
    }
});
```

### 批量事务执行

批量事务执行器允许你按顺序或并行执行多个独立的事务。

顺序执行（串行）：

```typescript
import { CreateBatchTransaction } from '@/core/database/transaction';

const results = await CreateBatchTransaction()
    .add('创建用户', async (tx) => {
        return await tx.insert(systemUserSchema).values({
            userName: 'user1'
        }).returning();
    })
    .add('创建角色', async (tx) => {
        return await tx.insert(systemRoleSchema).values({
            roleName: 'role1'
        }).returning();
    })
    .add('创建部门', async (tx) => {
        return await tx.insert(systemDeptSchema).values({
            deptName: 'dept1'
        }).returning();
    })
    .runAll();

// 检查结果
results.forEach(({ name, success, result, error }) => {
    if (success) {
        console.log(`${name} 成功:`, result);
    } else {
        console.error(`${name} 失败:`, error);
    }
});
```

并行执行：

```typescript
const results = await CreateBatchTransaction()
    .add('事务1', async (tx) => {
        // 独立的事务逻辑
    })
    .add('事务2', async (tx) => {
        // 独立的事务逻辑
    })
    .add('事务3', async (tx) => {
        // 独立的事务逻辑
    })
    .runAllParallel();  // 并行执行

// 所有事务都会执行，互不影响
```

### 嵌套事务支持

使用 `WithTransaction` 创建可复用的函数，自动检测是否在事务中：

```typescript
import { WithTransaction, TransactionContext } from '@/core/database/transaction';
import { db } from '@/core/database/pg';

// 创建可复用的业务函数
async function createUser(name: string, tx?: TransactionContext) {
    return await WithTransaction(tx || db, async (t) => {
        return await t.insert(systemUserSchema).values({
            userName: name
        }).returning();
    });
}

async function createRole(name: string, tx?: TransactionContext) {
    return await WithTransaction(tx || db, async (t) => {
        return await t.insert(systemRoleSchema).values({
            roleName: name
        }).returning();
    });
}

// 方式1: 在事务中调用（共享同一个事务）
await RunTransaction(async (tx) => {
    await createUser('john', tx);
    await createRole('admin', tx);
    // 如果任何一个失败，所有操作都会回滚
});

// 方式2: 独立调用（各自创建新事务）
await createUser('jane');  // 独立事务
await createRole('user');  // 独立事务
```

## 参考文档

- [Drizzle ORM 事务](https://orm.drizzle.org.cn/docs/transactions)
- [PostgreSQL 事务](https://www.runoob.com/postgresql/postgresql-transaction.html)