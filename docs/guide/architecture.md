# 架构设计

本项目采用了多种经典的设计模式和架构理念，构建了一个清晰、可维护、可扩展的后端系统。

## 整体架构

### 分层架构 (Layered Architecture)

项目采用经典的三层架构模式：

```
┌─────────────────────────────────────┐
│         表现层 (Routes)              │  ← 路由定义、请求处理
├─────────────────────────────────────┤
│         业务层 (Handlers)            │  ← 业务逻辑、数据处理
├─────────────────────────────────────┤
│         数据层 (Database)            │  ← 数据访问、ORM 操作
└─────────────────────────────────────┘
```

**优势**：
- 职责分离，每层专注自己的功能
- 易于测试和维护
- 可以独立替换某一层的实现

---

## 核心设计模式

### 1. 模块化模式 (Module Pattern)

每个业务模块独立组织，包含三个核心文件：

```
routes/
└── system-user/
    ├── route.ts      # 路由配置
    ├── dto.ts        # 数据传输对象
    └── handle.ts     # 业务处理逻辑
```

**实现示例**：

```typescript
// route.ts - 路由模块定义
const routeModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        {
            url: '/system/user',
            method: 'post',
            summary: '创建',
            dto: CreateDto,
            handle: create,
        }
    ]
};
```

**优势**：
- 高内聚：相关功能集中在一个模块
- 低耦合：模块间相互独立
- 易扩展：添加新功能只需新增模块

---

### 2. 工厂模式 (Factory Pattern)

通过 `RegisterRoutes` 函数统一创建和注册路由：

```typescript
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

**优势**：
- 统一的创建逻辑
- 隐藏复杂的实例化过程
- 便于批量处理和配置

---

### 3. 建造者模式 (Builder Pattern)

`QueryBuilder` 类使用建造者模式构建复杂的查询条件：

```typescript
const where = CreateQueryBuilder(systemUserSchema)
    .eq('delFlag', false)
    .like('username', username)
    .dateRange('createTime', startTime, endTime)
    .build();
```

**优势**：
- 链式调用，代码优雅
- 逐步构建复杂对象
- 提高代码可读性

**实现细节**：
- 每个方法返回 `this`，支持链式调用
- `build()` 方法生成最终的查询条件
- 支持条件组合（AND/OR）

---

### 4. 策略模式 (Strategy Pattern)

通过 DTO 定义不同的验证和响应策略：

```typescript
export const CreateDto = {
    body: t.Pick(InsertSystemUser, ['username', 'password']),
    ...BaseResultDto(SelectSystemUser),
};

export const ListDto = {
    query: BaseListQueryDto({ username: t.Optional(t.String()) }),
    ...BaseResultListDto(t.Omit(SelectSystemUser, ['password'])),
};
```

**优势**：
- 不同场景使用不同策略
- 易于添加新的验证规则
- 符合开闭原则

---

### 5. 模板方法模式 (Template Method Pattern)

通用的数据库操作函数定义了标准流程：

```typescript
export async function InsertOne<T extends PgTable>(
    schema: T,
    data: InferInsertModel<T>
) {
    return await pg.insert(schema).values(data as any);
}

export async function FindPage<T extends PgTable>(
    schema: T,
    where: SQL | undefined,
    options: PaginationOptions<T> = {}
): Promise<PaginationResult<InferSelectModel<T>>> {
    // 1. 计算分页参数
    // 2. 查询总数
    // 3. 查询列表
    // 4. 返回结果
}
```

**优势**：
- 定义算法骨架
- 子步骤可以自定义
- 避免代码重复

---

### 6. 适配器模式 (Adapter Pattern)

`BaseResultData` 统一不同来源的响应格式：

```typescript
export const BaseResultData = {
    ok: (data: any = null) => ({
        code: 200,
        msg: '操作成功',
        data,
    }),
    fail: (code: number = 500, msg?: any) => ({
        code,
        msg: typeof msg === 'string' ? msg : ResCode[code],
        data: null,
    }),
};
```

**优势**：
- 统一接口格式
- 隐藏内部实现差异
- 便于前端统一处理

---

### 7. 单例模式 (Singleton Pattern)

数据库和 Redis 客户端使用单例模式：

```typescript
// src/client/pg.ts
const client = postgres(config.pg);
const pg = drizzle(client);
export default pg;  // 全局唯一实例
```

**优势**：
- 节省资源
- 全局访问点
- 避免重复连接

---

### 8. 装饰器模式 (Decorator Pattern)

通过中间件和 DTO 装饰路由：

```typescript
app.use(openapi({
    documentation: {
        info: {
            title: 'API',
            version: '1.0.0',
        },
    },
}));
```

**优势**：
- 动态添加功能
- 不修改原有代码
- 符合开闭原则

---

## 架构原则

### SOLID 原则

#### 1. 单一职责原则 (SRP)

每个文件只负责一个功能：
- `route.ts` - 只负责路由定义
- `dto.ts` - 只负责数据验证
- `handle.ts` - 只负责业务逻辑

#### 2. 开闭原则 (OCP)

- 通过添加新模块扩展功能，无需修改现有代码
- 通过 DTO 扩展验证规则
- 通过 QueryBuilder 扩展查询条件

#### 3. 里氏替换原则 (LSP)

- 所有数据库操作函数接受泛型 `PgTable`
- 可以替换为任何符合接口的实现

#### 4. 接口隔离原则 (ISP)

- `IRoute` 和 `IRouteModule` 接口精简
- 只包含必要的属性

#### 5. 依赖倒置原则 (DIP)

- 业务层依赖抽象的数据库接口
- 不直接依赖具体的数据库实现

---

## 设计理念

### 1. 约定优于配置 (Convention over Configuration)

- 统一的目录结构
- 统一的命名规范
- 统一的响应格式

### 2. DRY 原则 (Don't Repeat Yourself)

- 通用的数据库操作函数
- 可复用的 DTO 工具
- 统一的错误处理

### 3. KISS 原则 (Keep It Simple, Stupid)

- 简洁的 API 设计
- 清晰的代码结构
- 最小化复杂度

### 4. YAGNI 原则 (You Aren't Gonna Need It)

- 不预先实现不需要的功能
- 按需添加日志、认证等功能
- 保持核心简洁

---

## 数据流

### 请求处理流程

```
客户端请求
    ↓
路由匹配 (route.ts)
    ↓
参数验证 (dto.ts)
    ↓
业务处理 (handle.ts)
    ↓
数据库操作 (db.ts)
    ↓
响应格式化 (result.ts)
    ↓
返回客户端
```

### 典型的 CRUD 流程

```typescript
// 1. 路由定义
{
    url: '/system/user',
    method: 'post',
    dto: CreateDto,      // 参数验证
    handle: create,      // 业务处理
}

// 2. 业务处理
export async function create(req: Context) {
    try {
        const data = req.body;
        data.password = BcryptHash(data.password);  // 数据处理
        await InsertOne(schema, data);              // 数据库操作
        return BaseResultData.ok();                 // 统一响应
    } catch (error) {
        return BaseResultData.fail(500, error);     // 错误处理
    }
}
```

---

## 扩展性设计

### 1. 水平扩展

- 无状态设计，支持多实例部署
- 数据库连接池管理
- Redis 缓存共享

### 2. 垂直扩展

- 模块化设计，易于添加新功能
- 插件化架构，支持中间件
- 灵活的配置系统

### 3. 数据库扩展

- ORM 抽象层，易于切换数据库
- 支持读写分离
- 支持分库分表

---

## 性能优化

### 1. 查询优化

- 使用 QueryBuilder 避免 N+1 查询
- 分页查询减少数据传输
- 索引优化（在数据库层面）

### 2. 缓存策略

- Redis 缓存热点数据
- 查询结果缓存
- 配置缓存时间

### 3. 连接池

- 数据库连接池复用
- 合理配置最大连接数
- 自动回收空闲连接

---

## 安全设计

### 1. 数据验证

- DTO 层统一验证
- TypeScript 类型检查
- 参数白名单

### 2. 密码安全

- Bcrypt 加密存储
- 查询时过滤密码字段
- 更新时重新加密

### 3. SQL 注入防护

- ORM 参数化查询
- 避免字符串拼接
- 输入过滤

### 4. 软删除

- 防止数据误删
- 保留审计记录
- 支持数据恢复

---

## 最佳实践

### 1. 代码组织

```
src/
├── client/       # 客户端连接（单例）
├── common/       # 通用工具（可复用）
├── config/       # 配置管理（集中管理）
├── routes/       # 路由模块（模块化）
├── schema/       # 数据模型（类型安全）
└── utils/        # 工具函数（纯函数）
```

### 2. 命名规范

- 文件名：小写 + 连字符（kebab-case）
- 函数名：驼峰命名（camelCase）
- 类型名：帕斯卡命名（PascalCase）
- 常量名：大写 + 下划线（UPPER_CASE）

### 3. 错误处理

```typescript
try {
    // 业务逻辑
} catch (error) {
    console.error('[时间] [错误类型]', error);
    return BaseResultData.fail(500, error);
}
```

### 4. 类型安全

```typescript
// 使用 ORM 生成的类型
const data = req.body as typeof schema.$inferInsert;

// 使用泛型函数
await InsertOne<typeof schema>(schema, data);
```

---

## 总结

本项目的架构设计具有以下特点：

✅ **清晰的分层结构** - 职责分离，易于维护  
✅ **模块化设计** - 高内聚低耦合，易于扩展  
✅ **设计模式应用** - 工厂、建造者、策略等多种模式  
✅ **SOLID 原则** - 符合面向对象设计原则  
✅ **类型安全** - 全面的 TypeScript 支持  
✅ **性能优化** - 连接池、缓存、分页等优化  
✅ **安全可靠** - 参数验证、密码加密、软删除  

这是一个**生产级别**的架构设计，适合中小型项目快速开发，也可以作为大型项目的基础架构。
