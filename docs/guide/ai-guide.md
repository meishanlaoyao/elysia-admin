---
title: AI 开发指南
description: 介绍 Cursor、Trae、Kiro、Codex、Claude Code 的项目规则与 `.ai/` 规范文档，配合提示词让 AI 按 Elysia Admin 风格生成前后端模块代码。
head:
  - - meta
    - name: keywords
      content: Elysia Admin AI 开发, AI 代码生成, Cursor, Trae, Kiro, Codex, Claude Code, 提示词模板
---

# AI 开发指南

用 AI 在本仓库里做业务模块时：**IDE 会自动加载规则**，你只需发一条合适的提示词，不必每次粘贴长模板。


## 快速开始

| 你的场景 | 怎么做 |
|----------|--------|
| 在 **Cursor / Trae / Kiro / Codex / Claude Code** 里开发 | 复制 [档1 提示词](#档1-一句话) ，改模块名和字段即可 |
| 用 **VS Code** 本地开发 | 打开仓库或 `elysia-admin.code-workspace`；任务 `Dev: Full Stack` 一键启前后端 |
| 字段多、要拆前后端 | 用 [档3 结构化提示词](#档3-结构化) |
| **ChatGPT / Claude 网页版** | 看 [网页版 AI 用法](#网页版-ai-chatgpt--claude-等) |
| 查规范文件在哪 | 看 [`.ai/` 文档索引](#ai-文档索引) |

**推荐在提示词里带上触发语**（便于匹配项目 Skill）：

- `按 module dev workflow` 或 `走完整 SOP`
- 需要上线菜单时加：`含菜单权限和 handoff SQL`

**档 1 — 复制即用（示例：商品模块）**

```
按 module dev workflow 做商品管理（business-goods）：名称、价格、库存、备注；全栈 CRUD，要菜单权限、字典和 server/database/sql/business-goods-init.sql。
```

配置 Postgres MCP 后，菜单/字典 SQL 更准确（见 `.ai/AI_MCP_SETUP.md`）。

> **语言说明：** `.ai/` 工作流与 `.cursor/rules/` 为**英文**（方便 Agent 理解）；**本页与上面提示词为中文**，给人阅读。

## 文档索引（llms.txt）

<EaLlmsDownload />

## `.ai/` 文档索引

| 文件 | 用途 |
|------|------|
| `AI_MODULE_WORKFLOW.md` | 开发步骤：Schema → 代码 → SQL → 交付 |
| `AI_CODE_EXAMPLES.md` | 代码模板（**唯一详版**，勿在别处复制） |
| `AI_PAGE_QUALITY.md` | 列表页 / 搜索 / 字典 / 排版 |
| `AI_UI_LAYOUT.md` | 弹窗、抽屉表单布局 |
| `AI_HANDOFF_SQL.md` | 合并 SQL、菜单查库规则 |
| `AI_SCHEMA_GUIDE.md` | 建表规范（BaseSchema、sort、关联表） |
| `AI_MCP_SETUP.md` | Postgres、Chrome DevTools MCP |
| `AI_CONTEXT_CAPSULE.md` | 一页速查 |
| `README.md` | 完整文档地图 |

Handoff SQL 输出路径：`server/database/sql/{模块名}-init.sql`

Cursor Skill：`.cursor/skills/elysia-module-dev/SKILL.md`

## IDE 规则（Cursor / Trae / Kiro / Codex / Claude Code）

五处 Agent 规则与 `.cursor/rules/` **语义一致**；改规则时请同步 Cursor、Trae、Kiro、Codex、Claude Code（各目录 README 有说明）。

### Cursor（推荐）

| 文件 | 何时生效 | 作用 |
|------|----------|------|
| `general.mdc` | 始终 | 架构、依赖方向、读文件纪律 |
| `backend.mdc` | 编辑 `server/src/**` | 后端模块、repository |
| `frontend.mdc` | 编辑 `admin/src/**` | 前端页面、useTable |

打开仓库即可，**无需额外配置**。新建业务模块时会走 `AI_MODULE_WORKFLOW`；AI **不会擅自 git 提交**。

### Trae

| 文件 | 对应 Cursor |
|------|-------------|
| `.trae/rules/general.md` | `general.mdc` |
| `.trae/rules/backend.md` | `backend.mdc` |
| `.trae/rules/frontend.md` | `frontend.mdc` |

### Kiro

| 文件 | 作用 |
|------|------|
| `product.md` / `structure.md` / `tech.md` | 始终加载：产品、目录、技术栈 |
| `frontend-vue.md` / `backend-elysia.md` | 编辑前后端时加载 |
| `ai-ops-supplement.md` | 自动匹配：工作流、MCP、SQL、排版 |

通过 `#[[file:.ai/...]]` 引用大文档，避免 steering 里重复贴模板。

### OpenAI Codex

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| `AGENTS.md`（仓库根） | `general.mdc` | 全局架构、模块触发语 |
| `server/AGENTS.md` | `backend.mdc` | 在 `server/` 下工作时叠加 |
| `admin/AGENTS.md` | `frontend.mdc` | 在 `admin/` 下工作时叠加 |

Codex 从 Git 根向当前目录逐级合并 `AGENTS.md`。验证：`codex --print-instructions`。说明见 [`.codex/README.md`](../../.codex/README.md)。

### Claude Code

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| `.claude/CLAUDE.md` | — | 项目入口、命令、`.ai/` 索引 |
| `.claude/rules/general.md` | `general.mdc` | 始终生效 |
| `.claude/rules/backend.md` | `backend.mdc` | 编辑 `server/src/**` 时懒加载 |
| `.claude/rules/frontend.md` | `frontend.mdc` | 编辑 `admin/src/**` 时懒加载 |

说明见 [`.claude/README.md`](../../.claude/README.md)。个人偏好用 `CLAUDE.local.md`（不提交）。

### VS Code / Cursor 编辑器

| 文件 | 作用 |
|------|------|
| `.vscode/settings.json` | 格式化、ESLint、Prettier、排除 `dist/` |
| `.vscode/extensions.json` | 推荐 Volar、ESLint、Prettier、Stylelint、Bun |
| `.vscode/tasks.json` | `Server: dev`、`Admin: dev`、`Dev: Full Stack` 等 |
| `.vscode/launch.json` | Bun 调试后端 `server/src/index.ts` |
| `elysia-admin.code-workspace` | 多根工作区（admin / server / docs） |

## 提示词模板（仓库内）

示例模块：`business-goods`（商品）。把名称、字段换成你的业务即可。

### 选哪一档？

| 档位 | 适合 | 特点 |
|------|------|------|
| [档1](#档1-一句话) | 日常最省事 | 一句话；AI 在计划里补默认值 |
| [档2](#档2-极简两句) | 要指定父菜单、字段类型 | 两句，减少 AI 猜测 |
| [档3](#档3-结构化) | 只后端 / 只前端 / 字段很多 | 分块写清需求 |

无表时 AI **会先问你是否建表**，不会擅自改 drizzle。

### 档1 一句话

```
按 module dev workflow 做商品管理（business-goods）：名称、价格、库存、备注；全栈 CRUD，要菜单权限、字典和 server/database/sql/business-goods-init.sql。
```

### 档2 极简两句

```
business-goods 全栈模块，字段 name/price/stock/remark，status 用 boolean。
表若没有先给 schema 方案；菜单挂「业务管理」（/business）下；输出 handoff SQL。
```

### 档3 结构化

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

**定时 / 队列任务：** 在 `task.ts` 定义函数，于 `server/src/worker-sandbox/` 注册（勿在 `processor.ts` 里直接 `import '@/modules/...'`）。详见 [定时任务](./cron.md)、[队列](./queue.md)。

### 发完提示词，AI 会交付什么？

1. **计划** — 5 行内说明 + 文件清单  
2. **Schema** — 查 `server/database/schema/`；无表则提案，**等你同意**再改  
3. **代码** — 后端四文件；全栈含前端 types / api / views  
4. **字典** — 对齐 `system_dict_*` 或写进 handoff SQL，不硬编码枚举  
5. **SQL 文件** — `server/database/sql/{模块}-init.sql`  
6. **前端** — `art-full-height`、`useDictStore`、弹窗排版  
7. **说明** — MCP 查库摘要，或「未连 Postgres MCP」；**不** git 提交  

### 常见变体

| 需求 | 在提示词里加上 |
|------|----------------|
| 只要代码，不要 SQL | `暂不需要菜单和 handoff SQL` |
| 只补菜单权限 | `补 business-goods 菜单权限 SQL，查库后写入 handoff 文件` |
| 表已存在 | `schema 已有 business_goods，不要改 drizzle` |
| 要定时任务 | `需要 task.ts`（并见上文 BullMQ 说明） |

档1 未写清的字段、父菜单等，AI 会在**计划**里默认；有硬性要求请用档2 或档3。

## 网页版 AI（ChatGPT / Claude 等）

**适用：** 未在本仓库 IDE 中打开项目、无法自动加载规则。

**步骤：**

1. 粘贴 `.ai/README.md` + 按需粘贴 `AI_MODULE_WORKFLOW.md`、`AI_CODE_EXAMPLES.md`  
2. 再粘贴下面「短前缀」和你的需求（**不要**再贴 100+ 行内联代码）

**短前缀**

```
# elysia-admin 约束摘要
- 前后端分离：Vue3 + Elysia/Bun；模块 server/src/modules/{group}-{name}/（dto/handle/route/task）
- 代码模板以 AI_CODE_EXAMPLES.md 为准；handle 不要包 try/catch，业务错误用 BaseResultData.fail(4xx, msg)
- 前端：useTable + ArtSearchBar + ArtForm；art-full-height；业务枚举用 useDictStore
- 全栈：查 schema → 代码 → server/database/sql/{module}-init.sql；改表须先征得同意
- 按 AI_MODULE_WORKFLOW 的 7 段交付格式输出
```

**示例需求**

```
按 module dev workflow，创建 business-goods 全栈：goodsId、name、price、stock、status、remark；
含菜单权限与 server/database/sql/business-goods-init.sql。
```

无法读仓库时，至少粘贴 **`AI_CODE_EXAMPLES.md` 全文** 后再发需求。

## 补充说明

### AI 读哪些文件

- 新建模块：只读 **一个** 参考（后端 `system-api/`，前端 `system/user/`）  
- 改现有文件：只读该文件  
- **不读：** `node_modules/`、`dist/`、默认可不读 `core/`、`components/core/`  
- Schema：只打开**当前任务相关**的那张表  

### 你需要手动做的

- 在本机执行 **`server/database/sql/{模块}-init.sql`**（Postgres MCP 一般只读）  
- 确认 AI 计划里的默认值是否符合业务（尤其档1）  
- Git 提交由**你自己**完成，AI 不会 add / commit  

### 其他

- 列表导出优先用 `ArtExcelExport`，不必单独为导出造后端（除非业务需要）  
- 架构类旧文档（`AI_STRUCTURE.md`、`AI_MODULE_STANDARD.md` 等）需要时再查，日常开发以上表 + 提示词即可  

以上流程可减少无效读文件与 token 消耗，同时让生成结果与仓库风格一致。