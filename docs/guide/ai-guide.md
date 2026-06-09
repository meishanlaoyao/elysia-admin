---
title: AI 开发指南
description: 介绍 Cursor、Trae、Kiro、Codex、Claude Code 的项目规则与 `.ai/` 规范文档，配合提示词让 AI 按 Elysia Admin 风格生成前后端模块代码。
head:
  - - meta
    - name: keywords
      content: Elysia Admin AI 开发, AI 代码生成, Cursor, Trae, Kiro, Codex, Claude Code, 提示词模板
---

# AI 开发指南

在本仓库里用 AI 做业务模块，你不需要每次粘贴长篇模板。打开项目后，IDE 会自动加载规则；你只需发一条合适的提示词，AI 就会按 Elysia Admin 的目录结构和代码风格来生成。

下文以 `business-goods`（商品管理）为例，把名称和字段换成你的业务即可。

## 工作原理

项目根目录下有多套 Agent 规则（Cursor、Trae、Kiro、Codex、Claude Code），语义一致。AI 对话时会读取这些规则，以及 `.ai/` 里的工作流与代码模板。

```mermaid
flowchart LR
    A[你发提示词] --> B[IDE 加载规则]
    B --> C[AI 读 .ai/ 规范]
    C --> D[生成代码 + SQL]
    D --> E[你本地执行 SQL / 提交]
```

提示词里带上触发语，更容易匹配项目 Skill：

- `按 module dev workflow` 或 `走完整 SOP`
- 脚手架相关：`先用脚手架` / `脚手架已生成`
- 需要菜单时：`含菜单权限和 handoff SQL`

## 我该从哪开始

| 场景 | 做法 |
|------|------|
| Schema 已建好，要标准 CRUD | 先跑脚手架，再用 AI 做增量（见下节） |
| 从零生成整个模块 | 用「一句话」提示词，AI 会建议是否先跑脚手架 |
| 字段多、只改前端或后端 | 用「结构化」提示词，分块写清需求 |
| 用 VS Code 本地开发 | 打开 `elysia-admin.code-workspace`，任务 `Dev: Full Stack` 启前后端 |
| 用 ChatGPT / Claude 网页版 | 见文末「网页版 AI」 |
| 查规范文件 | 见「规范文档」 |

## 脚手架 + AI

单表标准 CRUD、且 Drizzle Schema 已存在时，推荐先跑脚手架，再让 AI 补业务逻辑和排版。Agent 细则见 `.ai/AI_MODULE_SCAFFOLD.md`。

在 `server/` 目录执行：

```bash
cd server
bun run create:module business-goods --tag 商品管理
bun run create:page business goods --tag 商品管理
```

可选参数：`--schema business_goods` 指定表名，`--dry-run` 仅预览不写文件。完整说明见 [内置命令 - 模块脚手架](/architecture/commands#模块脚手架命令)。

脚手架会生成后端 `route.ts` / `dto.ts` / `handle.ts` 骨架，以及前端 types、api、views。接下来把下面「脚手架之后」的提示词发给 AI，让它补校验、表格排版、字典和 handoff SQL。

最后由你在本机执行 `server/database/sql/business-goods-init.sql`，并在后台把菜单 component 配成 `/business/goods/index`。

![输出截图](/guide/4.png)

## 提示词

示例模块均为 `business-goods`。复制后把模块名、字段、父菜单换成你的业务。

### 脚手架之后

适合 Schema 已有、标准 CRUD。先跑脚手架，AI 只补增量，省 token。

```
business-goods 已执行 create:module 和 create:page，请按 AI_MODULE_SCAFFOLD 增量规范：
1. handle 补价格/库存等业务校验；
2. 表格和弹窗按 AI_PAGE_QUALITY 排版，status 接字典；
3. 输出 server/database/sql/business-goods-init.sql（菜单+按钮权限）。
不要重写 route/dto/api 骨架。
```

### 一句话

日常最省事。AI 会在计划里补默认值；无表时会先问你，不会擅自改 drizzle。

```
按 module dev workflow 做商品管理（business-goods）：名称、价格、库存、备注；全栈 CRUD，要菜单权限、字典和 server/database/sql/business-goods-init.sql。
若 Schema 已有，请先建议运行 create:module + create:page。
```

### 两句补充

需要指定父菜单或字段类型时用。减少 AI 猜测。

```
business-goods 全栈模块，字段 name/price/stock/remark，status 用 boolean。
表若没有先给 schema 方案；菜单挂「业务管理」（/business）下；输出 handoff SQL。
```

### 结构化

字段很多、或只要前端 / 只要后端时用。

**仅后端**

```
按 module dev workflow，仅后端：商品管理模块 business-goods
- 字段：name、price、stock、remark、status（boolean）
- 标准 CRUD（创建、列表、详情、更新、软删除）
- 登录认证 + 操作日志；无需定时任务
- 暂不需要前端和 handoff SQL（或：需要 SQL 补菜单权限）
```

**仅前端**

```
按 module dev workflow，仅前端：business/goods 商品管理页
- types/api/business-goods.d.ts、api/business/goods.ts
- index.vue + goods-search.vue + goods-dialog.vue
- 遵循 AI_PAGE_QUALITY：art-full-height、useDictStore，勿硬编码业务枚举
- 权限与后端 business:goods:* 一致
```

**全栈（字段写全）**

```
按 module dev workflow，全栈商品管理 business-goods：

【后端】server/src/modules/business-goods/
- 表：goodsId、name、price、stock、status（boolean）、remark；主表 + BaseSchema
- 标准 CRUD；meta.permission：business:goods:create|query|update|delete

【前端】admin/src/
- types/api/business-goods.d.ts、api/business/goods.ts
- views/business/goods/（index + goods-search + goods-dialog）

【运维】
- 父菜单：/business（业务管理）
- 字典：若无 business_goods_status 则在 SQL 中补（status 用 boolean 可省略字典）
- 生成 server/database/sql/business-goods-init.sql（菜单/按钮/角色，MCP 查库优先）
```

### 常见变体

| 需求 | 在提示词里加上 |
|------|----------------|
| 只要代码，不要 SQL | `暂不需要菜单和 handoff SQL` |
| 只补菜单权限 | `补 business-goods 菜单权限 SQL，查库后写入 handoff 文件` |
| 表已存在 | `schema 已有 business_goods，不要改 drizzle` |
| 要定时任务 | `需要 task.ts`（见下节说明） |

定时 / 队列任务在 `task.ts` 定义函数，于 `server/src/worker-sandbox/` 注册。详见 [定时任务](./cron)、[队列](./queue)。

## AI 会交付什么

发完提示词，AI 通常按下面顺序产出。无表时会先提案 Schema，**等你同意**再改 drizzle。

| 产出 | 说明 |
|------|------|
| 计划 | 5 行内说明 + 待改文件清单 |
| Schema | 查 `server/database/schema/`；无表则提案 |
| 代码 | 后端四文件；全栈含前端 types / api / views |
| 字典 | 对齐 `system_dict_*` 或写进 handoff SQL |
| SQL 文件 | `server/database/sql/{模块}-init.sql` |
| 前端 | `art-full-height`、`useDictStore`、弹窗排版 |
| 说明 | MCP 查库摘要，或「未连 Postgres MCP」 |

AI **不会**擅自 `git add` / `commit`。提交由你自己完成。

配置 Postgres MCP 后，菜单和字典 SQL 更准确，见 `.ai/AI_MCP_SETUP.md`。

## 规范文档

`.ai/` 目录存放 AI 工作流与代码模板。工作流文档为英文（便于 Agent 理解）；本页与提示词为中文，给人阅读。

| 文件 | 用途 |
|------|------|
| `AI_MODULE_WORKFLOW.md` | 主流程：Schema → 脚手架 → 代码 → SQL |
| `AI_MODULE_SCAFFOLD.md` | `create:module` + `create:page` 细则 |
| `AI_CODE_EXAMPLES.md` | 代码模板（唯一详版） |
| `AI_PAGE_QUALITY.md` | 列表、搜索、字典、排版 |
| `AI_UI_LAYOUT.md` | 弹窗、抽屉表单布局 |
| `AI_HANDOFF_SQL.md` | 合并 SQL、菜单查库 |
| `AI_SCHEMA_GUIDE.md` | 建表规范 |
| `AI_MCP_SETUP.md` | Postgres、Chrome DevTools MCP |
| `AI_CONTEXT_CAPSULE.md` | 一页速查 |

Handoff SQL 输出路径：`server/database/sql/{模块名}-init.sql`

Cursor Skill：`.cursor/skills/elysia-module-dev/SKILL.md`

<EaLlmsDownload />

## IDE 规则

五处 Agent 规则与 `.cursor/rules/` 语义一致。改架构或读文件纪律时，请同步 Cursor、Trae、Kiro、Codex、Claude Code（各目录 README 有说明）。

### Cursor

打开仓库即可，无需额外配置。

| 文件 | 何时生效 | 作用 |
|------|----------|------|
| `general.mdc` | 始终 | 架构、依赖方向、读文件纪律 |
| `backend.mdc` | 编辑 `server/src/**` | 后端模块、repository |
| `frontend.mdc` | 编辑 `admin/src/**` | 前端页面、useTable |

### Trae

| 文件 | 对应 Cursor |
|------|-------------|
| `.trae/rules/general.md` | `general.mdc` |
| `.trae/rules/backend.md` | `backend.mdc` |
| `.trae/rules/frontend.md` | `frontend.mdc` |

### Kiro

| 文件 | 作用 |
|------|------|
| `product.md` / `structure.md` / `tech.md` | 始终：产品、目录、技术栈 |
| `frontend-vue.md` / `backend-elysia.md` | 编辑前后端时加载 |
| `ai-ops-supplement.md` | 工作流、MCP、SQL、排版 |

通过 `#[[file:.ai/...]]` 引用大文档，避免 steering 里重复贴模板。

### Codex

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| `AGENTS.md`（仓库根） | `general.mdc` | 全局架构、模块触发语 |
| `server/AGENTS.md` | `backend.mdc` | 在 `server/` 下工作时叠加 |
| `admin/AGENTS.md` | `frontend.mdc` | 在 `admin/` 下工作时叠加 |

Codex 从 Git 根向当前目录逐级合并 `AGENTS.md`。验证：`codex --print-instructions`。说明见 `.codex/README.md`。

### Claude Code

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| `.claude/CLAUDE.md` | — | 项目入口、命令、`.ai/` 索引 |
| `.claude/rules/general.md` | `general.mdc` | 始终生效 |
| `.claude/rules/backend.md` | `backend.mdc` | 编辑 `server/src/**` 时懒加载 |
| `.claude/rules/frontend.md` | `frontend.mdc` | 编辑 `admin/src/**` 时懒加载 |

说明见 `.claude/README.md`。个人偏好可写 `CLAUDE.local.md`（不提交）。

### VS Code 编辑器

| 文件 | 作用 |
|------|------|
| `.vscode/settings.json` | 格式化、ESLint、Prettier |
| `.vscode/extensions.json` | 推荐 Volar、ESLint、Prettier、Bun |
| `.vscode/tasks.json` | `Server: dev`、`Admin: dev`、`Dev: Full Stack` |
| `.vscode/launch.json` | Bun 调试 `server/src/index.ts` |
| `elysia-admin.code-workspace` | 多根工作区（admin / server / docs） |

## 网页版 AI

未在本仓库 IDE 中打开项目、无法自动加载规则时，适用 ChatGPT、Claude 网页版等。

先把 `.ai/README.md` 贴进对话，再按需贴 `AI_MODULE_WORKFLOW.md`、`AI_CODE_EXAMPLES.md`。然后贴下面短前缀和你的需求，**不要**再贴 100+ 行内联代码。

```
# elysia-admin 约束摘要
- 前后端分离：Vue3 + Elysia/Bun；模块 server/src/modules/{group}-{name}/（dto/handle/route/task）
- 代码模板以 AI_CODE_EXAMPLES.md 为准；handle 不要包 try/catch，业务错误用 BaseResultData.fail(4xx, msg)
- 前端：useTable + ArtSearchBar + ArtForm；art-full-height；业务枚举用 useDictStore
- 全栈：查 schema → 代码 → server/database/sql/{module}-init.sql；改表须先征得同意
- 按 AI_MODULE_WORKFLOW 的 7 段交付格式输出
```

示例需求：

```
按 module dev workflow，创建 business-goods 全栈：goodsId、name、price、stock、status、remark；
含菜单权限与 server/database/sql/business-goods-init.sql。
```

无法读仓库时，至少粘贴 **`AI_CODE_EXAMPLES.md` 全文** 后再发需求。

## 你需要手动做的

- 在本机执行 **`server/database/sql/{模块}-init.sql`**（Postgres MCP 一般只读）
- 确认 AI 计划里的默认值是否符合业务（尤其「一句话」提示词）
- Git 提交由**你自己**完成

AI 读文件有纪律：新建模块只读一个参考（后端 `system-api/`、前端 `system/user/`）；改现有文件只读该文件；不读 `node_modules/`、`dist/`。跑过脚手架后，只读生成文件和当前 Schema 即可。

列表导出优先用 `ArtExcelExport`，不必单独为导出造后端（除非业务需要）。