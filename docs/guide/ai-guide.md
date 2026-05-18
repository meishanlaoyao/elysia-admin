---
title: AI 开发指南
description: 介绍 Cursor、Trae、Kiro 的项目规则与 `.ai/` 规范文档，配合提示词让 AI 按 Elysia Admin 风格生成前后端模块代码。
head:
  - - meta
    - name: keywords
      content: Elysia Admin AI 开发, AI 代码生成, Cursor, Trae, Kiro, 提示词模板
---

# AI 开发指南

本项目内置了一套 AI 规范文档（`.ai/` 目录），并在多种 IDE 中提供了**与 Cursor 规则语义对齐**的项目级配置，便于在不同工具里获得一致的生成行为。代码级模板以 `.ai/AI_CODE_EXAMPLES.md` 为准；**工具链与运维向**约定（内置组件索引、Postgres MCP、手执 SQL、字典与菜单权限等）见 `.ai/AI_CONTEXT_CAPSULE.md`，按需阅读即可。

## 文档索引（llms.txt）

本站提供符合 [llmstxt.org](https://llmstxt.org/) 的索引文件，便于 Cursor、Claude 等一次性加载全站目录或全文。

<EaLlmsDownload />

## 一、IDE 内建规则（Cursor / Trae / Kiro）

以下三处规则与 `.cursor/rules/` 同源：**架构与读文件纪律**一致，**前后端长模板**仍以 `.ai/AI_CODE_EXAMPLES.md` 为唯一详版，避免多处复制导致漂移。维护时若调整依赖方向、目录约定或读文件策略，请同步更新 Cursor、Trae、Kiro 对应文件（Trae 维护说明见 `.trae/README.md`；Kiro 见下文 1.3 表，无单独 README）。

### Cursor（推荐）

项目已在 `.cursor/rules/` 中配置了三个自动加载的规则文件：

| 规则文件 | 触发范围 | 作用 |
|---|---|---|
| `general.mdc` | 始终生效 | 架构分层、依赖方向、文件读取纪律 |
| `backend.mdc` | `server/src/**/*.ts` | 后端模块结构、repository 用法、代码模板 |
| `frontend.mdc` | `admin/src/**/*.{vue,ts}` | 前端页面结构、useTable、组件模板 |

**你不需要做任何配置**，在 Cursor 中对话时，AI 会自动加载对应规则。

`general.mdc` 中已说明：涉及内置 UI 路径、MCP 只读范围、**由开发者本地执行的手执 SQL**、数据字典是否与库一致、新菜单与权限 checklist 时，可让 AI **按需**阅读 `.ai/AI_CONTEXT_CAPSULE.md`（篇幅短，**不替代** `AI_CODE_EXAMPLES.md`）。

### Trae

仓库根目录下 `.trae/rules/` 提供与 Cursor 一一对应的 Markdown 规则（frontmatter 字段与 Cursor 类似，便于对照维护）：

| 文件 | 触发方式 | 作用 |
|---|---|---|
| `general.md` | `alwaysApply: true` | 与 `general.mdc` 等价；文末含 `.ai` 各文档职责索引 |
| `frontend.md` | `globs: admin/src/**/*.vue,admin/src/**/*.ts` | 与 `frontend.mdc` 等价 |
| `backend.md` | `globs: server/src/**/*.ts` | 与 `backend.mdc` 等价 |

在 Trae 中打开本仓库后，按 Trae 官方文档启用项目规则即可（若你使用的 Trae 版本仅支持单文件如 `project_rules.md`，可将上述三文件合并或按官方说明调整路径，语义仍与上表一致）。

### Kiro

仓库根目录下 `.kiro/steering/` 使用 [Kiro Steering](https://kiro.dev/docs/steering/) 机制，通过 front matter 控制加载范围，并用 **`#[[file:相对路径]]`** 引用仓库内的 `.ai` 大文档，避免把长模板搬进 steering。

| 文件 | 加载方式 | 作用 |
|---|---|---|
| `product.md` | `inclusion: always` | 产品定位、典型开发任务（精炼） |
| `structure.md` | `inclusion: always` | 目录树、职责边界、单参考样例、读文件摘要 |
| `tech.md` | `inclusion: always` | 技术栈、依赖方向、生成原则；内含对 `AI_CODE_EXAMPLES.md` / `AI_CONTEXT_CAPSULE.md` 的活引用 |
| `frontend-vue.md` | `inclusion: fileMatch` → `admin/src/**/*.vue`、`admin/src/**/*.ts` | 与 `frontend.mdc` 同正文，顶部引用代码模板文件 |
| `backend-elysia.md` | `inclusion: fileMatch` → `server/src/**/*.ts` | 与 `backend.mdc` 同正文，顶部引用代码模板文件 |
| `ai-ops-supplement.md` | `inclusion: auto`（按描述匹配） | 菜单/权限/MCP/字典/手执 SQL 等运维向摘要，并引用 `AI_CONTEXT_CAPSULE.md` |

Kiro 中也可在仓库根使用 [AGENTS.md](https://agents.md/) 标准；本仓库以 `.kiro/steering/` 为主。

## 二、示例提示词（仓库内开发）

在 **Cursor、Trae、Kiro** 中已启用第一章所述规则时，直接把下面整段发给对话即可，AI 更易遵守读文件纪律；示例以「商品」模块为名，可按你的业务改名与路径。任意支持长上下文的对话工具也可粘贴使用。

### 只生成后端模块

直接发送以下消息：

```
帮我创建一个商品管理模块（business-goods），功能包括：
- 商品名称、价格、库存、备注
- 标准 CRUD（创建、列表查询、详情、更新、软删除）
- 需要登录认证和操作日志
- 无需定时任务
```

若需要 BullMQ 定时/队列任务：在模块 `task.ts` 定义函数，在 `server/src/worker-sandbox/` 注册（勿在 `processor.ts` 内直接 `import '@/modules/...'`），详见 [定时任务](./cron.md) 与 [队列](./queue.md)。

AI 通常会：

1. 列出要创建的文件（`dto.ts` / `handle.ts` / `route.ts` / `task.ts`）
2. 按项目规范生成代码，不读取无关文件
3. 使用 `CrudDto`、`InsertOne`、`FindPage`、`CreateQueryBuilder`、`BaseResultData` 等封装好的工具

### 只生成前端页面

```
帮我创建商品管理的前端页面（business/goods），包含：
- 类型声明（Api.BusinessGoods）
- API 层（fetchCreateGoods / fetchGetGoodsList / fetchUpdateGoods / fetchDeleteGoods）
- 列表页（index.vue）：显示名称、价格、状态列，支持搜索和新增/编辑/删除
- 搜索组件（goods-search.vue）：按名称、状态搜索
- 弹窗组件（goods-dialog.vue）：新增/编辑表单
```

### 一键生成完整前后端

```
帮我创建一个完整的商品管理功能，包括前端和后端：

【后端】server/src/modules/business-goods/
- 表字段：goodsId（主键）、name（名称）、price（价格）、stock（库存）、status（状态）、remark（备注）
- 标准 CRUD 接口

【前端】admin/src/
- types/api/business-goods.d.ts
- api/business/goods.ts
- views/business/goods/index.vue + modules/goods-search.vue + modules/goods-dialog.vue
```

---

## 三、其他 AI 工具（ChatGPT / Claude 网页版等）

将以下内容复制给 AI，作为上下文前缀：

```
# 项目背景

这是一个全栈管理后台项目（elysia-admin），前后端分离：
- 前端：Vue 3 + TypeScript + Composition API + Element Plus（Art Design Pro）
- 后端：Elysia + Bun，模块化单体架构

---

# 后端规范

## 目录结构
server/src/modules/{group}-{name}/
    dto.ts      ← 验证层，只定义 schema
    handle.ts   ← 业务层，只用 repository 函数（参数类型 AppContext）
    route.ts    ← HTTP 映射层，薄层，只绑定 dto+handle
    task.ts     ← BullMQ 沙箱可调用的导出函数（按需）

队列/定时：在 server/src/worker-sandbox/*-tasks.ts 注册，processor 只 import worker-sandbox

## dto.ts 模板
import { t } from 'elysia';
import { InsertXxx, SelectXxx } from "@database/schema/xxx";
import { CrudDto } from '@/types/dto';

export const CreateDto = CrudDto.create(InsertXxx, SelectXxx, ['field1', 'field2']);
export const UpdateDto = CrudDto.update(SelectXxx, 'xxxId');
export const ListDto = CrudDto.list(SelectXxx, {
    field1: t.Optional(t.String({ description: "字段1" })),
});

## handle.ts 模板
import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { InsertOne, FindPage, FindOneByKey, UpdateByKey, SoftDeleteByKeys, CreateQueryBuilder } from '@/core/database/repository';
import { xxxSchema } from '@database/schema/xxx';

export async function create(ctx: AppContext) {
    try { await InsertOne(xxxSchema, ctx); return BaseResultData.ok(); }
    catch (error) { return BaseResultData.fail(500, error); }
}
export async function findList(ctx: AppContext) {
    try {
        const { pageNum = 1, pageSize = 10, orderByColumn = 'createTime', sortRule = 'desc', startTime, endTime, field1 } = ctx.query;
        const whereCondition = CreateQueryBuilder(xxxSchema).eq('delFlag', false).like('field1', field1).dateRange('createTime', startTime, endTime).build();
        const res = await FindPage(xxxSchema, whereCondition, { pageNum, pageSize, orderByColumn, sortRule });
        return BaseResultData.ok(res);
    } catch (error) { return BaseResultData.fail(500, error); }
}
export async function findOne(ctx: AppContext) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(xxxSchema, 'xxxId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    } catch (error) { return BaseResultData.fail(500, error); }
}
export async function update(ctx: AppContext) {
    try { await UpdateByKey(xxxSchema, 'xxxId', ctx); return BaseResultData.ok(); }
    catch (error) { return BaseResultData.fail(500, error); }
}
export async function remove(ctx: AppContext) {
    try { await SoftDeleteByKeys(xxxSchema, 'xxxId', ctx); return BaseResultData.ok(); }
    catch (error) { return BaseResultData.fail(500, error); }
}

## route.ts 模板
import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, remove, update } from './handle';
import { CreateDto, ListDto, UpdateDto } from "./dto";

const XxxModule: IRouteModule = {
    tags: '模块名称',
    routes: [
        { url: '/group/xxx', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'group:xxx:create' } },
        { url: '/group/xxx/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'group:xxx:query' } },
        { url: '/group/xxx/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'group:xxx:query' } },
        { url: '/group/xxx', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'group:xxx:update' } },
        { url: '/group/xxx/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'group:xxx:delete' } },
    ]
};
export default XxxModule;

---

# 前端规范

## 类型声明（types/api/{module}.d.ts）
declare namespace Api {
    namespace GroupXxx {
        interface XxxListItem { xxxId?: number; fieldA?: string; status?: boolean; remark?: string | null; createTime?: Date; }
        type XxxList = Api.Common.PaginatedResponse<XxxListItem>
        type XxxSearchParams = Partial<Pick<XxxListItem, 'fieldA' | 'status'> & Api.Common.CommonSearchParams>
    }
}

## API 层（api/{group}/{module}.ts）
import request from '@/utils/http'
export function fetchCreateXxx(data: Api.GroupXxx.XxxListItem) { return request.post({ url: '/api/group/xxx', data, showSuccessMessage: true, showErrorMessage: true }) }
export function fetchGetXxxList(params: Api.GroupXxx.XxxSearchParams) { return request.get<Api.GroupXxx.XxxList>({ url: '/api/group/xxx/list', params }) }
export function fetchUpdateXxx(data: Api.GroupXxx.XxxListItem) { return request.put({ url: '/api/group/xxx', data, showSuccessMessage: true, showErrorMessage: true }) }
export function fetchDeleteXxx(ids: number | string) { return request.delete({ url: `/api/group/xxx/${ids}`, showSuccessMessage: true, showErrorMessage: true }) }

## 列表页核心（index.vue script 部分）
const { columns, columnChecks, data, loading, pagination, getData, searchParams, resetSearchParams, handleSizeChange, handleCurrentChange, refreshData } = useTable({
  core: {
    apiFn: fetchGetXxxList,
    apiParams: searchForm.value,
    paginationKey: { current: 'pageNum', size: 'pageSize' },
    columnsFactory: () => [
      { type: 'selection' },
      { type: 'index', width: 60, label: '序号' },
      { prop: 'fieldA', label: '字段A' },
      { prop: 'status', label: '状态', formatter: (row) => h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '停用') },
      { prop: 'operation', label: '操作', width: 120, fixed: 'right', formatter: (row) => h('div', [h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }), h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })]) }
    ]
  }
})

## 搜索组件模板（{name}-search.vue）
使用 ArtSearchBar，props: modelValue, emits: update:modelValue / search / reset
formItems 数组配置 type: 'input' | 'select' | 'date-picker' 等

## 弹窗组件模板（{name}-dialog.vue）
使用 ArtForm，props: visible / type / data, emits: update:visible / submit
open 时 initFormData()，closed 时 formRef.value?.reset()
```

然后直接提需求，例如：

```
请按照上述规范，帮我创建商品管理模块（business-goods），字段：goodsId、name、price、stock、status、remark，包括完整的前后端代码。
```

若任务涉及 **数据字典对齐、菜单/权限、种子 SQL、内置表格/Excel 导出** 等，可将仓库内 `.ai/AI_CONTEXT_CAPSULE.md` 全文一并粘贴给 AI 作补充（与上文代码模板配合使用）。

## 四、`.ai/` 规范文档说明

项目根目录下的 `.ai/` 文件夹包含 AI 编写代码的完整规范，可手动传给任何 AI。若使用 **Cursor、Trae 或 Kiro**，仓库内已提交的 IDE 规则（见第一章）会复用本节所列文档的职责划分；在 **纯网页版** 对话中则更依赖你主动粘贴下表中的文件。

| 文件 | 内容 |
|---|---|
| `AI_STRUCTURE.md` | 整体架构分层说明 |
| `AI_DEPENDENCY.md` | 依赖方向约束（哪些层不能互相依赖） |
| `AI_MODULE_STANDARD.md` | 后端模块四文件规范（dto/handle/route/task 职责） |
| `AI_FRONTEND_RULES.md` | 前端页面五文件规范（types/api/index/search/dialog） |
| `AI_FEATURE_TEMPLATE.md` | 新功能开发的 10 步流程 |
| `AI_GENERATION.md` | 通用代码生成规则 |
| `AI_CODE_EXAMPLES.md` | **完整可复用代码模板**（直接复制使用） |
| `AI_CONTEXT_CAPSULE.md` | **工具链补充**（内置 UI 索引、Postgres MCP 只读、手执 SQL、字典与菜单权限；按需阅读，**非**代码模板） |

---

## 五、注意事项

**AI 会自动控制文件读取范围**，规则中已明确：

- 新建模块时只读一个参考模块，不扫描整个目录
- 修改现有文件时只读该文件本身
- 不读取 `node_modules/`、`dist/`、`build/`；默认不通读 `server/src/core/`、`admin/src/components/core/`；`database/schema/` 仅打开**当前任务涉及的那一张表**（除非任务明确要求基础设施或改表）
- 规则和代码模板已内嵌足够的上下文，无需 AI「扫目录摸项目」
- 若在 IDE 中已配置 **Postgres MCP**（如 `user-postgres`），其中 `query` 一般为 **只读**；写库、种子数据、补字典等可由 AI 生成 **可复制 SQL**，由你在本机工具中 **自行执行**（详见 `AI_CONTEXT_CAPSULE.md`）
- 列表导出等可优先使用内置 `ArtExcelExport` 等组件，不必为导出单独造一套后端（仍按需保留业务接口）

这可以显著减少 token 消耗，同时保证生成的代码与项目风格完全一致。
