---
inclusion: fileMatch
fileMatchPattern:
  - "admin/src/**/*.vue"
  - "admin/src/**/*.ts"
---

# 前端模块规范（Vue 3 + TypeScript）

与 [`.cursor/rules/frontend.mdc`](.cursor/rules/frontend.mdc) 同源。详细代码模板：

#[[file:.ai/AI_CODE_EXAMPLES.md]]

# Frontend File Structure

```
admin/src/
    types/api/{group}-{name}.d.ts   ← type declarations (declare namespace Api)
    api/{group}/{name}.ts           ← HTTP wrappers only
    views/{group}/{name}/
        index.vue                   ← page container (useTable, columns, dialog control)
        modules/
            {name}-search.vue       ← search form only
            {name}-dialog.vue       ← add/edit form only
```

---

# Type Declaration Pattern (`types/api/`)

```ts
declare namespace Api {
    namespace GroupName {  // PascalCase group + module name
        interface NameListItem {
            nameId?: number;
            fieldA?: string;
            status?: boolean;
            createTime?: Date;
            // ... mirror backend schema fields
        }
        type NameList = Api.Common.PaginatedResponse<NameListItem>
        type NameSearchParams = Partial<
            Pick<NameListItem, 'fieldA' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}
```

---

# API Layer Pattern (`api/{group}/{name}.ts`)

```ts
import request from '@/utils/http'

// Naming: fetch + Action + ModuleName
export function fetchCreateName(data: Api.GroupName.NameListItem) {
    return request.post({ url: '/api/group/name', data, showSuccessMessage: true, showErrorMessage: true })
}
export function fetchGetNameList(params: Api.GroupName.NameSearchParams) {
    return request.get<Api.GroupName.NameList>({ url: '/api/group/name/list', params })
}
export function fetchGetNameDetail(id: number) {
    return request.get<Api.GroupName.NameListItem>({ url: `/api/group/name/${id}` })
}
export function fetchUpdateName(data: Api.GroupName.NameListItem) {
    return request.put({ url: '/api/group/name', data, showSuccessMessage: true, showErrorMessage: true })
}
export function fetchDeleteName(ids: number | string) {
    return request.delete({ url: `/api/group/name/${ids}`, showSuccessMessage: true, showErrorMessage: true })
}
```

---

# useTable Pattern (`index.vue` script)

```ts
const { columns, columnChecks, data, loading, pagination,
        getData, searchParams, resetSearchParams,
        handleSizeChange, handleCurrentChange, refreshData
} = useTable({
  core: {
    apiFn: fetchGetNameList,
    apiParams: searchForm.value,
    paginationKey: { current: 'pageNum', size: 'pageSize' },
    columnsFactory: () => [
      { type: 'selection' },
      { type: 'index', width: 60, label: '序号' },
      { prop: 'fieldA', label: '字段A' },
      {
        prop: 'status', label: '状态',
        formatter: (row) => h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '停用')
      },
      {
        prop: 'operation', label: '操作', width: 120, fixed: 'right',
        formatter: (row) => h('div', [
          auth.hasAuth('group:name:update') && h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
          auth.hasAuth('group:name:delete') && h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) }),
        ].filter(Boolean))
      }
    ]
  }
})
```

---

# Search Component Pattern (`{name}-search.vue`)

```vue
<template>
  <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" :rules="rules"
    @reset="handleReset" @search="handleSearch" />
</template>
<script setup lang="ts">
interface Props { modelValue: Record<string, any> }
interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search', params: Record<string, any>): void
  (e: 'reset'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const searchBarRef = ref()
const formData = computed({ get: () => props.modelValue, set: (val) => emit('update:modelValue', val) })
const rules = {}
const formItems = computed(() => [
  { label: '名称', key: 'fieldA', type: 'input', placeholder: '请输入', clearable: true },
  { label: '状态', key: 'status', type: 'select', props: { placeholder: '请选择', options: [{ label: '启用', value: true }, { label: '停用', value: false }] } },
])
function handleReset() { emit('reset') }
async function handleSearch() { await searchBarRef.value.validate(); emit('search', formData.value) }
</script>
```

---

# Dialog Component Pattern (`{name}-dialog.vue`)

```vue
<template>
  <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="600px" align-center @closed="handleClosed">
    <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12" label-width="80px" :show-reset="false" :show-submit="false" />
    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>
<script setup lang="ts">
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import { fetchCreateName, fetchUpdateName } from '@/api/group/name'

interface Props { visible: boolean; type: string; data?: Partial<Api.GroupName.NameListItem> }
interface Emits { (e: 'update:visible', value: boolean): void; (e: 'submit'): void }
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const dialogVisible = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) })
const dialogType = computed(() => props.type)
const loading = ref(false)
const formRef = ref()
const formData = reactive({ nameId: undefined, fieldA: '', status: true, remark: '' })
const formItems = computed<FormItem[]>(() => [
  { label: '字段A', key: 'fieldA', type: 'input', props: { placeholder: '请输入' } },
  { label: '状态', key: 'status', type: 'switch' },
  { label: '备注', key: 'remark', type: 'input', span: 24, props: { type: 'textarea', rows: 3 } },
])
const rules = computed<FormRules>(() => ({
  fieldA: [{ required: true, message: '请输入字段A', trigger: 'blur' }],
}))
watch(() => props.visible, (v) => { if (v) nextTick(() => initFormData()) })
const initFormData = () => {
  loading.value = false
  if (props.type === 'edit' && props.data) { Object.assign(formData, props.data) }
  else { Object.assign(formData, { nameId: undefined, fieldA: '', status: true, remark: '' }) }
}
const handleSubmit = async () => {
  formRef.value?.validate().then(async () => {
    try {
      loading.value = true
      dialogType.value === 'add' ? await fetchCreateName(formData) : await fetchUpdateName(formData)
      emit('submit')
      dialogVisible.value = false
    } catch { loading.value = false }
  }).catch(() => ElMessage.error('表单校验失败'))
}
const handleClosed = () => formRef.value?.reset()
</script>
```

---

# Naming Convention

| Element | Rule | Example |
|---|---|---|
| Type namespace | `Api.{PascalGroup}{PascalName}` | `Api.BusinessGoods` |
| ListItem | `{Name}ListItem` | `GoodsListItem` |
| List type | `{Name}List` | `GoodsList` |
| Search params | `{Name}SearchParams` | `GoodsSearchParams` |
| API functions | `fetch{Action}{Name}` | `fetchCreateGoods` |
| Page component | `defineOptions({ name: '{PascalName}' })` | `defineOptions({ name: 'Goods' })` |
| Permission | `{group}:{name}:{action}` | `business:goods:create` |

---

# Forbidden in Frontend

- Business logic in components or search components
- Direct `fetch` or `axios` calls — always use `request` from `@/utils/http`
- Inline type definitions — declare in `types/api/{module}.d.ts`
- API calls inside `index.vue` template directly
- Direct store mutation outside the store module
- `any` type — use proper types

---

# File Reading Rules for Frontend Tasks

- **New page**: read only `admin/src/views/system/user/` as reference, then use templates above
- **Modify a component**: read only the specific `.vue` file being changed
- **Need types**: read only `types/api/{module}.d.ts` for the specific module
- **Need API functions**: check templates above; read `api/{group}/{module}.ts` only if you need to verify existing function names
- **DO NOT** scan `views/` directory, `components/core/`, `hooks/`, or `store/` unless strictly needed
