# 项目介绍

## 概述

Elysia-Admin 是一个基于 [Elysia](https://elysiajs.com/) 框架构建的现代化后端管理系统，使用 TypeScript 开发，提供高性能的 RESTful API 服务。

## 技术栈

### 后端
- **运行时**: Bun
- **框架**: Elysia (最新版本)
- **数据库**: PostgreSQL 
- **ORM**: Drizzle ORM
- **缓存**: Redis 7.2+
- **API 文档**: OpenAPI (Swagger)
- **验证**: Zod / TypeBox
- **容器化**: Docker

### 前端
- **框架**: Ant Design Pro
- **UI 组件**: Ant Design

### 小程序
- **框架**: unibase

## 核心特性

- ⚡ **高性能**: 基于 Bun 运行时，提供极致的性能体验
- 🔒 **类型安全**: 全面的 TypeScript 类型支持
- 📝 **自动文档**: 集成 OpenAPI，自动生成 API 文档
- 🗃️ **ORM 支持**: 使用 Drizzle ORM，提供类型安全的数据库操作
- 🔄 **软删除**: 内置软删除机制，数据更安全
- 📦 **模块化**: 清晰的模块化架构，易于扩展
- 🐳 **容器化**: 支持 Docker 部署

## 项目结构

```
server/
├── src/
│   ├── client/          # 客户端连接（数据库、Redis）
│   ├── common/          # 通用工具和基础类
│   ├── config/          # 配置文件
│   ├── routes/          # 路由模块
│   ├── schema/          # 数据库表结构
│   ├── utils/           # 工具函数
│   └── index.ts         # 应用入口
├── drizzle/             # 数据库迁移文件
├── Dockerfile           # Docker 配置
├── drizzle.config.ts    # Drizzle 配置
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 快速开始

### 环境要求

- Bun >= 1.0
- PostgreSQL >= 12
- Redis >= 7.2

### 安装依赖

```bash
cd server
bun install
```

### 配置环境

编辑 `src/config/index.ts` 文件，配置数据库和 Redis 连接信息。

### 数据库迁移

```bash
bun run db:push
```

### 启动开发服务器

```bash
bun run dev
```

服务将在 `http://localhost:3000/api` 启动。

### 访问 API 文档

- OpenAPI JSON: `http://localhost:3000/api/openapi/json`
- OpenAPI UI: `http://localhost:3000/api/openapi`

## 生产部署

### 构建可执行文件

```bash
bun run build
```

### Docker 部署

```bash
# 构建镜像
bun run docker:build

# 运行容器
bun run docker:run

# 查看日志
bun run docker:logs

# 停止容器
bun run docker:stop

# 删除容器
bun run docker:rm
```
