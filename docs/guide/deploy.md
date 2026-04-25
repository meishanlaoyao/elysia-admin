---
title: 部署 - Elysia Admin 指南
description: 介绍 Elysia Admin 的多种生产环境部署方案，包括 Docker 容器化部署、PM2 进程管理部署及宝塔面板部署，附安全建议与故障排查指南。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 部署, Docker, PM2, 宝塔面板, 生产环境, Nginx
  - - meta
    - property: og:title
      content: 部署 - Elysia Admin 指南
  - - meta
    - property: og:description
      content: 支持 Docker、PM2 多种部署方式，快速将 Elysia Admin 上线到生产环境。
---

# 部署

本章将介绍如何将 `Elysia Admin` 部署到生产环境，包括无运维面板部署和有运维面板部署两种方式。

## 无运维面板部署

### Docker 部署

`Docker` 部署适合容器化环境，提供了良好的隔离性和可移植性。

**前置要求：**
- 已安装 Docker
- 已安装 Docker Compose（可选）

**部署步骤：**

1. 进入 server 目录：
```bash [terminal]
cd server
```

2. 构建 Docker 镜像：
::: code-group
```bash [bun]
bun docker:build
```
```bash [docker]
docker build -t hnq1/elysia-admin:latest .
```
:::

3. 运行容器：
::: code-group
```bash [bun]
bun docker:run
```
# 或者
```bash [docker]
docker run -d \
  --name elysia-admin \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v /path/to/production.yaml:/app/production.yaml \
  hnq1/elysia-admin:latest
```
:::

**使用 Docker Compose（推荐）：**

创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'

services:
  app:
    image: hnq1/elysia-admin:latest
    container_name: elysia-admin
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./production.yaml:/app/production.yaml
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    container_name: elysia-admin-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=elysia_admin
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: elysia-admin-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

启动服务：
```bash [docker]
docker-compose up -d
```

**常用 Docker 命令：**
```bash [docker]
# 查看日志
bun docker:logs
# 或者
docker logs -f elysia-admin

# 停止容器
bun docker:stop

# 删除容器
bun docker:rm

# 重启容器
docker restart elysia-admin
```

### PM2 部署

`PM2` 是一个生产级的进程管理器，提供了自动重启、日志管理等功能。本项目采用**主进程 + Worker 进程**双进程架构，PM2 会分别管理两个进程。

**前置要求：**
- 服务器已安装 `Node.js`（建议 v22.13.0 或更高版本）
- 已安装 `PM2` 和 `Bun`

**安装依赖：**
```bash [terminal]
npm i -g pm2 bun
```

**部署步骤：**

1. 进入 `server` 目录：
```bash [terminal]
cd server
```
并进行打包:

::: code-group
```bash [windows]
$env:NODE_ENV="production"; bun run build
```

```bash [linux]
NODE_ENV="production" bun run build
```

```bash [macos]
NODE_ENV="production" bun run build
```
:::

2. 打包完成后，会在 `dist` 目录下生成以下文件：
```bash [terminal]
dist/
├── public/              # 静态资源目录
├── ecosystem.config.cjs # PM2 配置文件
├── index.js             # 主进程入口
├── workers.js           # Worker 进程入口（队列消费 + 定时任务）
├── dist/cjs/            # BullMQ 沙箱 bootstrap（Worker 进程依赖）
├── processors/          # 各队列 Processor 文件
│   ├── system-cron.js
│   ├── flow-buffer.js
│   └── trade-order.js
└── production.yaml      # 生产环境配置文件
```

3. 将 `dist` 目录内的所有文件上传到服务器目录（例如：`/www/wwwroot/elysia-admin`）。

> 注意：上传的是 `dist` 目录**内的文件**，不是 `dist` 目录本身。服务器目录结构应与上方保持一致。

4. 在服务器上启动应用：
```bash [terminal]
cd /www/wwwroot/elysia-admin
pm2 start ecosystem.config.cjs
```

PM2 会同时启动两个进程：
- `{appId}` — 主进程（HTTP 服务）
- `{appId}-workers` — Worker 进程（队列消费、定时任务）

**PM2 常用命令：**
```bash [terminal]
# 查看所有进程状态
pm2 status

# 查看主进程日志
pm2 logs elysia-admin

# 查看 Worker 进程日志
pm2 logs elysia-admin-workers

# 重启所有进程
pm2 restart all

# 重启单个进程
pm2 restart elysia-admin
pm2 restart elysia-admin-workers

# 停止所有进程
pm2 stop all

# 删除所有进程
pm2 delete all

# 保存 PM2 进程列表（开机自启）
pm2 save

# 设置 PM2 开机自启
pm2 startup
```

## 有服务器运维面板

### 宝塔面板

宝塔面板是一款简单易用的服务器运维面板，支持一键部署和管理应用。

**推荐版本：** >= 11.0.0

**安装宝塔面板：**

访问 [宝塔官网](https://www.bt.cn/new/download.html) 下载并安装宝塔面板。

**部署步骤：**

1. 安装环境依赖

进入宝塔面板，依次安装以下软件：
- `PostgreSQL`（推荐 16.x）
- `Redis`（推荐 7.x）
- `Nginx`（用于反向代理）

2. 安装 Node.js 和 Bun

在宝塔面板中进入 `网站` -> `Node项目`，安装 `Node.js`（推荐 v22.13.0 或更高版本）。

然后在终端中安装 Bun：
```bash [terminal]
npm i -g bun
```

3. 上传项目文件

将打包后 `dist` 目录内的所有文件上传到服务器（例如：`/www/wwwroot/elysia-admin`）

4. 配置 Node 项目

在宝塔面板的 `Node项目` 中添加项目：

![项目配置](/guide/3.png)

5. 启动项目

在 Node 项目管理页面点击 `启动` 按钮，或在终端中执行：
```bash [terminal]
cd /www/wwwroot/elysia-admin
pm2 start ecosystem.config.cjs
```

## 部署后检查

部署完成后，建议进行以下检查：

1. **健康检查：** 访问 `http://your-domain/` 确认应用正常运行

2. **进程状态：** 确认主进程和 Worker 进程均正常运行
```bash [terminal]
pm2 status
```

3. **日志检查：** 查看应用日志，确认没有错误信息
```bash [terminal]
# 主进程日志
pm2 logs elysia-admin

# Worker 进程日志
pm2 logs elysia-admin-workers

# Docker 部署
docker logs elysia-admin
```

4. **性能监控：** 使用 PM2 监控应用性能
```bash [terminal]
pm2 monit
```

5. **数据库连接：** 确认应用能正常连接数据库和 Redis

6. **API 测试：** 测试关键 API 接口是否正常响应

7. **队列面板：** 访问 `http://your-domain/bullmq` 确认队列和 Worker 状态正常

## 安全建议

1. **修改默认端口：** 不要使用默认的 3000 端口

2. **配置防火墙：** 只开放必要的端口（80、443）

3. **使用 HTTPS：** 配置 SSL 证书，强制使用 HTTPS

4. **定期更新：** 及时更新系统和依赖包

5. **备份数据：** 定期备份数据库和重要文件

6. **限制访问：** 配置 IP 白名单或使用 VPN

## 故障排查

如果部署过程中遇到问题，可以按以下步骤排查：

1. 查看应用日志，定位错误信息
2. 检查端口是否被占用：`netstat -tunlp | grep 3000`
3. 检查防火墙规则：`firewall-cmd --list-all`
4. 验证数据库连接：使用数据库客户端测试连接
5. 检查文件权限：确保应用有读写权限
6. 查看系统资源：`top` 或 `htop` 检查 CPU 和内存使用情况
7. Worker 进程异常：检查 `dist/cjs/` 目录是否完整，`processors/` 下的文件是否存在

如果问题仍未解决，请查看 [常见问题](/other/faq.html) 或在 Gitee 提交 Issue。