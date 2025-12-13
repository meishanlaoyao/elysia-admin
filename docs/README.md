# Elysia-Admin 文档

欢迎使用 Elysia-Admin 文档！

## 文档结构

### 指南

- [项目介绍](./guide/introduction.md) - 了解项目概况和技术栈
- [配置说明](./guide/configuration.md) - 配置应用、数据库和 Redis
- [数据库操作](./guide/database.md) - 学习如何使用 Drizzle ORM 和查询构建器
- [路由系统](./guide/routing.md) - 了解路由架构和如何创建新模块
- [通用工具](./guide/common-utils.md) - 使用项目提供的工具函数
- [部署指南](./guide/deployment.md) - 部署到生产环境

### API 文档

- [系统用户 API](./api/system-user.md) - 用户管理接口文档

## 快速开始

```bash
# 安装依赖
cd server
bun install

# 配置数据库
# 编辑 src/config/index.ts

# 推送数据库 Schema
bun run db:push

# 启动开发服务器
bun run dev
```

访问 `http://localhost:3000/api/openapi` 查看 API 文档。

## 技术栈

- **运行时**: Bun
- **框架**: Elysia
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **缓存**: Redis
- **文档**: OpenAPI

## 项目地址

Gitee: [https://gitee.com/nian-qian/elysia-admin](https://gitee.com/nian-qian/elysia-admin)

## 技术架构

- **后端**: Bun + Elysia
- **前端**: Ant Design Pro
- **小程序**: unibase

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
