<template>
    <ElDialog v-model="dialogVisible" class="orders-detail-dialog" title="订单详情" width="880px" align-center
        :destroy-on-close="true">
        <div v-loading="loading" class="dialog-content">

            <!-- 顶部：与列表行一致的主次信息 + 状态标签组 -->
            <div class="detail-hero detail-surface">
                <div class="detail-hero__main">
                    <div class="detail-hero__order-line">
                        <span class="cell-order-no">{{ orderData?.orderNo || '-' }}</span>
                        <ElButton link type="primary" class="detail-hero__copy" @click="copyOrderNo">
                            <ElIcon :size="14">
                                <DocumentCopy />
                            </ElIcon>
                        </ElButton>
                    </div>
                    <div class="cell-sub">下单时间：{{ fmt(orderData?.createTime) }}</div>
                </div>
                <div class="detail-hero__tags">
                    <ElTag :type="dictStore.getTagType('system_orders_status', orderData?.status)" size="small">
                        {{ dictStore.getDictLabel('system_orders_status', orderData?.status) || '未知' }}
                    </ElTag>
                    <ElTag v-if="orderData?.paymentSummary"
                        :type="dictStore.getTagType('system_pay_status', orderData.paymentSummary.status)" size="small">
                        {{ dictStore.getDictLabel('system_pay_status', orderData.paymentSummary.status) || '-' }}
                    </ElTag>
                    <ElTag v-else type="info" size="small">未支付</ElTag>
                    <ElTag v-if="orderData?.refundSummary"
                        :type="dictStore.getTagType('system_refund_status', orderData.refundSummary.status)"
                        size="small">
                        {{ dictStore.getDictLabel('system_refund_status', orderData.refundSummary.status) || '退款中' }}
                    </ElTag>
                    <ElTag v-else type="info" size="small" effect="plain">无退款</ElTag>
                </div>
            </div>

            <!-- 订单基础 & 买家收货 -->
            <div class="section-head">
                <span class="section-head__bar" />
                <span class="section-head__text">订单与收货</span>
            </div>
            <div class="info-row">
                <div class="detail-surface info-col">
                    <ElDescriptions class="detail-desc" :column="1" :border="false" label-width="88px" size="small">
                        <ElDescriptionsItem label="订单标题">{{ orderData?.title || '-' }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="订单金额">
                            <span class="cell-amount">¥{{ fmtAmount(orderData?.amount) }}</span>
                            <span class="cell-sub inline-gap">{{ orderData?.currency || 'CNY' }}</span>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="订单描述">{{ orderData?.description || '-' }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="过期时间">{{ fmt(orderData?.expireTime) }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="备注">{{ orderData?.remark || '-' }}</ElDescriptionsItem>
                    </ElDescriptions>
                </div>

                <div class="detail-surface buyer-col">
                    <div class="buyer-top">
                        <ElAvatar :size="44" :src="extraUser?.avatar || ''" class="buyer-avatar">
                            {{ (extraUser?.nickname || '?').charAt(0) }}
                        </ElAvatar>
                        <div class="buyer-text">
                            <div class="cell-title">{{ extraUser?.nickname || '-' }} / {{ extraUser?.phone || '-' }}
                            </div>
                            <div class="cell-sub">ID: {{ orderData?.userId || '-' }}</div>
                        </div>
                    </div>
                    <ElDescriptions class="detail-desc detail-desc--tight" :column="1" :border="false"
                        label-width="76px" size="small">
                        <ElDescriptionsItem label="收货地址">
                            <ElTooltip :content="extraUser?.address" placement="top" :disabled="!extraUser?.address">
                                <span class="address-line cell-sub">{{ extraUser?.address || '-' }}</span>
                            </ElTooltip>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="邮政编码">{{ extraUser?.postalCode || '-' }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="收货手机">{{ extraUser?.phone || '-' }}</ElDescriptionsItem>
                    </ElDescriptions>
                </div>
            </div>

            <!-- 商品明细 -->
            <div class="section-head">
                <span class="section-head__bar" />
                <span class="section-head__text">商品明细</span>
            </div>
            <div class="detail-surface products-wrap">
                <div v-if="extraProducts.length === 0" class="empty-state">暂无商品信息</div>
                <template v-else>
                    <div v-for="(product, index) in extraProducts" :key="index" class="product-row">
                        <ElImage :src="product.image || ''" fit="cover" class="product-img">
                            <template #error>
                                <div class="product-img-error">
                                    <ElIcon :size="18">
                                        <Goods />
                                    </ElIcon>
                                </div>
                            </template>
                        </ElImage>
                        <div class="product-main">
                            <div class="cell-title cell-ellipsis">{{ product.productName || '-' }}</div>
                            <div class="cell-sub cell-ellipsis">{{ product.specs || '' }}</div>
                        </div>
                        <div class="product-price-block cell-sub">
                            <span>¥{{ fmtAmount(product.productPrice) }}</span>
                            <span class="price-sep"> × </span>
                            <span>{{ product.productNum || 1 }}</span>
                        </div>
                        <div class="product-subtotal cell-amount">¥{{ fmtAmount(product.productTotal) }}</div>
                    </div>
                    <div class="product-footer">
                        <template v-if="extraMarketing?.discountAmount && extraMarketing.discountAmount > 0">
                            <span class="footer-item cell-sub">
                                优惠：{{ extraMarketing.couponName || '优惠券' }}
                                <span class="discount-val">-¥{{ fmtAmount(extraMarketing.discountAmount) }}</span>
                            </span>
                        </template>
                        <span class="footer-total">
                            <span class="cell-sub">合计</span>
                            <strong class="cell-amount">¥{{ fmtAmount(orderData?.amount) }}</strong>
                            <span class="cell-sub inline-gap">{{ orderData?.currency || 'CNY' }}</span>
                        </span>
                    </div>
                </template>
            </div>

            <!-- 支付信息 -->
            <div class="section-head">
                <span class="section-head__bar" />
                <span class="section-head__text">支付信息</span>
            </div>
            <template v-if="payments.length > 0">
                <div v-for="payment in payments" :key="payment.id" class="detail-surface section-block payment-detail">
                    <!-- 金额 + 状态 醒目头部 -->
                    <div class="payment-hero">
                        <div class="payment-hero__amount">
                            <span class="cell-sub">实付金额</span>
                            <span class="cell-amount">¥{{ fmtAmount(payment.amount) }}</span>
                        </div>
                        <ElTag :type="dictStore.getTagType('system_pay_status', payment.status)" size="small">
                            {{ dictStore.getDictLabel('system_pay_status', payment.status) || '-' }}
                        </ElTag>
                    </div>
                    <!-- 方式 / 平台 / 时间 三列网格 -->
                    <div class="payment-grid">
                        <div class="payment-grid__item">
                            <span class="cell-sub">支付方式</span>
                            <div class="pay-method-cell">
                                <ArtSvgIcon v-if="getPayDict(payment.paymentMethod)?.remark"
                                    class="pay-method-cell__icon" :icon="getPayDict(payment.paymentMethod)!.remark!"
                                    :class="getPayDict(payment.paymentMethod)?.customClass" />
                                <span class="pay-method-cell__text">{{
                                    dictStore.getDictLabel('system_pay_method', payment.paymentMethod) || '-'
                                }}</span>
                            </div>
                        </div>
                        <div class="payment-grid__item">
                            <span class="cell-sub">支付平台</span>
                            <span class="cell-title">{{ payment.platform || '-' }}</span>
                        </div>
                        <div class="payment-grid__item">
                            <span class="cell-sub">支付时间</span>
                            <span class="cell-title">{{ payment.status === '1' ? fmt(payment.updateTime) : '-' }}</span>
                        </div>
                    </div>
                    <!-- 单号区 -->
                    <div class="payment-nos">
                        <div class="payment-nos__item">
                            <span class="cell-sub">支付单号</span>
                            <span class="mono-text payment-nos__val">{{ payment.paymentNo || '-' }}</span>
                        </div>
                        <div v-if="payment.thirdTradeNo" class="payment-nos__item">
                            <span class="cell-sub">第三方单号</span>
                            <span class="mono-text payment-nos__val">{{ payment.thirdTradeNo }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="detail-surface empty-state">暂未发起支付</div>

            <!-- 退款信息 -->
            <div class="section-head">
                <span class="section-head__bar" />
                <span class="section-head__text">退款信息</span>
            </div>
            <template v-if="refunds.length > 0">
                <div v-for="refund in refunds" :key="refund.id" class="detail-surface section-block">
                    <ElDescriptions class="detail-desc" :column="1" :border="false" label-width="88px" size="small">
                        <ElDescriptionsItem label="退款单号">
                            <span class="mono-text">{{ refund.refundNo || '-' }}</span>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="退款金额">
                            <span class="cell-amount cell-amount--sm">¥{{ fmtAmount(refund.amount) }}</span>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="退款状态">
                            <ElTag :type="dictStore.getTagType('system_refund_status', refund.status)" size="small">
                                {{ dictStore.getDictLabel('system_refund_status', refund.status) || '-' }}
                            </ElTag>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem label="申请时间">{{ fmt(refund.extra?.applyTime) }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="处理时间">{{ fmt(refund.extra?.processTime) }}</ElDescriptionsItem>
                        <ElDescriptionsItem label="申请原因">
                            <span class="detail-reason-text">{{ refund.extra?.reason || '-' }}</span>
                        </ElDescriptionsItem>
                        <ElDescriptionsItem v-if="refund.thirdRefundNo" label="第三方退款号">
                            <span class="mono-text">{{ refund.thirdRefundNo }}</span>
                        </ElDescriptionsItem>
                    </ElDescriptions>
                </div>
            </template>
            <div v-else class="detail-surface empty-state">暂无退款申请</div>

        </div>
        <template #footer>
            <ElButton @click="dialogVisible = false">关闭</ElButton>
        </template>
    </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElIcon } from 'element-plus'
import { DocumentCopy, Goods } from '@element-plus/icons-vue'
import { useDictStore } from '@/store/modules/dict'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import { fetchGetOrdersDetail } from '@/api/business/orders'

type OrderDetail = Api.BusinessOrders.OrdersListItem
type PaymentRecord = Api.BusinessOrders.PaymentRecord
type RefundRecord = Api.BusinessOrders.RefundRecord

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
    set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const orderData = ref<OrderDetail | null>(null)

const extraUser = computed(() => (orderData.value?.extra as any)?.user ?? null)
const extraProducts = computed(() => (orderData.value?.extra as any)?.products ?? [])
const extraMarketing = computed(() => (orderData.value?.extra as any)?.marketing ?? null)
const payments = computed<PaymentRecord[]>(() => (orderData.value as any)?.payments ?? [])
const refunds = computed<RefundRecord[]>(() => (orderData.value as any)?.refunds ?? [])

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

watch(() => props.visible, (val) => {
    if (val && props.id) getDetail()
    else orderData.value = null
})

const copyOrderNo = () => {
    if (!orderData.value?.orderNo) return
    navigator.clipboard.writeText(orderData.value.orderNo)
    ElMessage.success('订单号已复制')
}

const getPayDict = (value?: string) => {
    if (!value) return null
    return dictStore.getDictItemByKey('system_pay_method', 'dictValue', value)
}

const fmt = (time?: Date | string | null) => {
    if (!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const fmtAmount = (val?: number | string | null) => {
    if (val == null) return '0.00'
    return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped lang="scss">
// 与列表页 orders-cell 层次一致：主文案 13px、次文案 12px、金额加粗、缩略图 44px

.dialog-content {
    max-height: 70vh;
    margin: -6px -4px 0;
    padding: 0 4px 4px 0;
    overflow-x: hidden;
    overflow-y: auto;
}

.detail-surface {
    min-width: 0;
    padding: 12px 14px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
}

.detail-hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;

    &__main {
        flex: 1;
        min-width: 200px;
    }

    &__order-line {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-bottom: 5px;
    }

    &__copy {
        padding: 2px 4px;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        max-width: 100%;
    }
}

.cell-order-no {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.02em;
}

.cell-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    line-height: 1.85;
}

.cell-sub {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.7;
}

.cell-amount {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &--sm {
        font-size: 14px;
    }
}

.cell-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.inline-gap {
    margin-left: 6px;
}

.section-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 18px 0 10px;

    &:first-of-type {
        margin-top: 2px;
    }

    &__bar {
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: var(--el-color-primary);
    }

    &__text {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        letter-spacing: 0.02em;
    }
}

.info-row {
    display: grid;
    // 默认 min 为 auto，长地址会把整列撑开并表现为换行；允许列收缩到 0 才能单行省略
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
    margin-bottom: 2px;

    .info-col {
        min-width: 0;
    }

    .buyer-col {
        min-width: 0;

        .buyer-top {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: 1px solid var(--el-border-color-extra-light);
        }

        .buyer-avatar {
            flex-shrink: 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-7);
        }

        .buyer-text {
            flex: 1;
            min-width: 0;
        }

        :deep(.el-descriptions__cell) {
            display: flex;
            align-items: baseline;
        }

        :deep(.el-descriptions__label) {
            flex-shrink: 0;
        }

        :deep(.el-descriptions__content) {
            flex: 1;
            min-width: 0;
            overflow: hidden;
        }

        .address-line {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.products-wrap {
    padding-bottom: 10px;
}

.product-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    margin-bottom: 8px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-extra-light);
    border-radius: 6px;

    &:last-of-type {
        margin-bottom: 0;
    }

    .product-img {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        overflow: hidden;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        background: var(--el-fill-color-light);
    }

    .product-img-error {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: var(--el-text-color-placeholder);
    }

    .product-main {
        flex: 1;
        min-width: 0;
    }

    .product-price-block {
        flex-shrink: 0;
        white-space: nowrap;
    }

    .product-subtotal {
        flex-shrink: 0;
        min-width: 88px;
        text-align: right;
    }
}

.product-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 12px 20px;
    padding: 12px 4px 2px;
    margin-top: 4px;
    border-top: 1px dashed var(--el-border-color-lighter);

    .discount-val {
        margin-left: 4px;
        font-weight: 600;
        color: var(--el-color-success);
    }

    .footer-total {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 6px;
    }
}

.section-block {
    margin-bottom: 10px;

    &:last-child {
        margin-bottom: 0;
    }
}

.payment-detail {
    min-width: 0;
}

.payment-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &__amount {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }
}

.payment-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 12px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &__item {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }
}

.payment-nos {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 12px;

    &__item {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }

    &__val {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 2px 6px;
        background: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-extra-light);
        border-radius: 4px;
        font-size: 11px;
        color: var(--el-text-color-regular);
        vertical-align: middle;
    }
}

.detail-reason-text {
    display: block;
    white-space: pre-wrap;
    word-break: break-word;
}

.detail-desc {
    :deep(.el-descriptions__body) {
        background: transparent;
    }

    :deep(.el-descriptions__label) {
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
        font-size: 12px;
        font-weight: 400;
        color: var(--el-text-color-secondary);
    }

    :deep(.el-descriptions__content) {
        font-size: 13px;
        color: var(--el-text-color-primary);
        line-height: 1.75;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    :deep(.el-descriptions__cell) {
        padding-bottom: 8px;
    }

    :deep(tr:last-child .el-descriptions__cell) {
        padding-bottom: 0;
    }

    &--tight {
        :deep(.el-descriptions__cell) {
            padding-bottom: 6px;
        }
    }
}

.pay-method-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    flex-wrap: nowrap;
    word-break: normal;
    overflow-wrap: normal;

    &__icon {
        flex-shrink: 0;
    }

    &__text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.empty-state {
    padding: 20px 12px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
}

.mono-text {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 12px;
    word-break: break-all;
}

.price-sep {
    padding: 0 2px;
    opacity: 0.65;
}
</style>
