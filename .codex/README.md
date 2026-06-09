# OpenAI Codex 项目说明

本仓库为 [OpenAI Codex CLI](https://developers.openai.com/codex/) 配置了分层 `AGENTS.md` 指令，语义与 [`.cursor/rules/`](../.cursor/rules/) 一致。

## 发现顺序

Codex 从 Git 根目录向当前工作目录逐级合并 `AGENTS.md`：

| 文件 | 对应 Cursor | 作用 |
|------|-------------|------|
| [`AGENTS.md`](../AGENTS.md) | `general.mdc` | 全局架构、依赖方向、模块触发语 |
| [`server/AGENTS.md`](../server/AGENTS.md) | `backend.mdc` | 在 `server/` 下工作时叠加后端规则 |
| [`admin/AGENTS.md`](../admin/AGENTS.md) | `frontend.mdc` | 在 `admin/` 下工作时叠加前端规则 |

全局个人偏好可写在 `~/.codex/AGENTS.md`（不提交到仓库）。

## 验证

```bash
codex --print-instructions
```

## 体积上限

Codex 默认合并上限 **32 KiB**。若规则膨胀，可在 `~/.codex/config.toml` 调高：

```toml
project_doc_max_bytes = 65536
```

## 维护约定

改架构、依赖方向或读文件纪律时，请同步：

- `.cursor/rules/`
- `.trae/rules/`
- `.kiro/steering/`
- `.claude/rules/`
- 本目录对应的 `AGENTS.md` 三份

代码模板详版仍以 [`.ai/AI_CODE_EXAMPLES.md`](../.ai/AI_CODE_EXAMPLES.md) 为唯一来源。
