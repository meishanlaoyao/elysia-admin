<template>
    <ElDialog v-model="dialogVisible" :title="title" width="600px" align-center @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="100px"
            :show-reset="false" :show-submit="false" />
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">取消</ElButton>
                <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { fetchCreateStorage, fetchUpdateStorage } from '@/api/system/storage'
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import ArtForm from '@/components/core/forms/art-form/index.vue'

type StorageListItem = Api.SystemStorage.StorageListItem

interface Props {
    visible: boolean
    type: string
    data?: Partial<StorageListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const title = computed(() => (props.type === 'add' ? '新增存储配置' : '编辑存储配置'))

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    name: '',
    endpoint: '',
    bucket: '',
    accessKey: '',
    secretKey: '',
    status: true,
    remark: '',
    region: '',
    stsDuration: 1800
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '存储名称',
        key: 'name',
        type: 'input',
        props: { placeholder: '请输入存储名称' }
    },
    {
        label: '区域',
        key: 'region',
        type: 'input',
        props: { placeholder: '请输入区域，如：us-east-1' }
    },
    {
        label: '端点地址',
        key: 'endpoint',
        type: 'input',
        props: { placeholder: '请输入端点地址，如：https://s3.amazonaws.com' }
    },
    {
        label: '存储桶',
        key: 'bucket',
        type: 'input',
        props: { placeholder: '请输入存储桶名称' }
    },
    {
        label: 'Access Key',
        key: 'accessKey',
        type: 'input',
        props: { placeholder: '请输入Access Key' }
    },
    {
        label: 'Secret Key',
        key: 'secretKey',
        type: 'input',
        props: {
            type: 'password',
            showPassword: true,
            placeholder: '请输入Secret Key'
        }
    },
    {
        label: 'STS持续时间',
        key: 'stsDuration',
        type: 'number',
        props: { placeholder: '请输入STS持续时间，单位秒' }
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
        props: { type: 'textarea', rows: 3, placeholder: '请输入备注' }
    }
])

// 表单验证规则
const rules: FormRules = {
    name: [
        { required: true, message: '请输入存储名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    endpoint: [
        { required: true, message: '请输入端点地址', trigger: 'blur' }
    ],
    bucket: [
        { required: true, message: '请输入存储桶名称', trigger: 'blur' }
    ],
    accessKey: [
        { required: true, message: '请输入Access Key', trigger: 'blur' }
    ],
    secretKey: [
        { required: true, message: '请输入Secret Key', trigger: 'blur' }
    ]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
        ...row,
        name: isEdit && row.name ? row.name || '' : '',
        endpoint: isEdit && row.endpoint ? row.endpoint || '' : '',
        bucket: isEdit && row.bucket ? row.bucket || '' : '',
        accessKey: isEdit && row.accessKey ? row.accessKey || '' : '',
        secretKey: isEdit && row.secretKey ? row.secretKey || '' : '',
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true,
        region: isEdit && row.region ? row.region || '' : '',
        stsDuration: isEdit && row.stsDuration ? row.stsDuration || 1800 : 1800
    })
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
            if (props.type === 'add') {
                await fetchCreateStorage(formData as StorageListItem)
            } else {
                await fetchUpdateStorage(formData as StorageListItem)
            }
            emit('submit')
            dialogVisible.value = false
        }
        catch { }
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
