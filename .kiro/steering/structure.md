---
inclusion: always
---

# 仓库与目录结构

```
elysia-admin/
├── admin/src/          # 前端（Vue 3 + TypeScript，Art Design Pro）
└── server/src/         # 后端（Elysia + Bun）
    ├── modules/        # 业务模块，每模块独立目录
    ├── core/           # 基础设施（默认不要修改）
    ├── shared/         # 无状态纯工具
    └── infrastructure/ # 外部客户端封装
```

## 职责边界

- **前端** `admin/src/`：仅通过 HTTP 调用后端；不直连数据库。
- **后端** `server/src/modules/`：业务与数据访问；依赖可指向 `core`、`shared`、`infrastructure`，**不可**反向依赖其他模块目录来「抄捷径」。

## 新功能时的唯一参考样例（各读一个）

- **新后端模块**：只打开 `server/src/modules/system-api/` 作为结构参考。
- **新前端页面**：只打开 `admin/src/views/system/user/` 作为结构参考。

## 读文件纪律（摘要）

- 改哪个文件就只读哪个文件；需要类型时再读对应 `types/api` 或 `database/schema` 中的单表文件。
- **禁止**为「摸清项目」而扫描整个 `views/`、`modules/` 或通读 `admin/src/components/core/`、`server/src/core/`（除非任务明确要求或修复 core 缺陷）。
