# 快速开始

本指南将帮助你快速搭建和运行 Elysia-Admin 项目。

## 环境准备

### 安装 Bun

Bun 是一个快速的 JavaScript 运行时，类似于 Node.js。

**macOS/Linux**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

验证安装：

```bash
bun --version
```

### 安装 PostgreSQL

**macOS (使用 Homebrew)**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**

从 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载安装程序。

### 安装 Redis

**macOS (使用 Homebrew)**

```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Windows**

从 [Redis 官网](https://redis.io/download) 下载或使用 WSL。

## 项目安装

### 1. 克隆项目

```bash
git clone https://gitee.com/nian-qian/elysia-admin.git
cd elysia-admin/server
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置数据库

创建数据库：

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE "elysia-admin";

# 退出
\q
```

### 4. 配置应用

编辑 `src/config/index.ts`，修改数据库和 Redis 配置：

```typescript
export default {
    app: {
        id: "Elysia-Admin",
        port: 3000,
        lang: "zh",
        prefix: "/api",
        baseCacheTime: 5 * 60 * 1000,
    },
    pg: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        user: 'postgres',
        password: '你的数据库密码',
        database: 'elysia-admin',
        max: 20,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: false,
    },
    redis: "redis://localhost:6379",
}
```

### 5. 初始化数据库

推送数据库 Schema：

```bash
bun run db:push
```

### 6. 启动开发服务器

```bash
bun run dev
```

看到以下输出表示启动成功：

```
Elysia-Admin is running at http://localhost:3000/api
OpenAPI JSON: http://localhost:3000/api/openapi/json
OpenAPI: http://localhost:3000/api/openapi
StartTime: 2024-01-01 12:00:00
PID: 12345
```

## 验证安装

### 1. 访问 API 文档

打开浏览器访问：`http://localhost:3000/api/openapi`

你将看到自动生成的 API 文档界面。

### 2. 测试 API

使用 curl 或 Postman 测试创建用户接口：

```bash
curl -X POST http://localhost:3000/api/system/user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "email": "admin@example.com",
    "phone": "13800138000"
  }'
```

预期响应：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

### 3. 查询用户列表

```bash
curl http://localhost:3000/api/system/user/list?pageNum=1&pageSize=10
```

## 项目结构

```
server/
├── src/
│   ├── client/          # 数据库和 Redis 客户端
│   │   ├── pg.ts
│   │   └── redis.ts
│   ├── common/          # 通用工具
│   │   ├── bcrypt.ts    # 密码加密
│   │   ├── db.ts        # 数据库操作
│   │   ├── dto.ts       # DTO 工具
│   │   ├── result.ts    # 响应工具
│   │   ├── route.ts     # 路由类型
│   │   ├── schema.ts    # 基础 Schema
│   │   ├── time.ts      # 时间工具
│   │   └── uuid.ts      # UUID 生成
│   ├── config/          # 配置文件
│   │   └── index.ts
│   ├── routes/          # 路由模块
│   │   ├── system-user/ # 系统用户模块
│   │   │   ├── dto.ts
│   │   │   ├── handle.ts
│   │   │   └── route.ts
│   │   └── index.ts     # 路由注册
│   ├── schema/          # 数据库表结构
│   │   └── system_user.ts
│   ├── utils/           # 工具函数
│   │   └── rescode.ts
│   └── index.ts         # 应用入口
├── drizzle/             # 数据库迁移文件
├── Dockerfile           # Docker 配置
├── drizzle.config.ts    # Drizzle 配置
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 开发工作流

### 1. 创建新的数据表

在 `src/schema/` 目录下创建新的表结构文件：

```typescript
// src/schema/article.ts
import { pgTable, bigserial, varchar, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const articleSchema = pgTable('article', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content'),
    ...BaseSchema,
});

export const InsertArticle = createInsertSchema(articleSchema);
export const SelectArticle = createSelectSchema(articleSchema);
```

### 2. 推送到数据库

```bash
bun run db:push
```

### 3. 创建路由模块

参考 [路由系统](./routing.md) 文档创建新的路由模块。

### 4. 测试接口

在 OpenAPI 文档中测试新创建的接口。

## 常见问题

### 数据库连接失败

**问题**: `Error: connect ECONNREFUSED`

**解决方案**:
1. 确认 PostgreSQL 服务已启动
2. 检查配置文件中的数据库连接信息
3. 确认数据库已创建

```bash
# 检查 PostgreSQL 状态
pg_isready -h localhost -p 5432

# 启动 PostgreSQL
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Redis 连接失败

**问题**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**解决方案**:
1. 确认 Redis 服务已启动
2. 检查 Redis 连接字符串

```bash
# 检查 Redis 状态
redis-cli ping

# 启动 Redis
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server
```

### 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
1. 修改配置文件中的端口号
2. 或者杀死占用端口的进程

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 依赖安装失败

**问题**: 依赖安装时出错

**解决方案**:
1. 清除缓存重新安装

```bash
rm -rf node_modules bun.lock
bun install
```

2. 确保 Bun 版本是最新的

```bash
bun upgrade
```

## 下一步

- 阅读 [数据库操作](./database.md) 了解如何使用 ORM
- 阅读 [路由系统](./routing.md) 学习如何创建新模块
- 阅读 [部署指南](./deployment.md) 了解如何部署到生产环境

## 获取帮助

- 查看 [Elysia 文档](https://elysiajs.com/)
- 查看 [Drizzle ORM 文档](https://orm.drizzle.team/)
- 提交 [Gitee Issue](https://gitee.com/nian-qian/elysia-admin/issues)
