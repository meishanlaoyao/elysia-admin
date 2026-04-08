# 快速开始

本章将提供 `Elysia Admin` 项目的快速启动指南，帮助您快速搭建开发环境并运行项目。

## 前置依赖
> **重要：** 请确保已安装以下环境或软件，否则可能导致项目依赖安装失败或启动异常。

- [`Node.js >= 22.0.0`](https://nodejs.org/)
- [`Bun >= 1.2.21`](https://bun.com/)
- [`Redis >= 6`](https://redis.io/)
- [`PostgreSQL >= 16`](https://www.postgresql.org/)

## 下载源码

```bash
git clone https://gitee.com/nian-qian/elysia-admin.git
```

## 启动项目

本项目前端使用 `pnpm` 管理依赖，后端使用 `bun` 运行项目。

### 安装依赖

```bash
# 安装后端依赖
bun install

# 安装前端依赖
pnpm install
```

### 创建数据库

首先需要在 PostgreSQL 中创建一个数据库，以下使用 `Navicat Premium 17` 工具演示数据库创建过程：

![创建数据库](/start/2.png)

> **注意：** 数据库创建完成后即可关闭。在 `开发环境` 下，启动后端服务时会自动初始化数据库；在 `生产环境` 下不会自动初始化数据库，以防止误操作线上已有的数据库。

### 配置项目

#### 后端配置

后端配置文件位于 `/server/src/config/` 目录下，请根据实际部署环境修改对应配置文件：

- `development.yaml`：开发环境配置
- `production.yaml`：生产环境配置

#### 前端配置

前端配置文件位于 `/admin/` 目录下，请根据实际部署环境修改对应配置文件：

- `env.development`：开发环境配置
- `env.production`：生产环境配置

### 运行项目

```bash
# 运行后端项目
bun dev

# 运行前端项目
pnpm dev
```

后端启动成功后，控制台会输出以下信息：

```
============================================================
🚀 Elysia-Admin 启动成功
============================================================
服务地址:     http://localhost:3000/api
API文档:      http://localhost:3000/api/openapi
OpenAPI JSON: http://localhost:3000/api/openapi/json
启动时间:     2026/4/6 11:17:38
运行环境:     development
Bun版本:      1.3.8
进程ID:       25360
============================================================
```

> **注意：** 若使用 `bun dev` 命令启动的后端服务运行环境不是 `development`，则需要在启动前端项目时明确指定运行环境：

```bash
# Windows
$env:NODE_ENV="development"; bun dev

# Linux / macOS
NODE_ENV="development"; bun dev
```

前端项目启动后会自动打开浏览器，默认访问地址为：<http://localhost:3006>。

### 问题排查

1. 若在启动过程中遇到问题，可通过顶部搜索框搜索相关解决方案。
2. 若问题仍未解决，请访问代码仓库平台创建 issue，我们会及时处理。