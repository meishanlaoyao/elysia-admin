<template>
    <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加黑名单' : '编辑黑名单'" width="500px" align-center
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
import { fetchCreateIpBlack, fetchUpdateIpBlack } from '@/api/system/ipblack'

interface Props {
    visible: boolean
    type: string
    data?: Partial<Api.SystemIpBlack.IpBlackItem>
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

const dialogType = computed(() => props.type)
const loading = ref(false)

// 表单实例
const formRef = ref()

// 表单数据
const formData = reactive({
    ipAddress: '',
    remark: '',
    status: true
})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: 'IP地址',
        key: 'ipAddress',
        type: 'input',
        props: {
            placeholder: '请输入IP地址',
            disabled: dialogType.value === 'edit'
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

// IP地址验证规则
const validateIP = (rule: any, value: any, callback: any) => {
    if (!value) {
        callback(new Error('请输入IP地址'))
        return
    }
    const ipPattern =
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(value)) {
        callback(new Error('请输入正确的IP地址格式'))
    } else {
        callback()
    }
}

// 表单验证规则
const rules: FormRules = {
    ipAddress: [
        { required: true, message: '请输入IP地址', trigger: 'blur' },
        { validator: validateIP, trigger: 'blur' }
    ]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    Object.assign(formData, {
        ...row,
        ipAddress: isEdit && row.ipAddress ? row.ipAddress || '' : '',
        remark: isEdit && row.remark ? row.remark || '' : '',
        status: isEdit ? row.status : true
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
            loading.value = true
            if (dialogType.value == 'add') {
                await fetchCreateIpBlack(formData)
            } else {
                await fetchUpdateIpBlack(formData)
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

<style scoped lang="scss"></style>
