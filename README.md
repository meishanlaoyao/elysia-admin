<p align="center">
  <a href="https://elysia-admin.top">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://elysia-admin.top/big-logo.webp">
      <img src="https://elysia-admin.top/big-logo.webp" height="128">
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

### 支付
- 统一适配层 `Pay(channel, platform)` 支持支付宝、微信支付、PayPal 多渠道多终端
- 内置下单、查询、退款、异步回调验签，业务侧无需处理各渠道差异

### 认证与安全
- JWT 双 Token 认证（登录/注册/忘记密码）
- RBAC 权限控制 + 动态路由
- IP 限流 + 接口熔断

### 界面
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

## 开发目录建议

日常做业务开发，**只需保留 `admin/` 与 `server/`** 即可跑通前后端。其余目录按工具链选用，不用可删。

### 必须保留

| 目录 / 文件 | 说明 |
|-------------|------|
| `admin/` | 前端源码与配置 |
| `server/` | 后端源码、数据库 Schema、配置 |
| `README.md`、`LICENSE` | 项目说明与许可证 |

### 按需保留（不用可删）

| 目录 / 文件 | 适用场景 | 删除影响 |
|-------------|----------|----------|
| `docs/` | 维护或本地预览 VitePress 文档站 | 不影响前后端开发与运行 |
| `.vscode/`、`elysia-admin.code-workspace` | VS Code 一键任务、调试配置 | 不影响运行，仅失去 IDE 预设 |
| `AGENTS.md` | Codex 及通用 AI 项目指引 | Codex 分层指令会缺失 |
| `.ai/` | 任意 AI 辅助开发（模块 SOP、代码模板） | 不影响运行，AI 生成质量可能下降 |
| `.cursor/` | Cursor 规则与 Skill | 仅 Cursor 失效 |
| `.claude/` | Claude Code 规则 | 仅 Claude Code 失效 |
| `.codex/` | OpenAI Codex 说明 | 仅 Codex 失效 |
| `.kiro/` | Kiro Steering | 仅 Kiro 失效 |
| `.trae/` | Trae 规则 | 仅 Trae 失效 |

> 多个 AI IDE 配置语义一致，**只保留你正在用的那一套**即可；`.ai/` 是各工具共用的规范文档，用 AI 写模块时建议留着。

### 可安全删除（会自动重新生成）

| 路径 | 说明 |
|------|------|
| `admin/node_modules/`、`server/node_modules/`、`docs/node_modules/` | 依赖目录，`pnpm install` / `bun install` 可恢复 |
| `admin/dist/` | 前端构建产物，`pnpm build` 生成 |
| `server/dist/` | 后端构建产物，`bun run build` 生成 |
| `server/database/drizzle/` | Drizzle 迁移快照，`bun db:push` 等命令可再生成 |
| `docs/.vitepress/cache/`、`docs/.vitepress/dist/` | 文档站缓存与构建产物 |
| `server/logs/` | 运行日志 |

**精简示例**（只做业务、用 Cursor 开发）：

```
elysia-admin/
├── admin/
├── server/
├── .ai/              # 可选，AI 写模块时推荐
├── .cursor/          # 可选，Cursor 用户保留
├── AGENTS.md         # 可选
├── README.md
└── LICENSE
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

## 部署

### PM2 部署（推荐）

```bash
cd server

# 构建
bun run build

# 启动（主进程 + Worker 进程）
pm2 start dist/ecosystem.config.cjs
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

## 源码分支

| 分支 | 描述 | 状态 |
|------|------|------|
| `master` | 主分支 | 已完成 |

## 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！