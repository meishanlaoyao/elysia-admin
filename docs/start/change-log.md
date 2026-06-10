---
title: 更新日志 - Elysia Admin
description: Elysia Admin 版本更新记录，包含各版本新增功能、问题修复及重要变更说明。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 更新日志, 版本记录, changelog, 新功能, BullMQ, 队列
  - - meta
    - property: og:title
      content: 更新日志 - Elysia Admin
  - - meta
    - property: og:description
      content: 查看 Elysia Admin 各版本的功能更新与问题修复记录。
---

# 更新日志

## v1

::: timeline v1.4.8(2026-06-10)
- 新增了模块脚手架：在 `server/` 下执行 `bun run create:module` 生成后端 `route.ts` / `dto.ts` / `handle.ts`，`bun run create:page` 生成后台 types、api、views 标准 CRUD 骨架；依赖已有 Drizzle Schema，支持 `--schema`、`--dry-run`。
- 新增了脚手架脚本与模板（`server/script/create-module.ts`、`create-page.ts`、`script/scaffold/`）及 `server/test/script/scaffold.test.ts` 单测。
- 新增了 `.ai/AI_MODULE_SCAFFOLD.md`，说明脚手架使用场景、命令示例及跑完后 AI 增量职责（业务逻辑、表格/弹窗排版、字典与 handoff SQL）。
- 更新了 AI 模块工作流（`.ai/AI_MODULE_WORKFLOW.md` Step 2.5）、`.ai/README.md`、`.ai/AI_CONTEXT_CAPSULE.md` 与 Cursor Skill（`.cursor/skills/elysia-module-dev/`）：标准单表 CRUD 优先脚手架，再让 AI 做增量。
- 同步更新了 Cursor / Codex / Claude Code / Trae / Kiro 的 Agent 规则（`AGENTS.md`、`server/AGENTS.md`、`admin/AGENTS.md` 等），各 IDE 均可识别 `create:module` + `create:page` 推荐流程。
- 更新了 [AI 开发指南](/guide/ai-guide)：新增「推荐流程（脚手架 + AI）」与档0 提示词（脚手架已生成后的增量开发）。
- 补充了 [内置命令](/architecture/commands)「模块脚手架命令」章节。
- 优化了 BullMQ Redis 键前缀：Queue / Worker 使用 `app.id` 作为 `prefix`（如 `Elysia-Admin:flow-buffer-queue:meta`），替代默认 `bull:` + 队列名拼 `appId` 的旧形态；多应用共用 Redis 时仍按应用隔离，旧 `bull:*` 键需手动清理。
- 修复了生产环境经 Nginx 反代后登录日志 IP 全为 `127.0.0.1`：`production.yaml` 默认开启 `trustProxy` 并配置 `trustedProxyCidrs`（`127.0.0.1` / `::1`），在受信代理场景下正确解析 `X-Forwarded-For` / `X-Real-IP`（需反代层传递对应头）。
- 为 `server/src/config/schema.ts` 各配置段与字段补充了 JSDoc 注释，说明用途、单位及可被环境变量覆盖的项。
:::

::: timeline v1.4.7(2026-06-09)
- 重构了后端错误处理：HTTP 路由 handler 移除重复的 `try/catch`，未捕获异常统一由全局 `onError` 收口；服务端日志保留完整 `stack`，客户端仍返回通用 500 文案。
- 新增了 `server-error` 工具（`getHttpStatus` / `getPgErrorCode` / `logServerError`），支持业务 `httpStatus`（如 409）、PostgreSQL 唯一约束 `23505` 等在全局层映射。
- 调整了 `BaseResultData.fail`：仅对业务主动返回的字符串 500 打日志，避免与 `onError` 重复记录异常对象。
- 拆分了应用启动配置：`ConfigureErrorHandler` → `middleware/error-handler.ts`，`ConfigureOpenAPI` → `infrastructure/openapi.ts`，`ConfigureBullMQUI` → `infrastructure/queue/bull-board-ui.ts`，`app.ts` 仅保留 `CreateApp` 组装逻辑。
- 更新了 AI 代码模板（`.ai/AI_CODE_EXAMPLES.md`）：标准 CRUD handler 不再生成通用 `try/catch`；补充 `useDictStore` 字典字段示例。
- 新增了 AI 模块开发工作流（`.ai/AI_MODULE_WORKFLOW.md` 及 Schema / Handoff SQL / MCP / 页面排版子指南），Handoff SQL 统一输出至 `server/database/sql/{模块名}-init.sql`。
- 新增了 Cursor 项目 Skill（`.cursor/skills/elysia-module-dev/`），9 步 checklist 对齐 Schema → 代码 → 字典 → 前端 → SQL 交付；AI 规范文档（`.ai/`、`.cursor/rules/`）面向 Agent 统一为英文。
- 新增了 `.ai/AI_PAGE_QUALITY.md`（列表页 `art-full-height`、`useDictStore`、弹窗排版等整页质量规范）。
- 同步更新了 Trae / Kiro steering 与 `.cursor/rules/general.mdc`（模块开发触发语、Git 只读、MCP 查库优先）。
- 重写了 [AI 开发指南](/guide/ai-guide.html)：三档提示词（一句话 / 两句 / 结构化）、网页版短前缀指引，移除过时内联代码模板。
- 新增了 OpenAI Codex 分层指令（根目录及 `server/`、`admin/` 的 `AGENTS.md`）与 `.codex/README.md`。
- 新增了 Claude Code 配置（`.claude/CLAUDE.md`、`.claude/rules/`），规则语义与 Cursor / Trae 对齐。
- 新增了 VS Code / Cursor 开发配置（`.vscode/`：settings、extensions、tasks、launch）及多根工作区 `elysia-admin.code-workspace`。
- 新增了后端调试命令：`dev:debug`（IDE Attach 6499）、`dev:debug:browser`（推荐，配合 [debug.bun.sh](https://debug.bun.sh)）、`dev:debug:watch`（调试 + 热重载，默认不推荐）。
- 新增了 `server/script/dev-debug.ts` 调试启动脚本，终端提示浏览器断点流程。
- 调整了 `.vscode/launch.json`：改用内置 Node 调试器 Attach 6499，替代原 `type: bun`（Cursor / Trae 下扩展调试适配器常不可用）；`.vscode/tasks.json` 补充 `Server: dev:debug` 相关任务。
- 补充了 [内置命令](/architecture/commands.html) 文档：独立「调试命令」「构建命令」章节，说明命令与编辑器 Tasks / Launch 配套用法。
:::

::: timeline v1.4.6(2026-06-08)
- 新增了启动期 Zod strict 校验 `*.yaml` 配置，缺字段、类型错误或未知 key 时 fail-fast 并输出可读错误。
- 修复了 PostgreSQL 连接池 `connect_timeout` 配置未生效（原误读 `connection_timeout`）。
- 修复了 PM2 生产部署下队列 Worker 沙箱 processor 子进程找不到 `production.yaml` 的问题（`CONFIG_PATH` 误解析为 `dist/dist/` 路径）。
- 修复了用户管理删除用户失败的问题。
- 修复了用户弹窗「编辑 → 新增」切换时表单未完整重置、异步详情回填错乱的问题（Gitee IJRSXJ）。
- 修复了登录后菜单/权限数据为空时路由初始化失败，500 页无法返回登录页的问题；菜单校验失败时自动登出并提示，异常页支持「重新登录」兜底。
:::

::: timeline v1.4.5(2026-06-01)
- 修复了字典类型弹窗在「编辑 → 新增」切换时表单未完整重置，偶发提交 400 的问题。
- 更新了字典类型编码修改逻辑：同步级联更新下属字典数据的 `dictType`，并清理类型/数据相关 Redis 缓存；前端同步刷新右侧字典值列表与当前选中类型。
- 新增了 `sha256WithRsa`（`RSA-SHA256`）供 v3 请求签名与 JSAPI 调起签名使用，与 OpenSSL 算法名对齐。
- 优化了 `buildWechatOrderBody`，仅白名单透传 `attach`、`goods_tag`、`time_expire` 等文档允许的可选字段，避免将 `openid`、`clientIp` 等由各渠道自行处理的字段误写入通用下单 body。
- 更新了微信支付回调验签，统一使用 `RSA-SHA256`（`crypto.createVerify`），与微信 v3 平台证书验签规范一致。
- 接入了 Bun 内置 `bun test`（`test` / `test:watch` / `test:coverage`），新增 `server/test/` 纯函数与 `QueryBuilder` 单元测试基线。
- 补充了架构文档测试命令说明（[内置命令 - 测试命令](/architecture/commands.html#测试命令)）。
:::

::: timeline v1.4.4(2026-05-21)
- 修复了在环境中同时存在 Node.js v24 时，`@bull-board/elysia` 顶层静态 import 触发 CJS `require()` 加载含 Top-Level Await 的 ESM 模块而报错的问题：将 `@bull-board/api`、`@bull-board/elysia` 及 `queues` 的 import 由顶层静态引入改为 `configureBullMQUI` 函数内部的动态 `await import()`。
- 文档：补充了存储配置指南中各服务商（RustFS、COS、OSS、Kodo）的后端配置字段示例。
:::

::: timeline v1.4.3(2026-05-20)
- 将系统用户主键 `userId` 由自增数字改为 UUID 字符串，避免管理端与小程序等多套用户表在 Redis 在线会话、令牌等场景下 ID 冲突；同步调整 `createBy`/`updateBy` 及关联表、前后端类型定义。
- 修复了在线用户强退无效的问题：强退接口不再将 UUID 转为数字，并同步清除刷新令牌与菜单缓存。
- 优化了在线监控页：强退当前登录账号后自动执行前端登出。
:::

::: timeline v1.4.2(2026-05-18)
- 修复了菜单删除或禁用后左侧栏仍显示的问题：用户菜单查询增加 `delFlag`、`status` 过滤，菜单变更后自动清除 Redis 菜单缓存。
- 优化了菜单管理页：保存或删除后自动刷新侧边栏动态路由（后端权限模式）。
:::

::: timeline v1.4.1(2026-05-16)
- 规范了 HTTP 路由注册方式，并收紧路由、接口处理函数的类型定义，便于 IDE 提示与排查。
- 优化了路由自动加载：某个业务模块加载失败时会在日志中明确提示，不再静默跳过。
- 优化了队列 Worker 与业务模块的耦合方式：沙箱任务统一登记，基础设施层不再直接引用业务代码。
- 新增了请求上下文类型 `AppContext`，业务接口可 typed 访问当前用户、路由权限等信息，减少 `(ctx as any)` 写法。
- 生产构建时预生成的路由列表带类型信息，TypeScript 检查更准确。
- 更新了后端开发规范与工程配置，与当前目录划分（业务类型 / 声明文件 / 沙箱任务）保持一致。
- 调整了定时任务与 Redis 分布式锁的代码归属，与「工具层不依赖核心层」的架构约定一致。
:::

::: timeline v1.4.0(2026-05-15)
- 优化了订单管理前后端功能。
- 新增了支付调试能力。
- 优化了服务端启动日志的版本提示。
- 更新了项目文档与 AI 开发指引。
> 自 2026-05-15 起，版本号按功能域重新对齐。原文档中的 v1.2.2 对应 v1.3.2，当前最新版为 v1.4.2。
:::

::: timeline v1.3.2(2026-05-13)
- 新增了服务端预编译能力。
- 新增了公开注册 `allowPublicRegister` 与 `ALLOW_PUBLIC_REGISTER` 开关，生产配置默认关闭。
- 修复了注册假成功（未向上抛出异常）与重置密码操作顺序不一致的问题。
- 优化了 IP 获取逻辑，仅在 `trustProxy` 受信代理场景下解析 `X-Forwarded-For`。
- 增加了 IP 归属地查询超时与降级处理，失败不再影响登录流程。
- IP 路由限流改为 Redis 原子计数，消除高并发下的「先读后写」竞态。
- 修复了 `BaseResultData.fail` 在 500 状态码下错误日志拼接问题。
- 优化了 `WithCache`，现在可正确缓存 `0`、`false`、空数组等合法结果。
- 统一了 CORS/静态资源配置。
- 规范了 `SIGINT`/`SIGTERM` 服务关闭顺序，移除重复的信号处理。
- 为 `IConfig` 补充了针对 `app.listen` 返回值类型的 TypeScript 修复。
:::

::: timeline v1.3.1(2026-05-12)
- 新增了退款接口。
- 新增了 AI 开发规范文件。
- 修复了 `WithCache` 缓存命中判断缺陷（空数组和对象类型缓存永远未命中问题）。
- 修复了权限守卫读取路径错误，细粒度接口权限校验现已正确生效。
- 修复了 `GetMenuPermissionByRoleIds` 和 `GetRoleMenuIdsAndBtnIds` 在角色无按钮权限时触发全表扫描，导致权限数据返回异常的严重 Bug。
- 优化了 `FindPage` 分页查询，使用窗口函数 `COUNT(*) OVER()` 将常规分页由 2 次 DB 查询合并为 1 次。
- 优化了认证守卫，去除了 JWT 重复解析（移除冗余的 `ParseToken` 调用）。
- 优化了 IP 黑名单缓存，SQL 层直接过滤 `status=true` 数据，减少缓存体积。
- 修复了角色权限变更时 `forEach(async)` 并发无序问题，改为串行处理确保稳定性。
:::

::: timeline v1.3.0(2026-05-10)
- 新增了支付适配层与路由分发。
- 新增了支付宝 PC / H5 / App / 小程序各端接入，并修复了各端支付与回调问题。
- 新增了微信支付、PayPal 多渠道接入。
- 新增了 PC 端支付完成处理与异步通知回调校验优化。
- 同步更新了支付相关文档。
:::

::: timeline v1.2.0(2026-04-18)
- 修复了配置角色权限后菜单不更新等问题。
- 移除了 `build:binary` 命令，具体原因可在 [常见问题](/other/faq.md) 中查看。
- 优化了创建订单接口。
- 修复了生产环境 Worker 处理器路径错误。
:::

::: timeline v1.1.0(2026-04-15)
- 新增了 `BullMQ`，添加了队列功能。
- 基于 `BullMQ` 重写了定时任务功能。
:::

::: timeline v1.0.3(2026-04-10)
- 扩充了项目文档体系（快速开始、架构、中间件等章节）。
- 调整了 `server` 中的部分接口目录。
:::

::: timeline v1.0.2(2026-04-01)
- 新增了订单模块初版接口。
:::

::: timeline v1.0.1(2026-03-24)
- 新增了业务模块。
- 规范化了部分代码结构。
- 修复了数据库迁移交互不显示的问题。
:::

::: timeline v1.0.0(2026-03-04)
- 整个系统前后端全部可用。
- 完成了认证、字典、菜单/角色/部门、API 管理、种子数据等核心模块。
- 新增了四重守卫与全局中间件、登录日志、操作日志。
- 新增了存储/文件上传、定时任务（Redis 分布式锁）。
- 新增了缓存模块、接口限流、登录次数限制。
- 启用了 YAML 配置，优化了 Drizzle ORM 配置。
- 修复了 PM2 在线部署等问题。
:::

## v0

::: timeline v0.0.0(2025-12-12)
- 创建项目，第一次提交。
> [CSDN文章链接:](https://blog.csdn.net/weixin_63443072/article/details/158653317?spm=1001.2014.3001.5501)
>
> [掘金文章链接:](https://juejin.cn/post/7612957140249362482)
:::