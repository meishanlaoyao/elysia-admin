<p align="center">
  <a href="https://elysia-admin.top">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://elysia-admin.top/logo.svg">
      <img src="./docs/public/logo.svg" height="128">
    </picture>
    <h1 align="center">Elysia Admin</h1>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/static/v1?label=Bun&message=>=1.2.21&color=orange" alt="Bun Version">
  <img src="https://img.shields.io/static/v1?label=Node.js&message=>=22.0.0&color=blue" alt="Node.js Version">
  <img src="https://img.shields.io/static/v1?label=PostgreSQL&message=>=16&color=blue" alt="PostgreSQL">
  <img src="https://img.shields.io/static/v1?label=Redis&message=>=6&color=red" alt="Redis">
  <img src="https://img.shields.io/static/v1?label=License&message=MIT&color=green" alt="License">
</p>

一个基于 [ElysiaJS](https://elysiajs.com/) + [Art Design Pro](https://www.artd.pro/docs/zh/) 的现代化全栈后台管理系统。

- 官网：<https://elysia-admin.top>
- 演示：<https://demo.elysia-admin.top/admin>（账号：`admin` / 密码：`123456`）
- Gitee：<https://gitee.com/nian-qian/elysia-admin>
- GitHub：<https://github.com/meishanlaoyao/elysia-admin>

![项目截图](./image.jpg)

## 简介

`Elysia Admin` 是一套基于 `ElysiaJS` 后端与 `Vue 3` 前端的全栈解决方案，致力于解决国内 `Node.js` 开发者在构建后台系统时的痛点。

核心亮点：彻底告别繁琐的链式调用，引入类似 `Vue Router` 的配置化路由写法，让代码结构清晰直观，充分释放 `Bun` 运行时的强大性能潜力。

## 性能表现

生产环境下后端服务资源占用：**内存 ~80MB，毫秒级启动**。

| 框架 | 请求/秒 (RPS) |
|------|--------------|
| **Elysia.js + Bun** | ~2,454,631 |
| Gin (Go) | ~676,019 |
| Spring Boot (Java) | ~506,087 |

> 数据来源：TechEmpower 基准测试第 22 轮（2023-10-17）PlainText 结果，实际性能因业务复杂度而异。

## 技术栈

**后端**：Bun + ElysiaJS + PostgreSQL + Redis + Drizzle ORM + BullMQ + Nodemailer

**前端**：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Tailwind CSS

## 内置功能

### 系统管理
- 用户管理、角色管理、菜单管理、部门管理
- 字典管理、API 管理、存储管理、IP 黑名单

### 系统监控
- 在线用户、定时任务、缓存监控、登录日志、操作日志

### 其他
- JWT 双 Token 认证（登录/注册/忘记密码）
- RBAC 权限控制 + 动态路由
- IP 限流 + 接口熔断
- 多主题（亮色/暗色）+ 多语言（中/英）
- 响应式布局

## 快速开始

### 前置依赖

- [Node.js >= 22.0.0](https://nodejs.org/)
- [Bun >= 1.2.21](https://bun.sh/)
- [PostgreSQL >= 16](https://www.postgresql.org/)
- [Redis >= 6](https://redis.io/)

### 克隆项目

```bash
# Gitee
git clone https://gitee.com/nian-qian/elysia-admin.git

# GitHub
git clone https://github.com/meishanlaoyao/elysia-admin.git
```

### 启动后端

```bash
cd server

# 安装依赖
bun install

# 修改 src/config/development.yaml 中的数据库配置

# 推送数据库结构
bun db:push

# 启动开发服务器
bun dev
```

后端服务运行在 `http://localhost:3000`，API 文档访问 `http://localhost:3000/api/openapi`。

### 启动前端

```bash
cd admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端服务自动打开浏览器，默认访问 `http://localhost:3006`。

## 项目结构

```
elysia-admin/
├── admin/          # 前端项目（Vue 3）
├── server/         # 后端项目（ElysiaJS）
└── docs/           # 文档站（VitePress）
```

## 部署

### PM2 部署（推荐）

```bash
cd server

# 构建（Linux/macOS）
NODE_ENV=production bun run build

# Windows
$env:NODE_ENV="production"; bun run build

# 启动（主进程 + Worker 进程）
pm2 start dist/ecosystem.config.cjs
```

### 二进制部署

```bash
NODE_ENV=production bun run build:binary
./dist_binary/server
```

### Docker 部署

```bash
cd server
bun docker:build
bun docker:run
```

### 前端部署

```bash
cd admin
pnpm build
# dist 目录部署到 Nginx / Vercel / Netlify 等
```

## 文件存储

支持阿里云 OSS、腾讯云 COS、七牛云、MinIO、RustFS 等 S3 兼容存储。

推荐本地开发使用 RustFS：

```bash
docker run -d --name rustfs_container --user root \
  -p 9000:9000 -p 9001:9001 \
  -v /mnt/rustfs/data:/data \
  -e RUSTFS_ACCESS_KEY=rustfsadmin \
  -e RUSTFS_SECRET_KEY=rustfsadmin \
  rustfs/rustfs:latest \
  --address :9000 --console-enable \
  --access-key rustfsadmin --secret-key rustfsadmin /data
```

控制台：`http://localhost:9001`

## 配置说明

### 后端（server/src/config/）

```yaml
# development.yaml / production.yaml
server:
  port: 3000

database:
  host: localhost
  port: 5432
  database: elysia_admin
  username: postgres
  password: your_password

redis:
  host: localhost
  port: 6379
  password: your_password
  db: 0

jwt:
  secret: your_jwt_secret
  expiresIn: 7d
```

### 前端（admin/）

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Elysia Admin

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Elysia Admin
```

## 源码分支

| 分支 | 描述 | 状态 |
|------|------|------|
| `master` | 主分支 | 已完成 |
| `uniapp` | 微信小程序分支 | 开发中 |

## 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！