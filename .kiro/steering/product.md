---
inclusion: always
---

# 产品概览（elysia-admin）

**elysia-admin** 是一套全栈后台管理系统：运营/管理员通过浏览器使用 **Vue 3**（Art Design Pro 管理端）完成业务配置与数据维护；**Elysia + Bun** 提供 HTTP API、鉴权、持久化与模块扩展。

## 典型开发任务

- **新列表页 / CRUD 页**：在 `admin/src` 下按约定增加 `types/api`、`api`、`views` 分层，列表与表单与后端权限标识对齐。
- **新后端业务模块**：在 `server/src/modules/{group}-{name}/` 下维护 `dto.ts`、`handle.ts`、`route.ts`、`task.ts` 四文件，路由启动时自动注册。

## 目标

生成与现有代码库风格一致、改动面最小的实现；不引入与仓库无关的技术栈或依赖。
