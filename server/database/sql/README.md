# Handoff SQL Directory

**TL;DR (EN):** One file per module: `server/database/sql/{module-name}-init.sql` — dict → menu → role permissions → seed. Developer runs manually. See `.ai/AI_HANDOFF_SQL.md`.

---

本目录存放 **由 AI 生成、由开发者手动执行** 的初始化 SQL，不替代 Drizzle schema 迁移。

## 命名

```
{模块名}-init.sql
```

示例：`business-goods-init.sql`

## 单文件内容顺序

1. 数据字典（`system_dict_type` / `system_dict_data`）
2. 菜单（`system_menu`）
3. 菜单按钮（`system_menu_btn`，按需）
4. 角色权限（`system_role_menu`，按需）
5. 种子数据（可选）

文件顶部须注释：目标环境、`BEGIN`/`COMMIT`、Postgres MCP 查库摘要。

## 规范详文

- [.ai/AI_HANDOFF_SQL.md](../../.ai/AI_HANDOFF_SQL.md)（英文，给 AI 读）
- [.ai/AI_MODULE_WORKFLOW.md](../../.ai/AI_MODULE_WORKFLOW.md) §6

## 注意

- 菜单/按钮写入前应先通过 Postgres MCP 只读查 `parent_id`、`sort`、permission 是否重复
- 执行前请确认非生产环境
- **`pg.sql`：** 开发者全库备份快照，**可能与当前库不一致**；AI **禁止读取**作为 dict/menu 查证依据，应以 Postgres MCP 或实际库为准
- **Handoff SQL：** AI 仅生成 `*-init.sql` 文件，**禁止**用脚本/MCP/psql/临时代码代跑；开发者手动执行
- 偏好文件（如允许 AI 代跑 `db:push`）：见 `.ai/dev-preferences.local.example.md`