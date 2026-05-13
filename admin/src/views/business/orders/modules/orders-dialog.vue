<template>
    <ElDialog v-model="dialogVisible" title="订单备注" width="480px" align-center @closed="handleClosed">
        <div class="remark-header">
            <span class="order-no-label">订单号：</span>
            <span class="order-no-value">{{ props.data?.orderNo || '-' }}</span>
        </div>
        <ElInput
            v-model="remarkValue"
            type="textarea"
            :rows="5"
            placeholder="请输入备注内容（最多 200 字）"
            maxlength="200"
            show-word-limit
        />
        <template #footer>
            <ElButton @click="dialogVisible = false">取消</ElButton>
            <ElButton type="primary" :loading="loading" @click="handleSubmit">保存</ElButton>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchUpdateOrders } from '@/api/business/orders'

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

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const remarkValue = ref('')

watch(() => props.visible, (val) => {
    if (val) {
        remarkValue.value = props.data?.remark ?? ''
    }
})

const handleSubmit = async () => {
    if (!props.data?.id) return
    loading.value = true
    try {
        await fetchUpdateOrders({ id: props.data.id, remark: remarkValue.value })
        ElMessage.success('备注已保存')
        emit('submit')
        dialogVisible.value = false
    } finally {
        loading.value = false
    }
}

const handleClosed = () => {
    remarkValue.value = ''
}
</script>

<style scoped lang="scss">
.remark-header {
    margin-bottom: 12px;
    font-size: 13px;

    .order-no-label {
        color: var(--el-text-color-secondary);
    }

    .order-no-value {
        font-family: 'Courier New', monospace;
        color: var(--el-text-color-primary);
        font-weight: 500;
    }
}
</style>
