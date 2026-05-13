<template>
    <div class="pay-debug-page art-full-height">
        <div class="pay-debug-hero">
            <div class="pay-debug-hero__inner">
                <h1 class="pay-debug-hero__title">支付调试</h1>
                <p class="pay-debug-hero__desc">
                    串联创建订单、发起支付、申请退款；需登录用户与订单归属一致。支付依赖商户在对应渠道下已启用的配置，否则接口会失败。
                </p>
                <ElSteps :active="activeStep" align-center finish-status="success" class="pay-debug-steps">
                    <ElStep title="创建订单" />
                    <ElStep title="发起支付" />
                    <ElStep title="申请退款" />
                </ElSteps>
            </div>
        </div>
        <ElRow :gutter="12" class="pay-debug-cards">
            <ElCol :xs="24" :md="8">
                <ElCard class="pay-debug-card" shadow="hover">
                    <template #header>
                        <div class="pay-debug-card__head">
                            <span class="pay-debug-card__badge">1</span>
                            <span>创建订单</span>
                        </div>
                    </template>
                    <p class="pay-debug-card__hint">调用后端模拟数据创建订单，返回订单号。</p>
                    <ElButton type="primary" :loading="loadingCreate" class="pay-debug-card__btn" @click="handleCreate">
                        创建订单
                    </ElButton>
                    <div v-if="lastOrderNo" class="pay-debug-result">
                        <div class="pay-debug-result__label">订单号</div>
                        <div class="pay-debug-result__value">{{ lastOrderNo }}</div>
                        <div class="pay-debug-result__actions">
                            <ElButton size="small" @click="copyText(lastOrderNo)">复制</ElButton>
                            <ElButton size="small" type="primary" plain @click="applyOrderNoToForms">填入下方表单</ElButton>
                        </div>
                    </div>
                </ElCard>
            </ElCol>
            <ElCol :xs="24" :md="8">
                <ElCard class="pay-debug-card" shadow="hover">
                    <template #header>
                        <div class="pay-debug-card__head">
                            <span class="pay-debug-card__badge">2</span>
                            <span>调试支付</span>
                        </div>
                    </template>
                    <ElForm label-position="top" class="pay-debug-form">
                        <ElFormItem label="订单号">
                            <ElInput v-model="payForm.orderNo" clearable placeholder="订单号" />
                        </ElFormItem>
                        <ElFormItem label="支付方式">
                            <ElSelect v-model="payForm.paymentMethod" placeholder="请选择" class="pay-debug-select">
                                <ElOption v-for="c in channels" :key="c" :label="channelLabels[c]" :value="c" />
                            </ElSelect>
                        </ElFormItem>
                        <ElFormItem label="终端">
                            <ElSelect v-model="payForm.platform" placeholder="请选择" class="pay-debug-select">
                                <ElOption v-for="p in platforms" :key="p" :label="platformLabels[p]" :value="p" />
                            </ElSelect>
                        </ElFormItem>
                    </ElForm>
                    <ElButton type="primary" :loading="loadingPay" class="pay-debug-card__btn" @click="handlePay">
                        发起支付
                    </ElButton>
                    <ElCollapse v-if="payResultJson" class="pay-debug-collapse">
                        <ElCollapseItem title="响应 JSON" name="pay">
                            <ElScrollbar max-height="min(100px, 18vh)" class="pay-debug-json-scroll">
                                <pre class="pay-debug-json">{{ payResultJson }}</pre>
                            </ElScrollbar>
                        </ElCollapseItem>
                    </ElCollapse>
                </ElCard>
            </ElCol>
            <ElCol :xs="24" :md="8">
                <ElCard class="pay-debug-card" shadow="hover">
                    <template #header>
                        <div class="pay-debug-card__head">
                            <span class="pay-debug-card__badge">3</span>
                            <span>调试退款</span>
                        </div>
                    </template>
                    <div class="pay-debug-inline">
                        <ElInput v-model="refundLookupOrderNo" clearable placeholder="订单号（拉取回填）" />
                        <ElButton :loading="loadingFill" @click="fillRefundFromOrderNo">拉取</ElButton>
                    </div>
                    <ElForm label-position="top" class="pay-debug-form">
                        <ElFormItem label="订单 ID">
                            <ElInputNumber v-model="refundForm.orderId" :min="1" :controls="true"
                                class="pay-debug-num" />
                        </ElFormItem>
                        <ElFormItem label="支付记录 ID">
                            <ElInputNumber v-model="refundForm.paymentId" :min="1" :controls="true"
                                class="pay-debug-num" />
                        </ElFormItem>
                        <ElFormItem label="退款金额">
                            <ElInputNumber v-model="refundForm.amount" :min="0.01" :precision="2" :step="0.01"
                                class="pay-debug-num" />
                        </ElFormItem>
                        <ElFormItem label="原因（可选）">
                            <ElInput v-model="refundForm.reason" type="textarea" :rows="1" placeholder="退款原因" />
                        </ElFormItem>
                    </ElForm>
                    <ElButton type="primary" :loading="loadingRefund" class="pay-debug-card__btn" @click="handleRefund">
                        提交退款
                    </ElButton>
                    <div v-if="lastRefundNo" class="pay-debug-result pay-debug-result--compact">
                        <div class="pay-debug-result__label">退款单号</div>
                        <div class="pay-debug-result__value">{{ lastRefundNo }}</div>
                        <ElButton size="small" @click="copyText(lastRefundNo)">复制</ElButton>
                    </div>
                </ElCard>
            </ElCol>
        </ElRow>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { fetchCreateOrders, fetchGetOrdersList } from '@/api/business/orders'
import { fetchPayOrder } from '@/api/business/payments'
import { fetchCreateRefund } from '@/api/business/refund'

defineOptions({ name: 'BusinessPayDebug' })

const channels = ['alipay', 'wechat', 'paypal'] as const
const platforms = ['app', 'h5', 'mini', 'pc'] as const

const channelLabels: Record<(typeof channels)[number], string> = {
    alipay: '支付宝',
    wechat: '微信',
    paypal: 'PayPal'
}

const platformLabels: Record<(typeof platforms)[number], string> = {
    app: 'App',
    h5: 'H5',
    mini: '小程序',
    pc: 'PC'
}

const loadingCreate = ref(false)
const loadingPay = ref(false)
const loadingRefund = ref(false)
const loadingFill = ref(false)

const lastOrderNo = ref('')
const lastRefundNo = ref('')
const payResultJson = ref('')

const activeStep = computed(() => {
    if (lastRefundNo.value) return 3
    if (payResultJson.value) return 2
    if (lastOrderNo.value) return 1
    return 0
})

const payForm = reactive({
    orderNo: '',
    paymentMethod: 'wechat' as Api.BusinessPayments.PayOrderBody['paymentMethod'],
    platform: 'h5' as Api.BusinessPayments.PayOrderBody['platform']
})

const refundLookupOrderNo = ref('')
const refundForm = reactive({
    orderId: undefined as number | undefined,
    paymentId: undefined as number | undefined,
    amount: undefined as number | undefined,
    reason: ''
})

async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('已复制')
    } catch {
        ElMessage.error('复制失败')
    }
}

function applyOrderNoToForms() {
    if (!lastOrderNo.value) return
    payForm.orderNo = lastOrderNo.value
    refundLookupOrderNo.value = lastOrderNo.value
    ElMessage.success('已同步订单号')
}

async function handleCreate() {
    loadingCreate.value = true
    try {
        const orderNo = await fetchCreateOrders()
        lastOrderNo.value = orderNo
        payForm.orderNo = orderNo
        refundLookupOrderNo.value = orderNo
    } finally {
        loadingCreate.value = false
    }
}

async function handlePay() {
    if (!payForm.orderNo?.trim()) {
        ElMessage.warning('请输入订单号')
        return
    }
    loadingPay.value = true
    payResultJson.value = ''
    try {
        const res = await fetchPayOrder({
            orderNo: payForm.orderNo.trim(),
            paymentMethod: payForm.paymentMethod,
            platform: payForm.platform
        })
        payResultJson.value = JSON.stringify(res, null, 2)
    } catch {
        /* request 已提示 */
    } finally {
        loadingPay.value = false
    }
}

async function fillRefundFromOrderNo() {
    const orderNo = refundLookupOrderNo.value?.trim()
    if (!orderNo) {
        ElMessage.warning('请输入订单号')
        return
    }
    loadingFill.value = true
    try {
        const page = await fetchGetOrdersList({
            orderNo,
            pageNum: 1,
            pageSize: 1
        })
        const list = (page as unknown as { list?: Api.BusinessOrders.OrdersListItem[] }).list
        const row = list?.[0]
        if (!row) {
            ElMessage.warning('未找到该订单')
            return
        }
        refundForm.orderId = row.id
        refundForm.amount = Number(row.amount)
        const pid = row.paymentSummary?.id
        if (pid == null) {
            ElMessage.warning('该订单暂无支付摘要，请确认已发起支付且列表已关联支付记录')
            refundForm.paymentId = undefined
        } else {
            refundForm.paymentId = pid
        }
    } finally {
        loadingFill.value = false
    }
}

async function handleRefund() {
    if (refundForm.orderId == null || refundForm.paymentId == null || refundForm.amount == null) {
        ElMessage.warning('请填写订单 ID、支付记录 ID 与退款金额')
        return
    }
    loadingRefund.value = true
    lastRefundNo.value = ''
    try {
        const no = await fetchCreateRefund({
            orderId: refundForm.orderId,
            paymentId: refundForm.paymentId,
            amount: refundForm.amount,
            reason: refundForm.reason || undefined
        })
        lastRefundNo.value = no
    } catch {
        /* request 已提示 */
    } finally {
        loadingRefund.value = false
    }
}
</script>

<style scoped lang="scss">
.pay-debug-page {
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-sizing: border-box;
    padding: 8px 8px 10px;
    overflow: hidden;
}

.pay-debug-hero {
    flex-shrink: 0;
    border-radius: 10px;
    padding: 1px;
    background: linear-gradient(120deg, var(--el-color-primary-light-5), var(--el-color-primary-light-7));
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.pay-debug-hero__inner {
    border-radius: 9px;
    padding: 10px 14px 8px;
    background: var(--el-bg-color);
}

.pay-debug-hero__title {
    margin: 0 0 4px;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--el-text-color-primary);
    line-height: 1.3;
}

.pay-debug-hero__desc {
    margin: 0 0 8px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--el-text-color-secondary);
    max-width: 100%;
}

.pay-debug-steps {
    max-width: 560px;
    margin: 0 auto;
}

.pay-debug-steps :deep(.el-step__title) {
    font-size: 12px;
    line-height: 1.2;
}

.pay-debug-steps :deep(.el-step__icon) {
    width: 22px;
    height: 22px;
    font-size: 12px;
}

.pay-debug-cards {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.pay-debug-cards :deep(.el-row) {
    height: 100%;
}

.pay-debug-cards :deep(.el-col) {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.pay-debug-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    border: 1px solid var(--el-border-color-lighter);
    overflow: hidden;
}

.pay-debug-card :deep(.el-card__header) {
    padding: 10px 14px;
}

.pay-debug-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 12px 14px 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.pay-debug-card__head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
}

.pay-debug-card__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
}

.pay-debug-card__hint {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
}

.pay-debug-card__btn {
    width: 100%;
    margin-bottom: 6px;
    flex-shrink: 0;
}

.pay-debug-form {
    margin-bottom: 4px;
    flex-shrink: 0;
}

.pay-debug-form :deep(.el-form-item) {
    margin-bottom: 8px;
}

.pay-debug-form :deep(.el-form-item__label) {
    margin-bottom: 2px !important;
    font-size: 12px;
    line-height: 1.2;
}

.pay-debug-select {
    width: 100%;
}

.pay-debug-num {
    width: 100%;
}

.pay-debug-num :deep(.el-input__wrapper) {
    width: 100%;
}

.pay-debug-inline {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-shrink: 0;
}

.pay-debug-inline .el-input {
    flex: 1;
}

.pay-debug-result {
    margin-top: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
}

.pay-debug-result--compact {
    margin-top: 6px;
}

.pay-debug-result__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
}

.pay-debug-result__value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    word-break: break-all;
    color: var(--el-text-color-primary);
    margin-bottom: 6px;
}

.pay-debug-result__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pay-debug-collapse {
    margin-top: 4px;
    border: none;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.pay-debug-collapse :deep(.el-collapse-item) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.pay-debug-collapse :deep(.el-collapse-item__wrap) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.pay-debug-collapse :deep(.el-collapse-item__content) {
    padding-bottom: 4px;
}

.pay-debug-collapse :deep(.el-collapse-item__header) {
    font-size: 12px;
    font-weight: 500;
    min-height: 32px;
    line-height: 32px;
    padding: 0 4px;
}

.pay-debug-json-scroll {
    flex-shrink: 0;
}

.pay-debug-json {
    margin: 0;
    padding: 4px 2px;
    font-size: 11px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--el-text-color-regular);
}
</style>
