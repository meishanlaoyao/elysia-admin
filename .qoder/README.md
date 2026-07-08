# Qoder 项目规则（`.qoder/`）

本目录为 [Qoder IDE / CLI](https://docs.qoder.com/) 配置，规则语义与 [`.cursor/rules/`](../.cursor/rules/) 对齐。**代码模板：** [`.ai/AI_CODE_EXAMPLES_BACKEND.md`](../.ai/AI_CODE_EXAMPLES_BACKEND.md) / [`.ai/AI_CODE_EXAMPLES_FRONTEND.md`](../.ai/AI_CODE_EXAMPLES_FRONTEND.md)（按需读章节）。

## 文件结构

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| [`rules/general.md`](rules/general.md) | `general.mdc` | 全局规则（`alwaysApply: true`） |
| [`rules/backend.md`](rules/backend.md) | `backend.mdc` | `server/src/**/*.ts` 懒加载 |
| [`rules/frontend.md`](rules/frontend.md) | `frontend.mdc` | `admin/src/**/*.{vue,ts}` 懒加载 |
| [`skills/elysia-module-dev/SKILL.md`](skills/elysia-module-dev/SKILL.md) | `.cursor/skills/elysia-module-dev/` | 全栈模块开发 Skill |
| [`settings.json`](settings.json) | `.claude/settings.json` | 团队共享权限（拒绝读 `dist/`、`node_modules/`） |

个人偏好可写在 `AGENTS.local.md` 或 `.qoder/settings.local.json`（不提交）。

Postgres MCP 配置见 [`.ai/AI_MCP_SETUP.md`](../.ai/AI_MCP_SETUP.md)（需在 Qoder 中单独配置）。

## 与 AGENTS.md 的关系

根目录 [`AGENTS.md`](../AGENTS.md) 仍会被 Qoder 识别；**`.qoder/rules/` 优先级更高**。分层规则以本目录三份 rules 为准。

## 验证

1. **Qoder IDE**：Settings → Rules 应看到 3 条规则（Always Apply ×1 + Specific Files ×2）
2. **Skill**：输入 `/skills` 或问「有哪些 Skills」，应列出 `elysia-module-dev`
3. **CLI**（若使用）：项目根运行 `qodercli`，修改 Skill 后执行 `/skills reload`

若 `alwaysApply` 规则未生效，可在对话中用 `@rule` 手动引用对应规则文件。

## 已知限制

- `alwaysApply` 在 Agent 模式下偶有未严格执行的社区反馈
- 全部 rules 合计字符上限 100,000（当前远低于此上限）
- Postgres MCP 不在本目录内，需按 `.ai/AI_MCP_SETUP.md` 单独配置

## 维护约定

改架构、依赖方向或读文件纪律时，请同步：

- `.cursor/rules/`
- `.qoder/rules/`
- `.trae/rules/`
- `.kiro/steering/`
- `.claude/rules/`
- Codex 的 `AGENTS.md`（根 / `server/` / `admin/`）

代码模板仍以 [`.ai/AI_CODE_EXAMPLES_BACKEND.md`](../.ai/AI_CODE_EXAMPLES_BACKEND.md) / [`.ai/AI_CODE_EXAMPLES_FRONTEND.md`](../.ai/AI_CODE_EXAMPLES_FRONTEND.md) 为准（按需读章节）。

标准 CRUD 模块优先使用 [`.ai/AI_MODULE_SCAFFOLD.md`](../.ai/AI_MODULE_SCAFFOLD.md)（`server/` 下 `bun run create:module` + `create:page`），再由 AI 补业务逻辑与 handoff SQL。