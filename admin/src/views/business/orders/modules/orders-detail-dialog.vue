<template>
    <ElDialog v-model="dialogVisible" title="订单详情" width="750px" align-center>
        <div v-loading="loading" class="dialog-content">
            <ElDescriptions :column="2" border label-width="100px">
                <ElDescriptionsItem label="订单号" :span="2">
                    {{ orderData?.orderNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="订单状态" :span="2">
                    <ElTag :type="dictStore.getTagType('system_orders_status', orderData?.status)">
                        {{ dictStore.getDictLabel('system_orders_status', orderData?.status) || '未知' }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="订单金额">
                    <span class="amount-text">
                        {{ orderData?.amount || '0.00' }} {{ orderData?.currency || 'CNY' }}
                    </span>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="支付方式">
                    <div class="flex items-center">
                        <ArtSvgIcon v-if="getPaymentDict(orderData?.paymentMethod)?.remark"
                            :icon="getPaymentDict(orderData?.paymentMethod)?.remark || ''"
                            :class="[getPaymentDict(orderData?.paymentMethod)?.customClass, 'mr-1']" />
                        <span>{{ dictStore.getDictLabel('system_pay_method', orderData?.paymentMethod) || '-' }}</span>
                    </div>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="用户ID">
                    {{ orderData?.userId || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="商户ID">
                    {{ orderData?.merchantId || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="创建时间">
                    {{ orderData?.createTime ? dayjs(orderData.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="超时时间">
                    {{ orderData?.expireTime ? dayjs(orderData.expireTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="订单标题" :span="2">
                    {{ orderData?.title || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="订单描述" :span="2">
                    {{ orderData?.description || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="扩展信息" :span="2">
                    <div class="json-text">{{ formatJson(orderData?.extra) }}</div>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="备注" :span="2">
                    {{ orderData?.remark || '-' }}
                </ElDescriptionsItem>
            </ElDescriptions>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="dialogVisible = false">关闭</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { ElTag, ElDescriptions, ElDescriptionsItem, vLoading } from 'element-plus'
import { useDictStore } from '@/store/modules/dict'
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue"
import { fetchGetOrdersDetail } from '@/api/business/orders'

const dictStore = useDictStore()

interface Props {
    visible: boolean
    id?: number
}

interface Emits {
    (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 对话框显示控制
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const orderData = ref<Api.BusinessOrders.OrdersListItem | null>(null)

/**
 * 获取详情
 */
const getDetail = async () => {
    if (!props.id) return
    loading.value = true
    try {
        const res = await fetchGetOrdersDetail(props.id)
        orderData.value = res
    } finally {
        loading.value = false
    }
}

// 监听显示状态
watch(() => props.visible, (val) => {
    if (val && props.id) {
        getDetail()
    } else {
        orderData.value = null
    }
})

/**
 * 获取支付方式字典项
 */
const getPaymentDict = (value?: string) => {
    if (!value) return null
    return dictStore.getDictItemByKey('system_pay_method', 'dictValue', value)
}

/**
 * 格式化JSON
 */
const formatJson = (json: any): string => {
    if (!json) return '-'
    if (typeof json === 'string') {
        try {
            return JSON.stringify(JSON.parse(json), null, 2)
        } catch (e) {
            return json
        }
    }
    return JSON.stringify(json, null, 2)
}
</script>

<style scoped lang="scss">
.dialog-content {
    margin-top: -20px;
    max-height: 60vh;
    overflow-y: auto;
    min-height: 200px;

    .amount-text {
        font-weight: bold;
        color: var(--el-color-primary);
    }

    .json-text {
        word-break: break-all;
        white-space: pre-wrap;
        line-height: 1.5;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        max-height: 200px;
        overflow-y: auto;
        background-color: var(--el-fill-color-light);
        padding: 8px;
        border-radius: 4px;
    }
}
</style>
