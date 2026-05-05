<template>
    <ElDialog v-model="dialogVisible" title="支付记录详情" width="750px" align-center>
        <div v-loading="loading" class="dialog-content">
            <ElDescriptions :column="2" border label-width="100px">
                <ElDescriptionsItem label="支付订单号" :span="2">
                    {{ paymentData?.paymentNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="关联订单号" :span="2">
                    {{ paymentData?.orderNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="支付状态" :span="2">
                    <ElTag :type="dictStore.getTagType('system_pay_status', paymentData?.status)">
                        {{ dictStore.getDictLabel('system_pay_status', paymentData?.status) || '未知' }}
                    </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="支付金额">
                    <span class="amount-text">
                        {{ paymentData?.amount || '0.00' }}
                    </span>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="支付平台">
                    {{ dictStore.getDictLabel('system_pay_platform', paymentData?.platform) || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="支付方式">
                    {{ dictStore.getDictLabel('system_pay_method', paymentData?.paymentMethod) || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="第三方交易号">
                    {{ paymentData?.thirdTradeNo || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="创建时间">
                    {{ paymentData?.createTime ? dayjs(paymentData.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="商户配置ID">
                    {{ paymentData?.merchantConfigId || '-' }}
                </ElDescriptionsItem>
                <ElDescriptionsItem label="扩展信息" :span="2">
                    <div class="json-text">{{ formatJson(paymentData?.extra) }}</div>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="备注" :span="2">
                    {{ paymentData?.remark || '-' }}
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
import { fetchGetPaymentsDetail } from '@/api/business/payments'

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

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
})

const loading = ref(false)
const paymentData = ref<Api.BusinessPayments.PaymentsListItem | null>(null)

const getDetail = async () => {
    if (!props.id) return
    loading.value = true
    try {
        const res = await fetchGetPaymentsDetail(props.id)
        paymentData.value = res
    } finally {
        loading.value = false
    }
}

watch(() => props.visible, (val) => {
    if (val && props.id) {
        getDetail()
    } else {
        paymentData.value = null
    }
})

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