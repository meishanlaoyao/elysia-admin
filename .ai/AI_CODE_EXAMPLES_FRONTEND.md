# Frontend Code Examples (Copy These)

Copy patterns exactly. Do NOT invent new patterns.

**Index only:** [AI_CODE_EXAMPLES.md](./AI_CODE_EXAMPLES.md) — do not read both frontend and backend files unless the task needs both.

---

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

## Frontend — useDictStore (dict-backed fields)

Business status/type fields **MUST** use dict store — never hardcode enum options when `dict_type` exists in DB.

### index.vue — table label

```ts
import { useDictStore } from '@/store/modules/dict'

const dictStore = useDictStore()

// inside columnsFactory:
{
  prop: 'status',
  label: '状态',
  formatter: (row) => dictStore.getDictLabel('business_goods_status', row.status)
}
```

### xxx-search.vue / xxx-dialog.vue — select options

```ts
import { useDictStore } from '@/store/modules/dict'

const dictStore = useDictStore()
const { business_goods_status } = dictStore.getDictData(['business_goods_status'])

// in formItems:
{
  label: '状态',
  key: 'status',
  type: 'select',
  props: {
    placeholder: '请选择状态',
    options: business_goods_status.value.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue
    }))
  }
}
```

Add missing dict rows in `server/database/sql/{module}-init.sql`. See [AI_PAGE_QUALITY.md](./AI_PAGE_QUALITY.md).

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