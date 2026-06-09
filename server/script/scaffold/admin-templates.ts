import type { ParsedSchema, SchemaField } from './schema-parser';
import {
    slugToPermissionPrefix,
    slugToUrlPath,
    toApiNamespace,
    toEntityName,
    toTypeFileName,
} from './naming';

export interface AdminTemplateContext {
    group: string;
    name: string;
    tag: string;
    schema: ParsedSchema;
};

function searchFormField(field: SchemaField): string {
    if (field.tsType === 'boolean') {
        return `    {
        label: '${field.name}',
        key: '${field.name}',
        type: 'select',
        props: {
            placeholder: '请选择',
            clearable: true,
            options: [
                { label: '是', value: true },
                { label: '否', value: false },
            ],
        },
    }`;
    }
    return `    {
        label: '${field.name}',
        key: '${field.name}',
        type: 'input',
        props: { placeholder: '请输入${field.name}' },
        clearable: true,
    }`;
};

function dialogFormField(field: SchemaField): string {
    if (field.tsType === 'boolean') {
        return `    {
        label: '${field.name}',
        key: '${field.name}',
        type: 'switch',
    }`;
    };
    return `    {
        label: '${field.name}',
        key: '${field.name}',
        type: 'input',
        props: { placeholder: '请输入${field.name}' },
    }`;
};

function tableColumn(field: SchemaField): string {
    if (field.tsType === 'boolean') {
        return `            {
                prop: '${field.name}',
                label: '${field.name}',
                align: 'center',
                formatter: (row) => h(ElTag, {
                    type: row.${field.name} ? 'success' : 'danger',
                }, () => row.${field.name} ? '是' : '否'),
            }`;
    };
    return `            { prop: '${field.name}', label: '${field.name}', align: 'center' }`;
};

function formDataInit(fields: SchemaField[], pk: SchemaField): string {
    const lines = [`        ${pk.name}: undefined`];
    for (const field of fields) {
        if (field.name === pk.name) continue;
        if (field.tsType === 'boolean') {
            lines.push(`        ${field.name}: true`);
        } else if (field.tsType === 'number') {
            lines.push(`        ${field.name}: undefined`);
        } else {
            lines.push(`        ${field.name}: ''`);
        };
    };
    lines.push(`        remark: ''`);
    return lines.join(',\n');
};

function formDataReset(fields: SchemaField[], pk: SchemaField): string {
    const lines = [`        ${pk.name}: undefined`];
    for (const field of fields) {
        if (field.name === pk.name) continue;
        if (field.tsType === 'boolean') {
            lines.push(`        ${field.name}: isEdit ? row.${field.name} : true`);
        } else {
            lines.push(`        ${field.name}: isEdit && row.${field.name} ? row.${field.name} || '' : ''`);
        };
    };
    lines.push(`        remark: isEdit && row.remark ? row.remark || '' : ''`);
    return lines.join(',\n');
};

function validationRules(requiredFields: string[]): string {
    if (requiredFields.length === 0) return 'const rules: FormRules = {}';
    const lines = requiredFields.map((field) => `    ${field}: [
        { required: true, message: '请输入${field}', trigger: 'blur' },
    ]`);
    return `const rules: FormRules = {\n${lines.join(',\n')}\n}`;
};

function pkDeleteArg(pk: SchemaField): string {
    return pk.tsType === 'number'
        ? `row.${pk.name} as number`
        : `row.${pk.name} as string`;
};

function pkArrayCast(pk: SchemaField): string {
    return pk.tsType === 'number'
        ? `selectedRows.value.map((item) => item.${pk.name} as number)`
        : `selectedRows.value.map((item) => item.${pk.name} as string).join(',')`;
};

export function renderTypesDts(ctx: AdminTemplateContext): string {
    const ns = toApiNamespace(ctx.group, ctx.name);
    const entity = toEntityName(ctx.name);
    const pk = ctx.schema.pkField;
    const itemFields = [pk, ...ctx.schema.businessFields];
    const searchPick = ctx.schema.listQueryFields.map((f) => `'${f.name}'`).join(' | ') || `'${pk.name}'`;
    const optionalBase = [
        { name: 'createTime', tsType: 'Date' as const },
        { name: 'createBy', tsType: 'string' as const },
        { name: 'updateTime', tsType: 'Date' as const },
        { name: 'updateBy', tsType: 'string' as const },
        { name: 'delFlag', tsType: 'boolean' as const },
        { name: 'remark', tsType: 'string' as const },
    ].filter((b) => !itemFields.some((f) => f.name === b.name));
    return `declare namespace Api {
    namespace ${ns} {
        interface ${entity}ListItem {
${[...itemFields, ...optionalBase].map((f) => `            ${f.name}?: ${f.tsType === 'Date' ? 'Date' : f.tsType};`).join('\n')}
        }

        type ${entity}List = Api.Common.PaginatedResponse<${entity}ListItem>

        type ${entity}SearchParams = Partial<
            Pick<${entity}ListItem, ${searchPick}> &
            Api.Common.CommonSearchParams
        >
    }
}
`;
};

export function renderApiTs(ctx: AdminTemplateContext): string {
    const ns = toApiNamespace(ctx.group, ctx.name);
    const entity = toEntityName(ctx.name);
    const urlPath = slugToUrlPath(`${ctx.group}-${ctx.name}`);
    return `import request from '@/utils/http'

export function fetchCreate${entity}(data: Api.${ns}.${entity}ListItem) {
    return request.post({
        url: '/api${urlPath}',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchGet${entity}List(params: Api.${ns}.${entity}SearchParams) {
    return request.get<Api.${ns}.${entity}List>({
        url: '/api${urlPath}/list',
        params,
    })
}

export function fetchUpdate${entity}(data: Api.${ns}.${entity}ListItem) {
    return request.put({
        url: '/api${urlPath}',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchDelete${entity}(ids: number | number[] | string) {
    const str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: \`/api${urlPath}/\${str}\`,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}
`;
};

export function renderIndexVue(ctx: AdminTemplateContext): string {
    const ns = toApiNamespace(ctx.group, ctx.name);
    const entity = toEntityName(ctx.name);
    const perm = slugToPermissionPrefix(`${ctx.group}-${ctx.name}`);
    const pk = ctx.schema.pkField;
    const searchComponent = `${entity}Search`;
    const dialogComponent = `${entity}Dialog`;
    const tableColumns = ctx.schema.formFields
        .filter((f) => f.name !== 'remark')
        .slice(0, 5)
        .map((f) => tableColumn(f))
        .join(',\n');
    return `<template>
    <div class="${ctx.name}-page art-full-height">
        <${searchComponent} v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'${perm}:create'">新增${ctx.tag}</ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'${perm}:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <${dialogComponent} v-model:visible="dialogVisible" :type="dialogType" :data="currentRowData"
                @submit="refreshData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { DialogType } from '@/types'
import { useTable } from '@/hooks/core/useTable'
import { ElMessage, ElMessageBox, ElTag, ElSpace } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ${searchComponent} from './modules/${ctx.name}-search.vue'
import ${dialogComponent} from './modules/${ctx.name}-dialog.vue'
import { fetchGet${entity}List, fetchDelete${entity} } from '@/api/${ctx.group}/${ctx.name}'

type ${entity}ListItem = Api.${ns}.${entity}ListItem

defineOptions({ name: '${entity}' })

const auth = useAuth()

const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentRowData = ref<Partial<${entity}ListItem>>({})
const selectedRows = ref<${entity}ListItem[]>([])

const searchForm = ref({
${ctx.schema.listQueryFields.map((f) => `    ${f.name}: undefined,`).join('\n')}
})

const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
} = useTable({
    core: {
        apiFn: fetchGet${entity}List,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' },
            { type: 'index', width: 60, label: '序号', align: 'center' },
${tableColumns},
            {
                prop: 'createTime',
                label: '创建时间',
                align: 'center',
                formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '',
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    if (auth.hasAuth('${perm}:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row),
                        }))
                    }
                    if (auth.hasAuth('${perm}:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => handleDelete(row),
                        }))
                    }
                    return h('div', buttons)
                },
            },
        ],
    },
})

const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
}

const handleSelectionChange = (selection: ${entity}ListItem[]): void => {
    selectedRows.value = selection
}

const showDialog = (type: DialogType, row?: ${entity}ListItem): void => {
    dialogType.value = type
    currentRowData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

const handleDelete = (row: ${entity}ListItem): void => {
    ElMessageBox.confirm('确定要删除该记录吗？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(() => {
        fetchDelete${entity}(${pkDeleteArg(pk)}).then(() => refreshData())
    })
}

const handleBatchDelete = (): void => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的数据')
        return
    }
    ElMessageBox.confirm('确定要删除选中的记录吗？', '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(() => {
        const ids = ${pkArrayCast(pk)}
        fetchDelete${entity}(ids).then(() => refreshData())
    })
}
</script>
`;
};

export function renderSearchVue(ctx: AdminTemplateContext): string {
    const searchItems = ctx.schema.listQueryFields.map(searchFormField).join(',\n');
    return `<template>
    <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" @reset="handleReset" @search="handleSearch" />
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
    set: (val) => emit('update:modelValue', val),
})

const formItems = computed(() => [
${searchItems || `    // TODO: 添加搜索字段`}
])

function handleReset() {
    emit('reset')
}

async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
}
</script>
`;
};

export function renderDialogVue(ctx: AdminTemplateContext): string {
    const ns = toApiNamespace(ctx.group, ctx.name);
    const entity = toEntityName(ctx.name);
    const pk = ctx.schema.pkField;
    const formItems = [
        ...ctx.schema.formFields.filter((f) => f.name !== 'remark').map(dialogFormField),
        `    {
        label: '备注',
        key: 'remark',
        type: 'input',
        span: 24,
        props: { type: 'textarea', rows: 3, placeholder: '请输入备注' },
    }`,
    ].join(',\n');

    return `<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增${ctx.tag}' : '编辑${ctx.tag}'" width="600px"
        align-center @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="12" label-width="80px"
            :show-reset="false" :show-submit="false" />
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
import { fetchCreate${entity}, fetchUpdate${entity} } from '@/api/${ctx.group}/${ctx.name}'

interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.${ns}.${entity}ListItem>
}
interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
})
const dialogType = computed(() => props.type)
const loading = ref(false)
const formRef = ref()

const formData = reactive({
${formDataInit(ctx.schema.formFields, pk)}
})

const formItems = computed<FormItem[]>(() => [
${formItems}
])

${validationRules(ctx.schema.requiredFields)}

const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
${formDataReset(ctx.schema.formFields, pk)}
    })
}

watch(
    () => props.visible,
    (visible) => {
        if (visible) nextTick(() => initFormData())
    },
)

const handleSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            loading.value = true
            if (dialogType.value === 'add') {
                await fetchCreate${entity}(formData)
            } else {
                await fetchUpdate${entity}(formData)
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
`;
};

export function renderAdminPage(ctx: AdminTemplateContext): Record<string, string> {
    const typeFile = toTypeFileName(ctx.group, ctx.name);
    return {
        [`src/types/api/${typeFile}.d.ts`]: renderTypesDts(ctx),
        [`src/api/${ctx.group}/${ctx.name}.ts`]: renderApiTs(ctx),
        [`src/views/${ctx.group}/${ctx.name}/index.vue`]: renderIndexVue(ctx),
        [`src/views/${ctx.group}/${ctx.name}/modules/${ctx.name}-search.vue`]: renderSearchVue(ctx),
        [`src/views/${ctx.group}/${ctx.name}/modules/${ctx.name}-dialog.vue`]: renderDialogVue(ctx),
    };
};

export function slugFromGroupName(group: string, name: string): string {
    return `${group}-${name}`;
};

export function parseGroupNameArgs(argv: string[]): { group: string; name: string } | null {
    const positional = argv.filter((arg) => !arg.startsWith('--'));
    if (positional.length < 2) return null;
    return { group: positional[0], name: positional[1] };
};