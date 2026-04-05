# 快速开始

## 前置依赖
> 请确保已安装以下前置依赖， 否则会导致项目无法安装依赖或者启动失败。

- [`Node.JS >= 22.0.0`](https://nodejs.org/)
- [`Bun >= 1.2.21`](https://bun.com/)
- [`Redis >= 6`](https://redis.io/)
- [`PostgreSQL >= 16`](https://www.postgresql.org/)

## 下载源码
```bash
git clone https://gitee.com/nian-qian/elysia-admin.git
```

## 启动项目
本项目前端使用 `pnpm` 工具安装依赖，推荐使用 `pnpm` 安装依赖。后端使用 `bun` 工具启动项目。

### 安装依赖
```bash
# 安装后端依赖
bun install

# 安装前端依赖
pnpm install
```

### 配置项目
#### 后端配置
后端的配置文件在 `/server/src/config/*.yaml` 。请根据您的实际情况修改配置文件。
- `development.yaml`：开发环境配置
- `production.yaml`：生产环境配置

#### 前端配置
前端的配置文件在 `/admin/env.*` 。请根据您的实际情况修改配置文件。
- `env.development`：开发环境配置
- `env.production`：生产环境配置

### 运行项目
```bash
# 运行后端项目
bun dev

# 运行前端项目
pnpm dev
```
项目启动后会自动打开浏览器运行，默认访问地址：<http://localhost:3006>。

### 其他
1. 如果你在启动项目遇到问题，可在顶部点击搜索框，搜索相关问题。
2. 如果还是无法解决，请点击顶部的代码仓库，去代码仓库平台创建 issue ，我们会在第一时间进行处理。