# 介绍
<p align="center">
  <a href="https://gitee.com/nian-qian/elysia-admin">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/logo.svg">
      <img src="/logo.svg" style="width: 128px;" alt="Elysia Admin">
    </picture>
    <h1 align="center">Elysia Admin</h1>
  </a>
</p>

一个基于 [ElysiaJS](https://elysiajs.com/) + [Art Design Pro](https://www.artd.pro/docs/zh/) 的现代化全栈后台管理系统。

<div style="display: flex; justify-content: center; align-items: center;">
  <img style="margin: 0 8px;" src="https://img.shields.io/static/v1?label=Node.js&message=>=22.0.0&color=blue" alt="Node.js Version">
  <img style="margin: 0 8px;" src="https://img.shields.io/static/v1?label=Bun&message=>=1.2.21&color=orange" alt="Bun Version">
  <img style="margin: 0 8px;" src="https://img.shields.io/static/v1?label=PostgreSQL&message=>=16&color=blue" alt="PostgreSQL">
  <img style="margin: 0 8px;" src="https://img.shields.io/static/v1?label=Redis&message=>=6&color=red" alt="Redis">
  <img style="margin: 0 8px;" src="https://img.shields.io/static/v1?label=License&message=MIT&color=green" alt="License">
</div>

## Elysia Admin 是什么？
`Elysia Admin` （elysia-admin）是一套基于 `ElysiaJS` 后端与 `Vue 3` 前端的全栈解决方案。我们致力于解决国内 `Node.js` 开发者在构建后台系统时的痛点，提供一套开箱即用的高性能、高颜值管理模板。

本项目的核心特色在于其独特的后端架构：我们彻底告别了繁琐且难以维护的链式调用，创新性地引入了类似 `Vue Router` 的配置化写法。这种模块化的路由配置方式，不仅让代码逻辑更加清晰直观，更完美契合了国内开发者的思维习惯，让你能更专注于业务逻辑，充分释放 `Bun` 运行时的强大性能潜力。

![start](/start/1.png)

## 什么时候使用？
如果你符合以下任何一种情况，`Elysia Admin` 将是你的最佳选择：

- 全栈TypeScript拥趸：追求端到端的类型安全，希望前后端共享类型定义，消除类型不一致带来的 Bug。
- 资源受限环境：部署服务器配置有限，或追求极致性价比，需要一款内存占用极低（~80MB）的高性能框架。
- 拒绝链式调用：厌倦了 `Elysia` 传统的链式 API 写法，渴望像 `Vue Router` 一样通过配置式路由来管理接口，让代码结构清晰、易于维护。
- 追求开发效率：希望降低学习成本，拒绝重复造轮子，需要一套开箱即用、规范化的全栈脚手架。

## 在线体验
- 官网地址：<https://elysia-admin.top>
- 演示地址：<https://elysia-admin.top/admin>
  - 账号：`admin`
  - 密码：`123456` (建议仅用于体验，勿修改核心数据)
- 代码下载：
  - gitee仓库：<https://gitee.com/nian-qian/elysia-admin>
  - github仓库：<https://github.com/meishanlaoyao/elysia-admin>

**提示**：演示环境为公共测试服，请勿进行破坏性操作。

## 主要特征
本项目不仅是一个脚手架，更是一套经过优化的企业级解决方案：

- 前端基于 `Art Design Pro` 构建，继承了其所有现代化特性。提供精美、响应式的界面设计，开箱即用的高级组件。
- 创新实现后端 **接口与定时任务的自动注册机制**。无需繁琐的手动引入，系统自动扫描并加载模块，极大降低了项目配置的复杂度，让开发更专注于业务逻辑。
- 从数据库到前端全程 `TypeScript` 覆盖。后端集成 `DrizzleORM`，利用其强大的类型推导能力，实现数据库操作与 API 响应的端到端类型安全，拒绝 `any`。
- 区别于传统的链式调用，采用类似 `Vue Router` 的 **配置式路由架构**。将接口路径、方法、权限与处理函数解耦，结构清晰，逻辑分明，完美契合国内开发者的工程化思维。

## 技术选型
本项目严格遵循现代化全栈开发标准，采用高性能、类型安全的技术栈构建。
### 环境依赖
**必须** ：
- [`Node.JS >= 22.0.0`](https://nodejs.org/)
- [`Bun >= 1.2.21`](https://bun.com/)
- [`Redis >= 6`](https://redis.io/)
- [`PostgreSQL >= 16`](https://www.postgresql.org/)

**可选** ：
- [`Nvm`](https://github.com/nvm-sh/nvm) <Badge type="info" text="推荐" />
- [`Pnpm`](https://pnpm.io/) <Badge type="info" text="推荐" />
- [`RustFS`](https://rustfs.com.cn/)
- [`Docker`](https://www.docker.com/)
- [`PM2`](https://pm2.keymetrics.io/)

### 前端技术
- 框架核心：[`Vue 3`](https://vuejs.org/) + [`TypeScript`](https://www.typescriptlang.org/) (端到端类型安全)
- 构建工具：[`Vite`](https://vitejs.dev/) (极速热更新)
- 状态管理：[`Pinia`](https://pinia.vuejs.org/) (Vue 官方推荐)
- 路由系统：[`Vue Router`](https://router.vuejs.org/zh/)
- UI 组件库：[`Element Plus`](https://element-plus.org/zh-CN/) + [`Tailwind CSS`](https://tailwindcss.com/) (原子化 CSS 辅助)
- 样式处理：[`Scss`](https://scss-lang.com/) (增强样式可维护性)

### 后端依赖
- 核心框架：[`ElysiaJS`](https://elysiajs.com/) (Bun 生态高性能框架)
- 数据持久层：[`Drizzle ORM`](https://orm.drizzle.team/) (类型推断优先，比传统 ORM 更轻量)
- 数据库驱动：[`Postgres`](https://github.com/porsager/postgres) (轻量级 PG 驱动) + [`Ioredis`](https://ioredis.org/)
- 工具库：
  - [`Zod`](https://zod.dev/)：运行时类型校验。
  - [`Jose`](https://github.com/panva/jose)：JWT/OIDC 标准加密处理。
  - [`Croner`](https://github.com/hexagon/croner)：轻量级定时任务调度。
  - [`nodemailer`](https://nodemailer.com/)：邮件发送服务。

## 内置功能

### 认证与权限
- 全面认证：支持用户注册、登录、忘记密码及密码修改。采用双 Token (Access/Refresh) 认证机制，确保持续会话的安全性。
- 用户管理：完善的用户 CRUD 功能，支持查看用户详情、分配角色及所属部门。
- 角色管理：标准的 RBAC 模型，支持自定义角色名称、描述及细粒度的权限分配。
- 菜单管理：前后端联动的动态菜单系统。支持配置名称、路径、图标及权限标识，实现菜单与权限的实时同步。
- 部门管理：可视化的组织架构管理，支持多层级部门结构与详细描述。
- 字典管理：系统级数据字典维护，支持名称、类型、值的动态配置，极大提升业务开发的灵活性。

### 安全与运维
- 接口熔断：支持动态修改接口状态。无需重启服务即可实现接口的灰度发布或紧急下线，运维响应更从容。
- 防爆破与黑名单：内置 IP 黑名单机制。登录接口集成防爆破逻辑，多次验证失败自动拉黑 IP，有效防御恶意攻击。
- 在线用户监控：实时查看当前在线用户列表（含用户名、IP、状态），支持管理员强制下线指定用户。
- 日志审计：完善的日志系统，包含登录日志与操作日志。支持在服务端灵活配置记录级别，满足合规审计需求。
- 存储配置 (S3)：支持配置各类 S3 兼容存储（如 RustFS、阿里云 OSS、腾讯云 COS 等）。采用后端生成签名 URL、前端直传模式，完全不占用应用服务器带宽。
- 缓存数据管理：可视化的存储列表查看器。支持在线查看、调试及修改系统缓存数据，极大便利了开发调试与问题排查。

### 系统与工具
- 定时任务调度：内置可视化任务管理面板。支持 Cron 表达式配置，可动态启动或暂停任务，轻松处理周期性业务。
- 自动化接口文档：后端自动生成交互式 API 文档。开发调试无需借助第三方工具，浏览器即可查看与测试接口。

### 支付模块 <Badge type="warning" text="开发中" />
- 商户管理：
- 订单管理：
- 支付记录：
- 退款记录：

## 源码分支
| 名称 | 描述 | 地址 | 进度 |
| --- | --- | --- | --- |
| `master` | 主分支，包含最新版本的代码 | [https://gitee.com/nian-qian/elysia-admin/tree/master](https://gitee.com/nian-qian/elysia-admin/tree/master) | `已完成` |
| `uniapp` | 微信小程序分支，用于开发微信小程序的分支 | [https://gitee.com/nian-qian/elysia-admin/tree/uniapp](https://gitee.com/nian-qian/elysia-admin/tree/uniapp) | `开发中` |