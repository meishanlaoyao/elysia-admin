---
inclusion: auto
name: ai-ops-supplement
description: Postgres MCP 只读、手执 SQL、system_menu 与权限、数据字典、Excel 导入导出、内置 UI 组件路径。适用于菜单/按钮权限、字典对齐、种子数据、联调假数据或 MCP 核对表结构等运维向任务。
---

# AI 运维与工具链补充（精简版）

完整条文见：

#[[file:.ai/AI_CONTEXT_CAPSULE.md]]

## 要点速记

- **内置 UI**：需要用法时对照 `admin/src/views/system/user/`，勿通读 `admin/src/components/core/`。常用路径：`@/components/core/forms/`（`ArtForm`、`ArtSearchBar`、`ArtButtonTable` 等）、`@/components/core/tables/`。
- **Postgres MCP**：若可用，仅用于**只读**核对表/数据；不可替代迁移、DDL 或业务写库。
- **手执 SQL**：种子数据、菜单/字典/角色关联等由开发者在目标环境手动执行；改 schema 须先征得项目负责人同意。
- **菜单与权限**：后端 `route.ts` 的 `meta.permission` 与前端 `v-auth` / `auth.hasAuth` 使用同一 `group:name:action` 字符串；DB 驱动菜单时对齐 `system_menu` 等表（细节以迁移或只读查询为准）。
- **字典**：类型/枚举与 `system_dict_type`、`system_dict_data` 对齐；有只读查询时先查是否已有 `dict_type`，避免重复造码。
