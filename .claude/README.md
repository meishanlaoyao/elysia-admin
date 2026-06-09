# Claude Code 项目规则（`.claude/`）

本目录为 [Claude Code](https://code.claude.com/) 配置，规则语义与 [`.cursor/rules/`](../.cursor/rules/) 对齐。**详细代码模板以** [`.ai/AI_CODE_EXAMPLES.md`](../.ai/AI_CODE_EXAMPLES.md) **为唯一详版**。

## 文件结构

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| [`CLAUDE.md`](CLAUDE.md) | — | 项目入口：命令、`.ai/` 索引、模块触发语 |
| [`rules/general.md`](rules/general.md) | `general.mdc` | 全局规则（`paths: "**"`） |
| [`rules/backend.md`](rules/backend.md) | `backend.mdc` | `server/src/**` 懒加载 |
| [`rules/frontend.md`](rules/frontend.md) | `frontend.mdc` | `admin/src/**` 懒加载 |
| [`settings.json`](settings.json) | — | 团队共享权限（拒绝读 `dist/`、`node_modules/`） |

个人偏好请写在 `CLAUDE.local.md` 或 `.claude/settings.local.json`（不提交）。

Postgres MCP 配置见 [`.ai/AI_MCP_SETUP.md`](../.ai/AI_MCP_SETUP.md)。

## 维护约定

改架构、依赖方向或读文件纪律时，请同步：

- `.cursor/rules/`
- `.trae/rules/`
- `.kiro/steering/`
- `.claude/rules/`
- Codex 的 `AGENTS.md`（根 / `server/` / `admin/`）
