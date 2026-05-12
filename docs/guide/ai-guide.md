---
title: AI 快速开发指南
description: 通过一段提示词，让 AI 立即理解 Elysia Admin 的代码规范，并按项目风格生成完整的前后端模块代码。
head:
  - - meta
    - name: keywords
      content: Elysia Admin AI 开发, AI 代码生成, Cursor AI, 提示词模板
---

# AI 快速开发指南

本项目内置了一套 AI 规范文档（`.ai/` 目录）和 Cursor 规则（`.cursor/rules/`），可让 AI 在无需阅读大量源码的情况下，直接按照项目规范生成前后端代码。

---

## 一、Cursor 用户（推荐）

项目已在 `.cursor/rules/` 中配置了三个自动加载的规则文件：

| 规则文件 | 触发范围 | 作用 |
|---|---|---|
| `general.mdc` | 始终生效 | 架构分层、依赖方向、文件读取纪律 |
| `backend.mdc` | `server/src/**/*.ts` | 后端模块结构、repository 用法、代码模板 |
| `frontend.mdc` | `admin/src/**/*.{vue,ts}` | 前端页面结构、useTable、组件模板 |

**你不需要做任何配置**，在 Cursor 中对话时，AI 会自动加载对应规则。

### 一键生成后端模块

直接发送以下消息：

```
帮我创建一个商品管理模块（business-goods），功能包括：
- 商品名称、价格、库存、备注
- 标准 CRUD（创建、列表查询、详情、更新、软删除）
- 需要登录认证和操作日志
- 无需定时任务
```

AI 会自动：
1. 列出要创建的文件（`dto.ts` / `handle.ts` / `route.ts` / `task.ts`）
2. 按项目规范生成代码，不读取无关文件
3. 使用 `CrudDto`、`InsertOne`、`FindPage`、`CreateQueryBuilder`、`BaseResultData` 等封装好的工具

### 一键生成前端页面

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

## 二、其他 AI 工具（ChatGPT / Claude 网页版等）

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
    handle.ts   ← 业务层，只用 repository 函数
    route.ts    ← HTTP 映射层，薄层，只绑定 dto+handle
    task.ts     ← 定时任务函数

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
import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { InsertOne, FindPage, FindOneByKey, UpdateByKey, SoftDeleteByKeys, CreateQueryBuilder } from '@/core/database/repository';
import { xxxSchema } from '@database/schema/xxx';

export async function create(ctx: Context) {
    try { await InsertOne(xxxSchema, ctx); return BaseResultData.ok(); }
    catch (error) { return BaseResultData.fail(500, error); }
}
export async function findList(ctx: Context) {
    try {
        const { pageNum = 1, pageSize = 10, orderByColumn = 'createTime', sortRule = 'desc', startTime, endTime, field1 } = ctx.query;
        const whereCondition = CreateQueryBuilder(xxxSchema).eq('delFlag', false).like('field1', field1).dateRange('createTime', startTime, endTime).build();
        const res = await FindPage(xxxSchema, whereCondition, { pageNum, pageSize, orderByColumn, sortRule });
        return BaseResultData.ok(res);
    } catch (error) { return BaseResultData.fail(500, error); }
}
export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(xxxSchema, 'xxxId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    } catch (error) { return BaseResultData.fail(500, error); }
}
export async function update(ctx: Context) {
    try { await UpdateByKey(xxxSchema, 'xxxId', ctx); return BaseResultData.ok(); }
    catch (error) { return BaseResultData.fail(500, error); }
}
export async function remove(ctx: Context) {
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


## 三、`.ai/` 规范文档说明

项目根目录下的 `.ai/` 文件夹包含 AI 编写代码的完整规范，可手动传给任何 AI：

| 文件 | 内容 |
|---|---|
| `AI_STRUCTURE.md` | 整体架构分层说明 |
| `AI_DEPENDENCY.md` | 依赖方向约束（哪些层不能互相依赖） |
| `AI_MODULE_STANDARD.md` | 后端模块四文件规范（dto/handle/route/task 职责） |
| `AI_FRONTEND_RULES.md` | 前端页面五文件规范（types/api/index/search/dialog） |
| `AI_FEATURE_TEMPLATE.md` | 新功能开发的 10 步流程 |
| `AI_GENERATION.md` | 通用代码生成规则 |
| `AI_CODE_EXAMPLES.md` | **完整可复用代码模板**（直接复制使用） |

---

## 四、注意事项

**AI 会自动控制文件读取范围**，规则中已明确：

- 新建模块时只读一个参考模块，不扫描整个目录
- 修改现有文件时只读该文件本身
- 不读取 `node_modules/`、`dist/`、`core/`（除非任务明确涉及）
- 规则和代码模板已内嵌足够的上下文，无需 AI "探索"项目

这可以显著减少 token 消耗，同时保证生成的代码与项目风格完全一致。
