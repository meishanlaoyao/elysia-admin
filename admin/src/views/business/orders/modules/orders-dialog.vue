<template>
    <ElDialog v-model="dialogVisible" title="编辑订单" width="550px" align-center @closed="handleClosed">
        <ArtForm ref="formRef" v-model="formData" :items="formItems" :rules="rules" :span="24" label-width="100px"
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
import { ref, computed, watch } from 'vue'
import { fetchUpdateOrders } from '@/api/business/orders'
import ArtForm from '@/components/core/forms/art-form/index.vue'
import type { FormRules } from 'element-plus'
import type { FormItem } from '@/components/core/forms/art-form/index.vue'
import { useDictStore } from '@/store/modules/dict'
import { ElMessage } from 'element-plus'

type OrdersListItem = Api.BusinessOrders.OrdersListItem

interface Props {
    visible: boolean
    data?: Partial<OrdersListItem>
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dictStore = useDictStore()
const { system_orders_status } = dictStore.getDictData(['system_orders_status'])

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})
const loading = ref(false)

// 表单实例
const formRef = ref()

// 表单数据
const formData = ref<Partial<OrdersListItem>>({})

// 表单项配置
const formItems = computed<FormItem[]>(() => [
    {
        label: '订单号',
        key: 'orderNo',
        type: 'input',
        props: { disabled: true }
    },
    {
        label: '订单标题',
        key: 'title',
        type: 'input',
        props: { disabled: true }
    },
    {
        label: '订单金额',
        key: 'amount',
        type: 'input',
        props: { disabled: true }
    },
    {
        label: '订单状态',
        key: 'status',
        type: 'select',
        props: {
            options: system_orders_status.value?.map(item => ({
                label: item.dictLabel,
                value: item.dictValue
            })) || []
        }
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
    status: [
        { required: true, message: '请选择订单状态', trigger: 'change' }
    ],
}

/**
 * 初始化表单数据
 */
const initFormData = () => {
    loading.value = false
    if (props.data) {
        formData.value = { ...props.data }
    }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
    await formRef.value.validate()
    loading.value = true
    try {
        await fetchUpdateOrders(formData.value!)
        ElMessage.success('操作成功')
        emit('submit')
        dialogVisible.value = false
    } finally {
        loading.value = false
    }
}

/**
 * 对话框关闭回调
 */
const handleClosed = () => {
    formRef.value?.resetFields()
}

// 监听 visible 变化，初始化数据
watch(() => props.visible, (val) => {
    if (val) {
        initFormData()
    }
})
</script>

<style scoped lang='scss'></style>
