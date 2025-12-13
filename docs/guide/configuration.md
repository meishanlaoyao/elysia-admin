# 配置说明

## 配置文件

项目的配置文件位于 `src/config/index.ts`，包含应用、数据库、Redis 等配置。

## 应用配置

```typescript
app: {
    id: "Elysia-Admin",        // 应用ID（多实例部署时建议设置不同ID）
    port: 3000,                 // 服务端口
    lang: "zh",                 // 应用语言
    prefix: "/api",             // API 路径前缀
    baseCacheTime: 5 * 60 * 1000, // 基础缓存时间（毫秒）
}
```

### 配置项说明

- **id**: 应用标识符，在同一服务器部署多个实例时应设置不同的 ID
- **port**: HTTP 服务监听端口
- **lang**: 应用默认语言
- **prefix**: API 路由前缀，所有接口都会加上此前缀
- **baseCacheTime**: 默认缓存时间，单位为毫秒

## PostgreSQL 配置

```typescript
pg: {
    host: 'localhost',          // 数据库主机地址
    port: 5432,                 // 数据库端口
    username: 'postgres',       // 数据库用户名
    user: 'postgres',           // 数据库用户名（别名）
    password: '123456',         // 数据库密码
    database: 'elysia-admin',   // 数据库名称
    max: 20,                    // 最大连接数
    idle_timeout: 20,           // 空闲连接超时时间（秒）
    connect_timeout: 10,        // 连接超时时间（秒）
    ssl: false,                 // 是否启用 SSL 连接
}
```

### 配置项说明

- **host**: PostgreSQL 服务器地址
- **port**: PostgreSQL 服务端口，默认 5432
- **username/user**: 数据库用户名
- **password**: 数据库密码
- **database**: 要连接的数据库名称
- **max**: 连接池最大连接数
- **idle_timeout**: 空闲连接在连接池中保持的时间
- **connect_timeout**: 建立连接的超时时间
- **ssl**: 是否使用 SSL 加密连接

## Redis 配置

```typescript
redis: "redis://username:password@host:port"
```

Redis 连接字符串格式：`redis://[username:password@]host:port[/database]`

### 示例

```typescript
// 无密码
redis: "redis://localhost:6379"

// 有密码
redis: "redis://default:mypassword@localhost:6379"

// 指定数据库
redis: "redis://localhost:6379/0"
```

## Drizzle ORM 配置

Drizzle 配置文件位于 `drizzle.config.ts`：

```typescript
export default defineConfig({
    out: './drizzle',              // 迁移文件输出目录
    schema: './src/schema/*.ts',   // 数据库表结构文件路径
    dialect: 'postgresql',         // 数据库类型
    dbCredentials: config.pg       // 数据库连接配置
});
```

## 环境变量

建议在生产环境使用环境变量来管理敏感配置：

```bash
# .env 文件示例
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=elysia-admin

REDIS_URL=redis://localhost:6379

APP_PORT=3000
```

然后在配置文件中读取：

```typescript
export default {
    app: {
        port: process.env.APP_PORT || 3000,
    },
    pg: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'elysia-admin',
    },
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
}
```

## 注意事项

1. **生产环境**: 务必修改默认密码和敏感配置
2. **多实例部署**: 确保每个实例的 `app.id` 不同
3. **连接池**: 根据实际负载调整 `pg.max` 连接数
4. **SSL**: 生产环境建议启用数据库 SSL 连接
5. **Redis**: 生产环境务必设置 Redis 密码
