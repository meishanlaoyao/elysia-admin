# PostgreSQL 事务辅助工具使用文档

## 目录

- [简介](#简介)
- [核心概念](#核心概念)
- [基础用法](#基础用法)
- [高级用法](#高级用法)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 简介

事务辅助工具提供了一套优雅的 API 来处理 PostgreSQL 事务，支持：

- ✅ 简单的函数式事务执行
- ✅ 链式调用的构建器模式
- ✅ 批量事务管理
- ✅ 嵌套事务检测
- ✅ 完整的生命周期钩子
- ✅ 灵活的隔离级别配置
- ✅ TypeScript 类型安全

## 核心概念

### 事务上下文 (TransactionContext)

事务上下文是在事务回调函数中使用的数据库连接对象，它提供了所有 Drizzle ORM 的查询方法。

```typescript
type TransactionContext = PgTransaction<...>;
```

### 事务回调函数 (TransactionCallback)

事务回调函数是执行事务逻辑的核心函数，接收事务上下文作为参数。

```typescript
type TransactionCallback<T> = (tx: TransactionContext) => Promise<T>;
```

## 基础用法

### 1. 简单事务执行

使用 `RunTransaction` 函数执行最基本的事务：

```typescript
import { RunTransaction } from '@/common/transaction';
import { systemUserSchema } from '@/schema/system_user';

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

### 2. 多表操作事务

在一个事务中操作多个表：

```typescript
import { RunTransaction } from '@/common/transaction';
import { systemUserSchema } from '@/schema/system_user';
import { systemRoleSchema } from '@/schema/system_role';

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

### 3. 事务回滚

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

## 高级用法

### 1. 使用构建器模式

使用 `CreateTransaction` 创建更复杂的事务配置：

```typescript
import { CreateTransaction } from '@/common/transaction';

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

### 2. 隔离级别配置

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

### 3. 只读事务

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

### 4. 生命周期钩子

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

### 5. 批量事务执行

#### 顺序执行（串行）

按顺序执行多个事务，任何一个失败则停止：

```typescript
import { CreateBatchTransaction } from '@/common/transaction';

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

#### 并行执行

并行执行多个独立事务：

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

### 6. 嵌套事务支持

使用 `WithTransaction` 创建可复用的函数，自动检测是否在事务中：

```typescript
import { WithTransaction, TransactionContext } from '@/common/transaction';
import { db } from '@/common/db';

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

### 7. 复杂业务场景示例

#### 用户注册流程

```typescript
import { RunTransaction } from '@/common/transaction';
import { InsertOne } from '@/common/db';
import { systemUserSchema } from '@/schema/system_user';
import { systemRoleSchema } from '@/schema/system_role';
import { systemLoginLogSchema } from '@/schema/system_login_log';

async function registerUser(userData: {
    userName: string;
    password: string;
    email: string;
}) {
    return await RunTransaction(async (tx) => {
        // 1. 创建用户
        const user = await tx.insert(systemUserSchema).values({
            userName: userData.userName,
            password: userData.password,
            email: userData.email,
            status: true
        }).returning();
        
        // 2. 分配默认角色
        const defaultRole = await tx.select()
            .from(systemRoleSchema)
            .where(eq(systemRoleSchema.roleKey, 'user'))
            .limit(1);
        
        if (defaultRole.length > 0) {
            await tx.insert(systemUserRoleSchema).values({
                userId: user[0].userId,
                roleId: defaultRole[0].roleId
            });
        }
        
        // 3. 记录注册日志
        await tx.insert(systemLoginLogSchema).values({
            userName: userData.userName,
            status: true,
            msg: '用户注册成功',
            loginTime: new Date()
        });
        
        return user[0];
    }, {
        onCommit: async () => {
            // 发送欢迎邮件
            console.log('发送欢迎邮件给:', userData.email);
        },
        onRollback: async (error) => {
            // 记录注册失败日志
            console.error('用户注册失败:', error);
        }
    });
}
```

#### 订单处理流程

```typescript
async function processOrder(orderId: number) {
    return await CreateTransaction()
        .isolation('serializable')  // 使用最高隔离级别防止并发问题
        .execute(async (tx) => {
            // 1. 锁定订单
            const order = await tx.select()
                .from(orderSchema)
                .where(eq(orderSchema.orderId, orderId))
                .for('update');  // 行锁
            
            if (order.length === 0) {
                throw new Error('订单不存在');
            }
            
            if (order[0].status !== 'pending') {
                throw new Error('订单状态不正确');
            }
            
            // 2. 扣减库存
            const product = await tx.select()
                .from(productSchema)
                .where(eq(productSchema.productId, order[0].productId))
                .for('update');
            
            if (product[0].stock < order[0].quantity) {
                throw new Error('库存不足');
            }
            
            await tx.update(productSchema)
                .set({ stock: product[0].stock - order[0].quantity })
                .where(eq(productSchema.productId, order[0].productId));
            
            // 3. 更新订单状态
            await tx.update(orderSchema)
                .set({ status: 'processing' })
                .where(eq(orderSchema.orderId, orderId));
            
            // 4. 创建支付记录
            await tx.insert(paymentSchema).values({
                orderId: orderId,
                amount: order[0].totalAmount,
                status: 'pending'
            });
            
            return { success: true, orderId };
        })
        .run();
}
```

## API 参考

### RunTransaction

执行事务的核心函数。

```typescript
function RunTransaction<T>(
    callback: TransactionCallback<T>,
    options?: TransactionOptions
): Promise<T>
```

**参数:**
- `callback`: 事务回调函数
- `options`: 事务选项（可选）

**返回:** 事务执行结果

### CreateTransaction

创建事务构建器。

```typescript
function CreateTransaction<T>(): TransactionBuilder<T>
```

**链式方法:**
- `.execute(callback)`: 设置事务回调
- `.isolation(level)`: 设置隔离级别
- `.readOnly()`: 设置为只读事务
- `.readWrite()`: 设置为读写事务
- `.disableErrorLog()`: 禁用错误日志
- `.onError(handler)`: 设置错误处理器
- `.onBegin(handler)`: 设置开始钩子
- `.onCommit(handler)`: 设置提交钩子
- `.onRollback(handler)`: 设置回滚钩子
- `.run()`: 执行事务

### CreateBatchTransaction

创建批量事务执行器。

```typescript
function CreateBatchTransaction(): BatchTransactionExecutor
```

**方法:**
- `.add(name, callback, options?)`: 添加事务
- `.runAll()`: 顺序执行所有事务
- `.runAllParallel()`: 并行执行所有事务

### WithTransaction

嵌套事务辅助函数。

```typescript
function WithTransaction<T>(
    txOrDb: TransactionContext | typeof db,
    callback: TransactionCallback<T>
): Promise<T>
```

**参数:**
- `txOrDb`: 事务上下文或数据库实例
- `callback`: 事务回调函数

**返回:** 执行结果

### TransactionOptions

事务选项接口。

```typescript
interface TransactionOptions {
    isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
    accessMode?: 'read write' | 'read only';
    enableErrorLog?: boolean;
    onError?: (error: Error) => void;
    onBegin?: () => void | Promise<void>;
    onCommit?: () => void | Promise<void>;
    onRollback?: (error: Error) => void | Promise<void>;
}
```

## 最佳实践

### 1. 选择合适的隔离级别

```typescript
// 一般业务操作：使用默认的 read committed
await RunTransaction(async (tx) => {
    // 普通的增删改查
});

// 需要防止幻读：使用 repeatable read
await RunTransaction(async (tx) => {
    // 统计、报表等需要一致性读的操作
}, { isolationLevel: 'repeatable read' });

// 需要完全串行化：使用 serializable
await RunTransaction(async (tx) => {
    // 库存扣减、账户转账等关键操作
}, { isolationLevel: 'serializable' });
```

### 2. 合理使用只读事务

```typescript
// 对于纯查询操作，使用只读事务
const report = await CreateTransaction()
    .readOnly()
    .execute(async (tx) => {
        const users = await tx.select().from(systemUserSchema);
        const roles = await tx.select().from(systemRoleSchema);
        return { users, roles };
    })
    .run();
```

### 3. 事务粒度控制

```typescript
// ❌ 不好：事务太大，包含非数据库操作
await RunTransaction(async (tx) => {
    await tx.insert(userSchema).values({ name: 'test' });
    await sendEmail('test@example.com');  // 外部 API 调用
    await uploadFile(file);  // 文件上传
});

// ✅ 好：事务只包含数据库操作
const user = await RunTransaction(async (tx) => {
    return await tx.insert(userSchema).values({ name: 'test' }).returning();
});
// 事务外执行其他操作
await sendEmail('test@example.com');
await uploadFile(file);
```

### 4. 错误处理和日志

```typescript
await RunTransaction(async (tx) => {
    // 事务逻辑
}, {
    onRollback: async (error) => {
        // 记录详细的错误信息
        await InsertOne(systemOperLogSchema, null, {
            operType: 'error',
            operName: '用户创建',
            errorMsg: error.message,
            operTime: new Date()
        });
    }
});
```

### 5. 使用 WithTransaction 提高代码复用

```typescript
// 定义可复用的业务函数
async function updateUserStatus(userId: number, status: boolean, tx?: TransactionContext) {
    return await WithTransaction(tx || db, async (t) => {
        return await t.update(systemUserSchema)
            .set({ status })
            .where(eq(systemUserSchema.userId, userId));
    });
}

// 可以在事务中使用
await RunTransaction(async (tx) => {
    await updateUserStatus(1, false, tx);
    await updateUserStatus(2, false, tx);
});

// 也可以独立使用
await updateUserStatus(3, true);
```

## 常见问题

### Q1: 事务超时怎么办？

A: PostgreSQL 有默认的语句超时时间，可以通过配置调整：

```typescript
// 在事务开始前设置超时
await RunTransaction(async (tx) => {
    await tx.execute(sql`SET statement_timeout = '30s'`);
    // 事务逻辑
});
```

### Q2: 如何处理死锁？

A: 死锁会自动回滚，捕获错误后可以重试：

```typescript
async function executeWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await RunTransaction(async (tx) => {
                // 事务逻辑
            });
        } catch (error) {
            if (error.message.includes('deadlock') && i < maxRetries - 1) {
                console.log(`检测到死锁，重试 ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
                continue;
            }
            throw error;
        }
    }
}
```

### Q3: 事务中可以调用其他事务吗？

A: 可以，使用 `WithTransaction` 会自动检测并复用当前事务：

```typescript
await RunTransaction(async (tx) => {
    // 这些函数会复用当前事务
    await createUser('user1', tx);
    await createUser('user2', tx);
});
```

### Q4: 如何在事务中使用原有的 db 工具函数？

A: 大部分 db 工具函数不支持传入事务上下文，需要直接使用 tx 对象：

```typescript
await RunTransaction(async (tx) => {
    // ❌ 不能这样用
    // await InsertOne(userSchema, null, { name: 'test' });
    
    // ✅ 应该这样用
    await tx.insert(userSchema).values({ name: 'test' });
});
```

### Q5: 批量操作如何优化性能？

A: 使用批量插入而不是循环单条插入：

```typescript
await RunTransaction(async (tx) => {
    // ❌ 慢：循环插入
    for (const user of users) {
        await tx.insert(userSchema).values(user);
    }
    
    // ✅ 快：批量插入
    await tx.insert(userSchema).values(users);
});
```

## 总结

事务辅助工具提供了灵活且强大的事务管理能力，通过合理使用可以：

- 保证数据一致性
- 简化错误处理
- 提高代码可维护性
- 支持复杂的业务场景

选择合适的 API 和配置，可以让事务处理更加优雅和高效。
