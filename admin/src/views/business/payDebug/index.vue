<template>
    <div class="pay-debug-page art-full-height">
        <!-- Hero -->
        <header class="pay-hero">
            <div class="pay-hero__aurora" aria-hidden="true">
                <span class="blob blob-a" />
                <span class="blob blob-b" />
                <span class="blob blob-c" />
            </div>
            <div class="pay-hero__content">
                <div class="pay-hero__left">
                    <div class="pay-hero__eyebrow">
                        <ArtSvgIcon icon="ri:flashlight-line" />
                        <span>PAYMENT PIPELINE</span>
                    </div>
                    <h1 class="pay-hero__title">支付调试控制台</h1>
                    <p class="pay-hero__desc">
                        串联创建订单 → 发起支付 →
                        申请退款。需登录用户与订单归属一致；支付依赖商户在对应渠道下已启用的配置。
                    </p>
                </div>
                <div class="pay-hero__right">
                    <div class="pay-hero__metric">
                        <span class="pay-hero__metric-label">流程进度</span>
                        <div class="pay-hero__metric-value">
                            <ArtCountTo :target="activeStep" :duration="600" />
                            <span class="pay-hero__metric-total">/ 3</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress track -->
            <div class="pay-track">
                <div class="pay-track__rail">
                    <div class="pay-track__fill" :style="{ transform: `scaleX(${progressRatio})` }" />
                </div>
                <div v-for="(node, i) in trackNodes" :key="node.key" class="pay-track__node" :class="{
                    'is-done': activeStep > i,
                    'is-active': activeStep === i,
                    'is-pending': activeStep < i
                }">
                    <div class="pay-track__dot">
                        <ArtSvgIcon v-if="activeStep > i" icon="ri:check-line" class="pay-track__check" />
                        <span v-else>{{ i + 1 }}</span>
                        <span v-if="activeStep === i" class="pay-track__ping" />
                    </div>
                    <span class="pay-track__label">{{ node.label }}</span>
                </div>
            </div>
        </header>

        <!-- Stages -->
        <div class="pay-stages">
            <!-- Stage 1: Create Order -->
            <StageCard :step="1" title="创建订单" desc="调用后端模拟数据创建订单，返回订单号" :state="stageStates[0]" :index="0">
                <div class="stage-panel">
                    <div class="stage-illus">
                        <div class="stage-illus__ring">
                            <ArtSvgIcon icon="ri:file-list-3-line" class="stage-illus__icon" />
                        </div>
                        <p class="stage-illus__tip">一键生成调试订单，自动同步至后续步骤</p>
                    </div>
                    <button type="button" class="pay-btn" :class="{ 'is-loading': loadingCreate }"
                        :disabled="loadingCreate" @click="handleCreate">
                        <span class="pay-btn__shine" />
                        <ArtSvgIcon :icon="loadingCreate ? 'ri:loader-4-line' : 'ri:add-circle-line'"
                            :class="{ 'is-spin': loadingCreate }" />
                        <span>{{ loadingCreate ? '创建中…' : '创建订单' }}</span>
                    </button>
                    <Transition name="slip">
                        <ResultSlip v-if="lastOrderNo" label="订单号" :value="lastOrderNo" tone="success">
                            <template #actions>
                                <ElButton size="small" type="primary" plain @click="applyOrderNoToForms">
                                    <ArtSvgIcon icon="ri:share-forward-line" class="mr-1" />
                                    填入下方表单
                                </ElButton>
                            </template>
                        </ResultSlip>
                    </Transition>
                </div>
            </StageCard>

            <!-- Stage 2: Pay -->
            <StageCard :step="2" title="发起支付" desc="选择渠道与终端，发起真实支付请求" :state="stageStates[1]" :index="1">
                <div class="stage-panel">
                    <div class="field">
                        <label class="field__label">订单号</label>
                        <ElInput v-model="payForm.orderNo" clearable placeholder="请输入或从上方同步" />
                    </div>

                    <div class="field">
                        <label class="field__label">支付方式</label>
                        <div class="channel-grid">
                            <button v-for="c in channelOptions" :key="c.value" type="button" class="channel-tile"
                                :class="[`is-${c.value}`, { 'is-active': payForm.paymentMethod === c.value }]"
                                @click="payForm.paymentMethod = c.value">
                                <ArtSvgIcon :icon="c.icon" class="channel-tile__icon" />
                                <span class="channel-tile__name">{{ c.label }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label">终端</label>
                        <div class="seg-control"
                            :style="{ '--seg-index': platformIndex, '--seg-count': platforms.length }">
                            <span class="seg-control__thumb" />
                            <button v-for="p in platformOptions" :key="p.value" type="button" class="seg-control__item"
                                :class="{ 'is-active': payForm.platform === p.value }"
                                @click="payForm.platform = p.value">
                                {{ p.label }}
                            </button>
                        </div>
                    </div>

                    <button type="button" class="pay-btn" :class="{ 'is-loading': loadingPay }" :disabled="loadingPay"
                        @click="handlePay">
                        <span class="pay-btn__shine" />
                        <ArtSvgIcon :icon="loadingPay ? 'ri:loader-4-line' : 'ri:secure-payment-line'"
                            :class="{ 'is-spin': loadingPay }" />
                        <span>{{ loadingPay ? '支付中…' : '发起支付' }}</span>
                    </button>

                    <Transition name="slip">
                        <div v-if="payResult" class="pay-result-block">
                            <div class="pay-result-fields">
                                <div class="pay-result-field">
                                    <span class="pay-result-field__label">支付单号</span>
                                    <span class="pay-result-field__value">{{ payResult.paymentNo || '—' }}</span>
                                </div>
                                <div class="pay-result-field">
                                    <span class="pay-result-field__label">三方流水</span>
                                    <span class="pay-result-field__value">{{ payResult.thirdTradeNo || '—' }}</span>
                                </div>
                            </div>
                            <JsonConsole v-if="payResultJson" :content="payResultJson" title="payload.json" />
                        </div>
                    </Transition>
                </div>
            </StageCard>

            <!-- Stage 3: Refund -->
            <StageCard :step="3" title="申请退款" desc="按订单号拉取回填，提交退款申请" :state="stageStates[2]" :index="2">
                <div class="stage-panel">
                    <div class="lookup-row">
                        <ElInput v-model="refundLookupOrderNo" clearable placeholder="订单号（拉取回填）" />
                        <ElButton :loading="loadingFill" @click="fillRefundFromOrderNo">
                            <ArtSvgIcon v-if="!loadingFill" icon="ri:download-2-line" class="mr-1" />
                            拉取
                        </ElButton>
                    </div>

                    <div class="field-grid">
                        <div class="field">
                            <label class="field__label">订单 ID</label>
                            <ElInputNumber v-model="refundForm.orderId" :min="1" :controls="true" class="field-num" />
                        </div>
                        <div class="field">
                            <label class="field__label">支付记录 ID</label>
                            <ElInputNumber v-model="refundForm.paymentId" :min="1" :controls="true" class="field-num" />
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label">退款金额</label>
                        <ElInputNumber v-model="refundForm.amount" :min="0.01" :precision="2" :step="0.01"
                            class="field-num" />
                    </div>

                    <div class="field">
                        <label class="field__label">原因（可选）</label>
                        <ElInput v-model="refundForm.reason" type="textarea" :rows="2" placeholder="退款原因" />
                    </div>

                    <button type="button" class="pay-btn pay-btn--warn" :class="{ 'is-loading': loadingRefund }"
                        :disabled="loadingRefund" @click="handleRefund">
                        <span class="pay-btn__shine" />
                        <ArtSvgIcon :icon="loadingRefund ? 'ri:loader-4-line' : 'ri:refund-2-line'"
                            :class="{ 'is-spin': loadingRefund }" />
                        <span>{{ loadingRefund ? '提交中…' : '提交退款' }}</span>
                    </button>

                    <Transition name="slip">
                        <ResultSlip v-if="lastRefundNo" label="退款单号" :value="lastRefundNo" tone="success" />
                    </Transition>
                </div>
            </StageCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { fetchCreateOrders, fetchGetOrdersList } from '@/api/business/orders'
import { fetchPayOrder } from '@/api/business/payments'
import { fetchCreateRefund } from '@/api/business/refund'
import StageCard from './modules/stage-card.vue'
import ResultSlip from './modules/result-slip.vue'
import JsonConsole from './modules/json-console.vue'

defineOptions({ name: 'BusinessPayDebug' })

type Channel = Api.BusinessPayments.PayOrderBody['paymentMethod']
type Platform = Api.BusinessPayments.PayOrderBody['platform']
type StageState = 'todo' | 'active' | 'done'

const platforms = ['app', 'h5', 'mini', 'pc'] as const

const channelOptions: { value: Channel; label: string; icon: string }[] = [
    { value: 'alipay', label: '支付宝', icon: 'ri:alipay-fill' },
    { value: 'wechat', label: '微信', icon: 'ri:wechat-pay-fill' },
    { value: 'paypal', label: 'PayPal', icon: 'ri:paypal-fill' }
]

const platformOptions: { value: Platform; label: string }[] = [
    { value: 'app', label: 'App' },
    { value: 'h5', label: 'H5' },
    { value: 'mini', label: '小程序' },
    { value: 'pc', label: 'PC' }
]

const trackNodes = [
    { key: 'order', label: '创建订单' },
    { key: 'pay', label: '发起支付' },
    { key: 'refund', label: '申请退款' }
]

const loadingCreate = ref(false)
const loadingPay = ref(false)
const loadingRefund = ref(false)
const loadingFill = ref(false)

const lastOrderNo = ref('')
const lastRefundNo = ref('')
const payResultJson = ref('')
const payResult = ref<Api.BusinessPayments.PayOrderResult | null>(null)

const activeStep = computed(() => {
    if (lastRefundNo.value) return 3
    if (payResultJson.value) return 2
    if (lastOrderNo.value) return 1
    return 0
})

const progressRatio = computed(() => activeStep.value / 3)

const stageStates = computed<StageState[]>(() => {
    const step = activeStep.value
    return [0, 1, 2].map((i) => {
        if (step > i) return 'done'
        if (step === i) return 'active'
        return 'todo'
    })
})

const payForm = reactive({
    orderNo: '',
    paymentMethod: 'wechat' as Channel,
    platform: 'h5' as Platform
})

const platformIndex = computed(() => platforms.indexOf(payForm.platform))

const refundLookupOrderNo = ref('')
const refundForm = reactive({
    orderId: undefined as number | undefined,
    paymentId: undefined as number | undefined,
    amount: undefined as number | undefined,
    reason: ''
})

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
    payResult.value = null
    try {
        const res = await fetchPayOrder({
            orderNo: payForm.orderNo.trim(),
            paymentMethod: payForm.paymentMethod,
            platform: payForm.platform
        })
        payResult.value = res
        payResultJson.value = JSON.stringify(res.payload ?? res, null, 2)
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
    gap: 14px;
    box-sizing: border-box;
    padding: 10px 10px 12px;
    overflow: hidden;
}

/* ─── Hero ─── */
.pay-hero {
    position: relative;
    flex-shrink: 0;
    border-radius: calc(var(--custom-radius) + 6px);
    padding: 20px 22px 18px;
    overflow: hidden;
    background: var(--default-box-color);
    border: 1px solid var(--art-card-border);
    isolation: isolate;
}

.pay-hero__aurora {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;

    .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(48px);
        opacity: 0.55;
        will-change: transform;
        animation: aurora-drift 18s ease-in-out infinite alternate;
    }

    .blob-a {
        width: 280px;
        height: 280px;
        top: -80px;
        left: -40px;
        background: color-mix(in srgb, var(--el-color-primary) 45%, transparent);
    }

    .blob-b {
        width: 220px;
        height: 220px;
        top: -40px;
        right: 10%;
        background: color-mix(in srgb, var(--el-color-primary-light-3) 50%, #7c3aed 30%);
        animation-delay: -6s;
    }

    .blob-c {
        width: 180px;
        height: 180px;
        bottom: -60px;
        right: -20px;
        background: color-mix(in srgb, #06b6d4 40%, transparent);
        animation-delay: -12s;
        opacity: 0.35;
    }
}

.pay-hero__content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
}

.pay-hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, transparent);
}

.pay-hero__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.3;
    background: linear-gradient(120deg,
            var(--el-text-color-primary) 20%,
            var(--el-color-primary) 80%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.pay-hero__desc {
    margin: 0;
    max-width: 560px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
}

.pay-hero__metric {
    text-align: right;
    padding: 10px 16px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
    backdrop-filter: blur(8px);
    border: 1px solid var(--art-card-border);
    min-width: 100px;
}

.pay-hero__metric-label {
    display: block;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
}

.pay-hero__metric-value {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 2px;
    font-size: 28px;
    font-weight: 700;
    color: var(--el-color-primary);
    line-height: 1;
}

.pay-hero__metric-total {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
}

/* ─── Progress track ─── */
.pay-track {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding-top: 4px;
}

.pay-track__rail {
    position: absolute;
    top: 18px;
    left: calc(100% / 6);
    right: calc(100% / 6);
    height: 3px;
    border-radius: 999px;
    background: var(--el-fill-color);
    overflow: hidden;
    z-index: 0;
}

.pay-track__fill {
    height: 100%;
    width: 100%;
    transform-origin: left center;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: inherit;
}

.pay-track__node {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.pay-track__dot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    background: var(--default-box-color);
    border: 2px solid var(--el-border-color);
    transition:
        background 0.3s ease,
        border-color 0.3s ease,
        color 0.3s ease,
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.is-done .pay-track__dot {
    background: var(--el-color-success);
    border-color: var(--el-color-success);
    color: #fff;
}

.is-active .pay-track__dot {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: #fff;
    transform: scale(1.08);
}

.pay-track__check {
    font-size: 14px;
}

.pay-track__ping {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid var(--el-color-primary);
    animation: ping-ring 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    pointer-events: none;
}

.pay-track__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    transition: color 0.25s ease;
}

.is-done .pay-track__label,
.is-active .pay-track__label {
    color: var(--el-text-color-primary);
    font-weight: 600;
}

/* ─── Stages grid ─── */
.pay-stages {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    overflow: hidden;
}

.stage-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 0;
    overflow: auto;
}

.stage-illus {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 8px 0 4px;
}

.stage-illus__ring {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, transparent);
}

.stage-illus__icon {
    font-size: 28px;
    color: var(--el-color-primary);
}

.stage-illus__tip {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
    line-height: 1.45;
}

/* ─── Fields ─── */
.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
}

.field__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
}

.field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex-shrink: 0;
}

.field-num {
    width: 100%;

    :deep(.el-input__wrapper) {
        width: 100%;
    }
}

.lookup-row {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .el-input {
        flex: 1;
    }
}

/* ─── Channel tiles ─── */
.channel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.channel-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 6px;
    border-radius: 10px;
    border: 1.5px solid var(--art-card-border);
    background: var(--el-fill-color-blank);
    cursor: pointer;
    transition:
        border-color 0.22s ease,
        background 0.22s ease,
        transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.22s ease;
    color: var(--el-text-color-regular);

    &:hover {
        transform: translateY(-1px);
        border-color: var(--el-border-color);
    }

    &.is-active {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.12);
    }

    &.is-alipay.is-active {
        border-color: #1677ff;
        background: color-mix(in srgb, #1677ff 8%, var(--default-box-color));

        .channel-tile__icon {
            color: #1677ff;
        }
    }

    &.is-wechat.is-active {
        border-color: #07c160;
        background: color-mix(in srgb, #07c160 8%, var(--default-box-color));

        .channel-tile__icon {
            color: #07c160;
        }
    }

    &.is-paypal.is-active {
        border-color: #003087;
        background: color-mix(in srgb, #003087 8%, var(--default-box-color));

        .channel-tile__icon {
            color: #0070ba;
        }
    }
}

.channel-tile__icon {
    font-size: 22px;
    color: var(--el-text-color-secondary);
    transition: color 0.2s ease;
}

.channel-tile__name {
    font-size: 12px;
    font-weight: 500;
}

/* ─── Segmented control ─── */
.seg-control {
    --seg-index: 0;
    --seg-count: 4;
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--seg-count), 1fr);
    padding: 3px;
    border-radius: 10px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--art-card-border);
}

.seg-control__thumb {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc((100% - 6px) / var(--seg-count));
    border-radius: 8px;
    background: var(--default-box-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transform: translateX(calc(var(--seg-index) * 100%));
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.seg-control__item {
    position: relative;
    z-index: 1;
    padding: 7px 4px;
    border: none;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    border-radius: 8px;
    transition: color 0.2s ease;

    &.is-active {
        color: var(--el-text-color-primary);
        font-weight: 600;
    }
}

/* ─── Primary action button ─── */
.pay-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
    box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--el-color-primary) 45%, transparent);
    transition:
        transform 0.15s ease,
        box-shadow 0.2s ease,
        opacity 0.2s ease;

    &:hover:not(:disabled) {
        box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--el-color-primary) 55%, transparent);

        .pay-btn__shine {
            transform: translateX(220%);
        }
    }

    &:active:not(:disabled) {
        transform: scale(0.985);
    }

    &:disabled,
    &.is-loading {
        opacity: 0.72;
        cursor: not-allowed;
    }

    &--warn {
        background: linear-gradient(135deg, var(--el-color-warning), var(--el-color-warning-light-3));
        box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--el-color-warning) 40%, transparent);

        &:hover:not(:disabled) {
            box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--el-color-warning) 50%, transparent);
        }
    }
}

.pay-btn__shine {
    position: absolute;
    top: 0;
    left: -40%;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
    transform: skewX(-20deg) translateX(0);
    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

.is-spin {
    animation: spin-loader 0.8s linear infinite;
}

/* ─── Pay result ─── */
.pay-result-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
}

.pay-result-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.pay-result-field {
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--art-card-border);
}

.pay-result-field__label {
    display: block;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
}

.pay-result-field__value {
    display: block;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    font-weight: 600;
    word-break: break-all;
    color: var(--el-text-color-primary);
    line-height: 1.4;
}

.mr-1 {
    margin-right: 4px;
}

/* ─── Transitions ─── */
.slip-enter-active,
.slip-leave-active {
    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slip-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.slip-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ─── Keyframes ─── */
@keyframes aurora-drift {
    0% {
        transform: translate(0, 0) scale(1);
    }

    50% {
        transform: translate(24px, 12px) scale(1.08);
    }

    100% {
        transform: translate(-12px, 20px) scale(0.96);
    }
}

@keyframes ping-ring {
    0% {
        transform: scale(1);
        opacity: 0.7;
    }

    100% {
        transform: scale(1.7);
        opacity: 0;
    }
}

@keyframes spin-loader {
    to {
        transform: rotate(360deg);
    }
}

/* ─── Responsive ─── */
@media (max-width: 1200px) {
    .pay-stages {
        grid-template-columns: 1fr;
        overflow: auto;
    }

    .pay-debug-page {
        overflow: auto;
    }
}

@media (max-width: 640px) {
    .pay-debug-page {
        padding: 6px;
        gap: 10px;
    }

    .pay-hero {
        padding: 14px 14px 12px;
    }

    .pay-hero__content {
        flex-direction: column;
        gap: 12px;
    }

    .pay-hero__metric {
        align-self: flex-start;
        text-align: left;
    }

    .pay-hero__metric-value {
        justify-content: flex-start;
    }

    .pay-hero__title {
        font-size: 18px;
    }

    .field-grid,
    .pay-result-fields {
        grid-template-columns: 1fr;
    }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {

    .pay-hero__aurora .blob,
    .pay-track__ping,
    .is-spin {
        animation: none;
    }

    .pay-track__fill,
    .seg-control__thumb,
    .pay-btn,
    .pay-btn__shine,
    .channel-tile,
    .slip-enter-active,
    .slip-leave-active {
        transition: none;
    }
}

/* ─── Dark tweaks ─── */
.dark .pay-hero {
    border-color: rgba(255, 255, 255, 0.08);
}

.dark .channel-tile.is-paypal.is-active {
    border-color: #0070ba;

    .channel-tile__icon {
        color: #3b9eff;
    }
}

.dark .seg-control__thumb {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
</style>
