<template>
    <ElDialog v-model="dialogVisible" :title="title" width="500px" align-center @closed="handleClosed">
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
import { fetchCreateMerchant, fetchUpdateMerchant } from '@/api/business/merchant'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'

type MerchantListItem = Api.BusinessMerchant.MerchantListItem

interface Props {
    visible: boolean
    type: string
    data?: Partial<MerchantListItem>
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
const loading = ref(false)

const title = computed(() => (props.type === 'add' ? '新增商户' : '编辑商户'))

// 表单实例
const formRef = ref()

// 表单数据
const formData = ref<Partial<MerchantListItem>>()

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '商户名称',
        key: 'name',
        type: 'input',
        props: { placeholder: '请输入商户名称' }
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
        { required: true, message: '请输入商户名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
    loading.value = false
    const isEdit = props.type === 'edit' && props.data
    const row = props.data || {}
    if (isEdit) {
        formData.value = { ...row }
    } else {
        formData.value = {
            name: '',
            status: true,
            remark: ''
        }
    }
}

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate().then(async () => {
        try {
            loading.value = true
            if (props.type === 'add') {
                await fetchCreateMerchant(formData.value!)
            } else {
                await fetchUpdateMerchant(formData.value!)
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
</script>

<style scoped lang='scss'></style>