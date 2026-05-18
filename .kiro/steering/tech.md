---
inclusion: always
---

# 技术栈与工程约束

## 技术栈

- **前端**：Vue 3、TypeScript、Art Design Pro 管理端模板体系、Element Plus 等现有栈。
- **后端**：Elysia、Bun；数据访问通过项目封装的 repository 与 schema，而非随意裸 SQL。

## 严格依赖方向

```
admin → server（仅 HTTP）

modules → core
modules → shared
modules → infrastructure

core  ✗→ modules
shared ✗→ modules
infrastructure ✗→ modules   （沙箱 processor 通过 `server/src/worker-sandbox/` 注册任务，不在 `infrastructure` 内直接 import `modules`）

shared ✗→ core/database       （定时器与 Redis 锁见 `server/src/infrastructure/cron/cron-scheduler.ts`）
```

## 生成与改动原则

1. 写代码前用**最多 5 行**说明计划，并列出将创建或修改的文件。
2. **最小改动**：不增加无关抽象、不重构无关文件。
3. **不新增依赖**（npm / bun 包），除非用户明确要求。
4. 实现模式严格对齐仓库既有写法；**改数据库 schema 前必须先征得用户同意**。
5. 避免过度设计。

## 与 `.ai` 文档的关系（活引用）

以下文件为仓库内「单一事实来源」，请在实现时直接依赖其当前内容，而不是在 steering 中重复粘贴长模板：

#[[file:.ai/AI_CODE_EXAMPLES.md]]

#[[file:.ai/AI_CONTEXT_CAPSULE.md]]

- **代码模板与端到端示例**：以 `AI_CODE_EXAMPLES.md` 为准。
- **MCP、菜单/权限/字典、手执 SQL、内置 UI 路径索引**：以 `AI_CONTEXT_CAPSULE.md` 为准（按需阅读，不替代代码模板文档）。
