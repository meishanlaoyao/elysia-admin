<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加接口' : '编辑接口'" width="500px" align-center
        @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="80px"
            :show-reset="false" :show-submit="false" />
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
import { useDictStore } from '@/store/modules/dict'
import { fetchCreateApi, fetchUpdateApi } from '@/api/system/api';

interface Props {
    visible: boolean
    type: string,
    data?: Partial<Api.SystemApi.ApiListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dictStore = useDictStore()
const { api_request_method } = dictStore.getDictData(['api_request_method'])

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})
const loading = ref(false)

const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref()

function getDefaultFormData() {
    return {
        apiId: undefined,
        apiName: '',
        apiPath: '',
        apiMethod: '',
        remark: '',
        status: true,
    }
}

// 表单数据
const formData = reactive(getDefaultFormData())

// 接口方法选项
const apiMethodOptions = computed(() => {
    return api_request_method.value.map(item => ({
        label: item.dictLabel,
        value: item.dictValue || ''
    }))
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '接口名称',
        key: 'apiName',
        type: 'input',
        props: { placeholder: '请输入接口名称' }
    },
    {
        label: '接口路径',
        key: 'apiPath',
        type: 'input',
        props: { placeholder: '请输入接口路径' }
    },
    {
        label: '接口方法',
        key: 'apiMethod',
        type: 'select',
        props: {
            placeholder: '请选择接口方法',
            options: apiMethodOptions.value
        }
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
        props: { type: 'textarea', rows: 4, placeholder: '请输入备注' }
    }
])

// 表单验证规则
const rules: FormRules = {
    apiName: [
        { required: true, message: '请输入接口名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    apiPath: [
        { required: true, message: '请输入接口路径', trigger: 'blur' },
    ],
    apiMethod: [
        { required: true, message: '请选择接口方法', trigger: 'change' }
    ],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data
    // 先重置为干净默认值，避免上次编辑字段（如 apiId、createTime）残留到新增请求
    Object.assign(formData, getDefaultFormData())
    delete (formData as Record<string, unknown>).createTime
    delete (formData as Record<string, unknown>).createBy
    delete (formData as Record<string, unknown>).updateTime
    delete (formData as Record<string, unknown>).updateBy
    delete (formData as Record<string, unknown>).delFlag
    if (isEdit && row) {
        Object.assign(formData, {
            apiId: row.apiId,
            apiName: row.apiName || '',
            apiPath: row.apiPath || '',
            apiMethod: row.apiMethod || '',
            remark: row.remark || '',
            status: row.status ?? true,
        })
    }
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据
 */
watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            nextTick(() => {
                initFormData()
            })
        }
    }
)

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            loading.value = true
            if (dialogType.value == 'add') {
                await fetchCreateApi(formData)
            } else {
                await fetchUpdateApi(formData)
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

/**
 * 对话框关闭后的回调
 */
const handleClosed = () => {
    formRef.value?.reset()
}
</script>

<style scoped lang='scss'></style>
