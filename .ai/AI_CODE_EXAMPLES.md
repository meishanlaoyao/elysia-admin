# Code Examples (Real Patterns — Copy These)

This file contains ready-to-use code templates extracted from the actual codebase.
AI must copy these patterns exactly. Do NOT invent new patterns.

---

# Backend Examples

## dto.ts — Using CrudDto (Preferred)

```ts
import { t } from 'elysia';
import { InsertXxx, SelectXxx } from "@database/schema/xxx";
import { CrudDto } from '@/types/dto';

// Create DTO: specify required fields
export const CreateDto = CrudDto.create(
    InsertXxx,
    SelectXxx,
    ['fieldA', 'fieldB']   // required fields
);

// Update DTO: specify primary key field name
export const UpdateDto = CrudDto.update(SelectXxx, 'xxxId');

// List DTO: add extra query fields beyond pageNum/pageSize/orderBy/time-range
export const ListDto = CrudDto.list(
    SelectXxx,
    {
        fieldA: t.Optional(t.String({ description: "字段A" })),
        fieldB: t.Optional(t.String({ description: "字段B" })),
    }
);
```

## dto.ts — Manual body definition (when CrudDto is not enough)

```ts
import { t } from 'elysia';
import { BaseResultDto, BaseListQueryDto } from '@/types/dto';

export const CreateDto = {
    body: t.Object({
        name: t.String({ description: '名称', minLength: 1 }),
        price: t.Number({ description: '价格', minimum: 0 }),
        status: t.Optional(t.Boolean({ description: '状态' })),
        remark: t.Optional(t.String({ description: '备注' })),
    }),
    ...BaseResultDto(t.Object({ xxxId: t.Number() })),
};

export const ListDto = {
    query: BaseListQueryDto({
        name: t.Optional(t.String({ description: '名称' })),
        status: t.Optional(t.Boolean({ description: '状态' })),
    }),
};
```

---

## handle.ts — Standard CRUD

```ts
import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll,
} from '@/core/database/repository';
import { xxxSchema } from '@database/schema/xxx';

export async function create(ctx: Context) {
    try {
        await InsertOne(xxxSchema, ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = 'createTime',
            sortRule = 'desc',
            startTime,
            endTime,
            fieldA,
            fieldB,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(xxxSchema)
            .eq('delFlag', false)
            .like('fieldA', fieldA)
            .eq('fieldB', fieldB)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(xxxSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule,
        });
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(xxxSchema, 'xxxId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function update(ctx: Context) {
    try {
        await UpdateByKey(xxxSchema, 'xxxId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function remove(ctx: Context) {
    try {
        await SoftDeleteByKeys(xxxSchema, 'xxxId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```

### QueryBuilder chaining reference

```ts
CreateQueryBuilder(xxxSchema)
    .eq('status', true)          // exact match (skips if undefined/null/'')
    .ne('type', 'excluded')      // not equal
    .like('name', name)          // %name% fuzzy match
    .ilike('title', title)       // case-insensitive fuzzy match
    .in('typeId', [1,2,3])       // IN array
    .dateRange('createTime', startTime, endTime)  // date range
    .gt('amount', 0)             // greater than
    .isNull('deletedAt')         // IS NULL
    .build()
```

---

## route.ts — Declarative Route Module

```ts
import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, remove, update } from './handle';
import { CreateDto, ListDto, UpdateDto } from "./dto";

const XxxModule: IRouteModule = {
    tags: '模块名称',
    routes: [
        {
            url: '/group/xxx',
            method: 'post',
            summary: '创建',
            dto: CreateDto,
            handle: create,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:create' }
        },
        {
            url: '/group/xxx/list',
            method: 'get',
            summary: '查询列表',
            dto: ListDto,
            handle: findList,
            meta: { isAuth: true, permission: 'group:xxx:query' }
        },
        {
            url: '/group/xxx/:id',
            method: 'get',
            summary: '查询详情',
            handle: findOne,
            meta: { isAuth: true, permission: 'group:xxx:query' }
        },
        {
            url: '/group/xxx',
            method: 'put',
            summary: '更新',
            dto: UpdateDto,
            handle: update,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:update' }
        },
        {
            url: '/group/xxx/:ids',
            method: 'delete',
            summary: '删除',
            handle: remove,
            meta: { isAuth: true, isLog: true, permission: 'group:xxx:delete' }
        },
    ]
};

export default XxxModule;
```

---

## task.ts — Scheduled Task Functions

task.ts exports plain functions. The function name must match the `jobName` stored in the database.

```ts
import { logger } from "@/shared/logger";
// import handle functions if business logic is needed
// import { findList } from "./handle";

export function xxxDailySync(args?: string) {
    logger.info(`xxxDailySync 执行, args: ${args}`);
    // call handle functions here, do NOT duplicate business logic
}

export function xxxCleanup() {
    logger.info('xxxCleanup 执行');
}
```

---

# Frontend Examples

## types/api/{module}.d.ts

```ts
declare namespace Api {
    namespace GroupXxx {

        /** 列表项 */
        interface XxxListItem {
            xxxId?: number;
            name?: string;
            status?: boolean;
            remark?: string | null;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: Date | null;
            updateBy?: number | null;
            delFlag?: boolean;
        }

        /** 分页列表 */
        type XxxList = Api.Common.PaginatedResponse<XxxListItem>

        /** 搜索参数 */
        type XxxSearchParams = Partial<
            Pick<XxxListItem, 'name' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}
```

---

## api/{group}/{module}.ts

```ts
import request from '@/utils/http'

export function fetchCreateXxx(data: Api.GroupXxx.XxxListItem) {
    return request.post({
        url: '/api/group/xxx',
        data,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}

export function fetchGetXxxList(params: Api.GroupXxx.XxxSearchParams) {
    return request.get<Api.GroupXxx.XxxList>({
        url: '/api/group/xxx/list',
        params
    })
}

export function fetchGetXxxDetail(id: number) {
    return request.get<Api.GroupXxx.XxxListItem>({
        url: `/api/group/xxx/${id}`
    })
}

export function fetchUpdateXxx(data: Api.GroupXxx.XxxListItem) {
    return request.put({
        url: '/api/group/xxx',
        data,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}

export function fetchDeleteXxx(ids: number | string) {
    return request.delete({
        url: `/api/group/xxx/${ids}`,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}
```

---

## views/{group}/{module}/index.vue — Page Container

```vue
<template>
  <div class="xxx-page art-full-height">
    <XxxSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'group:xxx:create'" @click="showDialog('add')" v-ripple>新增</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <XxxDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :data="currentRow"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { fetchGetXxxList, fetchDeleteXxx } from '@/api/group/xxx'
import XxxSearch from './modules/xxx-search.vue'
import XxxDialog from './modules/xxx-dialog.vue'
import { ElTag, ElMessageBox } from 'element-plus'
import type { DialogType } from '@/types'

defineOptions({ name: 'Xxx' })

type XxxListItem = Api.GroupXxx.XxxListItem

const auth = useAuth()
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentRow = ref<Partial<XxxListItem>>({})
const selectedRows = ref<XxxListItem[]>([])

const searchForm = ref({
  name: undefined,
  status: undefined,
})

const {
  columns, columnChecks, data, loading, pagination,
  getData, searchParams, resetSearchParams,
  handleSizeChange, handleCurrentChange, refreshData
} = useTable({
  core: {
    apiFn: fetchGetXxxList,
    apiParams: searchForm.value,
    paginationKey: { current: 'pageNum', size: 'pageSize' },
    columnsFactory: () => [
      { type: 'selection' },
      { type: 'index', width: 60, label: '序号' },
      { prop: 'name', label: '名称' },
      {
        prop: 'status',
        label: '状态',
        formatter: (row) => h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '停用')
      },
      {
        prop: 'operation', label: '操作', width: 120, fixed: 'right',
        formatter: (row) => {
          const buttons = []
          if (auth.hasAuth('group:xxx:update')) {
            buttons.push(h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }))
          }
          if (auth.hasAuth('group:xxx:delete')) {
            buttons.push(h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) }))
          }
          return h('div', buttons)
        }
      }
    ]
  }
})

const handleSearch = (params: Record<string, any>) => {
  Object.assign(searchParams, params)
  getData()
}

const showDialog = (type: DialogType, row?: XxxListItem) => {
  dialogType.value = type
  currentRow.value = row || {}
  nextTick(() => { dialogVisible.value = true })
}

const handleDelete = (row: XxxListItem) => {
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    fetchDeleteXxx(row.xxxId as number).then(() => refreshData())
  }).catch(() => ElMessage.info('已取消'))
}

const handleDialogSubmit = async () => {
  await refreshData()
  currentRow.value = {}
}

const handleSelectionChange = (selection: XxxListItem[]) => {
  selectedRows.value = selection
}
</script>
```

---

## views/{group}/{module}/modules/xxx-search.vue

```vue
<template>
  <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" :rules="rules"
    @reset="handleReset" @search="handleSearch" />
</template>

<script setup lang="ts">
interface Props {
  modelValue: Record<string, any>
}
interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search', params: Record<string, any>): void
  (e: 'reset'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchBarRef = ref()
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const rules = {}

const formItems = computed(() => [
  {
    label: '名称',
    key: 'name',
    type: 'input',
    placeholder: '请输入名称',
    clearable: true
  },
  {
    label: '状态',
    key: 'status',
    type: 'select',
    props: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: true },
        { label: '停用', value: false },
      ]
    }
  },
])

function handleReset() {
  emit('reset')
}

async function handleSearch() {
  await searchBarRef.value.validate()
  emit('search', formData.value)
}
</script>
```

---

## views/{group}/{module}/modules/xxx-dialog.vue

```vue
<template>
  <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="600px" align-center
    @closed="handleClosed">
    <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12"
      label-width="80px" :show-reset="false" :show-submit="false" />
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import { fetchCreateXxx, fetchUpdateXxx } from '@/api/group/xxx'

interface Props {
  visible: boolean
  type: string
  data?: Partial<Api.GroupXxx.XxxListItem>
}
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})
const dialogType = computed(() => props.type)
const loading = ref(false)
const formRef = ref()

const formData = reactive({
  xxxId: undefined,
  name: '',
  status: true,
  remark: '',
})

const formItems = computed<FormItem[]>(() => [
  {
    label: '名称',
    key: 'name',
    type: 'input',
    props: { placeholder: '请输入名称' }
  },
  {
    label: '状态',
    key: 'status',
    type: 'switch'
  },
  {
    label: '备注',
    key: 'remark',
    type: 'input',
    span: 24,
    props: { type: 'textarea', rows: 3, placeholder: '请输入备注' }
  }
])

const rules = computed<FormRules>(() => ({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
}))

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(() => initFormData())
    }
  }
)

const initFormData = () => {
  loading.value = false
  if (props.type === 'edit' && props.data) {
    Object.assign(formData, props.data)
  } else {
    Object.assign(formData, { xxxId: undefined, name: '', status: true, remark: '' })
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value.validate().then(async () => {
    try {
      loading.value = true
      if (dialogType.value === 'add') {
        await fetchCreateXxx(formData)
      } else {
        await fetchUpdateXxx(formData)
      }
      emit('submit')
      dialogVisible.value = false
    } catch {
      loading.value = false
    }
  }).catch(() => {
    ElMessage.error('表单校验失败，请检查输入')
  })
}

const handleClosed = () => {
  formRef.value?.reset()
}
</script>

<style scoped lang="scss"></style>
```

---

# Naming Convention Quick Reference

| Element | Pattern | Example |
|---|---|---|
| Backend module folder | `{group}-{name}` | `business-goods` |
| Backend permission | `{group}:{name}:{action}` | `business:goods:create` |
| Backend primary key | `{name}Id` | `goodsId` |
| Frontend type namespace | `Api.{Group}{Name}` | `Api.BusinessGoods` |
| Frontend API function | `fetch{Action}{Name}` | `fetchCreateGoods` |
| Frontend page | `views/{group}/{name}/index.vue` | `views/business/goods/index.vue` |
| Frontend search | `{name}-search.vue` | `goods-search.vue` |
| Frontend dialog | `{name}-dialog.vue` | `goods-dialog.vue` |
| Frontend type file | `types/api/{group}-{name}.d.ts` | `types/api/business-goods.d.ts` |
