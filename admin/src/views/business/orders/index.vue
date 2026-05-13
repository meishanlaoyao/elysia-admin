<template>
    <div class="orders-page art-full-height">
        <OrdersSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <div class="orders-table-top">
                <div class="orders-stats-tags">
                    <ElTag v-for="item in orderStatusDictItems" :key="item.dictValue" :type="item.tagType || 'info'"
                        size="small">
                        {{ item.dictLabel }} {{ orderStats[item.dictValue] ?? 0 }}
                    </ElTag>
                </div>
                <div class="orders-table-top__header">
                    <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="handleTableRefresh" />
                </div>
            </div>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange" />
            <OrdersDialog v-model:visible="dialogVisible" :data="currentOrderData" @submit="refreshData" />
            <OrdersDetailDialog v-model:visible="detailVisible" :id="currentOrderId" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import { ElMessage, ElTag, ElAvatar, ElImage, ElIcon } from 'element-plus'
import { Goods } from '@element-plus/icons-vue'
import { useDictStore } from '@/store/modules/dict'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import OrdersSearch from './modules/orders-search.vue'
import OrdersDialog from './modules/orders-dialog.vue'
import OrdersDetailDialog from './modules/orders-detail-dialog.vue'
import { fetchGetOrdersList, fetchGetOrdersStatusStats } from '@/api/business/orders'

type OrdersListItem = Api.BusinessOrders.OrdersListItem

const ORDERS_STATUS_DICT = 'system_orders_status' as const

const auth = useAuth()
const dictStore = useDictStore()
const { system_orders_status } = dictStore.getDictData([ORDERS_STATUS_DICT])

const orderStatusDictItems = computed(() => {
    const list = system_orders_status.value ?? []
    return [...list].sort((a, b) => (a.dictSort ?? 0) - (b.dictSort ?? 0))
})

const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentOrderData = ref<Partial<OrdersListItem>>({})
const currentOrderId = ref<number>()

const searchForm = ref({
    orderNo: undefined,
    status: undefined,
    daterange: undefined,
})

const orderStats = ref<Api.BusinessOrders.OrdersStatusStats>({})

const loadOrderStats = async () => {
    try {
        const data = await fetchGetOrdersStatusStats()
        orderStats.value = { ...(data ?? {}) }
    } catch {
        /* 错误提示由 request 层处理 */
    }
}

const handleTableRefresh = () => {
    refreshData()
    loadOrderStats()
}

const fmtAmount = (val?: number | string | null) => {
    if (val == null) return '0.00'
    return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
} = useTable({
    core: {
        apiFn: fetchGetOrdersList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            {
                prop: 'orderNo',
                label: '订单信息',
                align: 'left',
                width: 290,
                formatter: (row) => {
                    const time = row.createTime
                        ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
                        : '-'
                    return h('div', { class: 'orders-cell' }, [
                        h('span', {
                            class: 'orders-cell__order-no',
                            onClick: () => {
                                if (!row.orderNo) return
                                navigator.clipboard.writeText(row.orderNo)
                                ElMessage.success('已复制')
                            }
                        }, row.orderNo || '-'),
                        h('div', { class: 'orders-cell__s' }, `下单时间：${time}`),
                    ])
                }
            },
            {
                prop: 'userId',
                label: '买家信息',
                align: 'left',
                width: 200,
                formatter: (row) => {
                    const user = (row.extra as any)?.user
                    const nickname = user?.nickname || '-'
                    const phone = user?.phone || '-'
                    const avatarSrc = user?.avatar || ''
                    return h('div', { class: 'orders-cell orders-cell--flex10' }, [
                        h(ElAvatar, {
                            class: 'orders-cell__avatar',
                            size: 36,
                            src: avatarSrc,
                        }, () => nickname.charAt(0)),
                        h('div', { class: 'orders-cell__fill' }, [
                            h('div', { class: 'orders-cell__t orders-cell__t--ellipsis' },
                                `${nickname} / ${phone}`),
                            h('div', { class: 'orders-cell__s' },
                                `ID: ${row.userId || '-'}`),
                        ])
                    ])
                }
            },
            {
                prop: 'title',
                label: '商品信息',
                align: 'left',
                minWidth: 200,
                formatter: (row) => {
                    const products = (row.extra as any)?.products ?? []
                    const count = products.length
                    const first = products[0]
                    const imgSrc = first?.image || ''
                    // 所有商品名拼成一行：名称 x数量、名称 x数量
                    const summaryText = count > 0
                        ? products.map((p: any) => `${p.productName || '未知商品'} x${p.productNum || 1}`).join('、')
                        : (row.title || '-')
                    return h('div', { class: 'orders-cell orders-cell--flex8' }, [
                        h(ElImage, {
                            class: 'orders-cell__thumb',
                            src: imgSrc,
                            fit: 'cover',
                        }, {
                            error: () => h('div', { class: 'orders-cell__thumb-error' },
                                [h(ElIcon, { size: 18 }, () => h(Goods))])
                        }),
                        h('div', { class: 'orders-cell__fill' }, [
                            h('div', { class: 'orders-cell__t orders-cell__t--ellipsis' }, summaryText),
                            count > 0
                                ? h('div', { class: 'orders-cell__s' }, `共 ${count} 个明细项`)
                                : null,
                        ])
                    ])
                }
            },
            {
                prop: 'merchantId',
                label: '收货信息',
                align: 'left',
                width: 200,
                formatter: (row) => {
                    const user = (row.extra as any)?.user
                    const namePhone = user?.nickname && user?.phone
                        ? `${user.nickname} / ${user.phone}`
                        : '-'
                    const address = user?.address || '-'
                    return h('div', { class: 'orders-cell' }, [
                        h('div', { class: 'orders-cell__t orders-cell__t--ship' }, namePhone),
                        h('div', { class: 'orders-cell__s orders-cell__s--ellipsis', title: address }, address),
                    ])
                }
            },
            {
                prop: 'amount',
                label: '金额',
                align: 'left',
                width: 200,
                formatter: (row) => {
                    return h('div', { class: 'orders-cell' }, [
                        h('div', { class: 'orders-cell__amount' },
                            `¥${fmtAmount(row.amount)}`),
                        h('div', { class: 'orders-cell__s' },
                            `商品 ¥${fmtAmount(row.amount)} / 运费 ¥0.00`),
                    ])
                }
            },
            {
                prop: 'status',
                label: '状态',
                align: 'left',
                width: 200,
                formatter: (row) => {
                    const orderDict = dictStore.getDictItemByKey('system_orders_status', 'dictValue', row.status)
                    const payment = row.paymentSummary
                    const payDict = payment
                        ? dictStore.getDictItemByKey('system_pay_status', 'dictValue', payment.status)
                        : null
                    const refund = row.refundSummary
                    const refundDict = refund
                        ? dictStore.getDictItemByKey('system_refund_status', 'dictValue', refund.status)
                        : null
                    return h('div', { class: 'orders-cell orders-cell--tags' }, [
                        h(ElTag, { type: orderDict?.tagType || 'info', size: 'small' },
                            () => orderDict?.dictLabel || '未知'),
                        payment
                            ? h(ElTag, { type: payDict?.tagType || 'info', size: 'small' },
                                () => payDict?.dictLabel || '-')
                            : h(ElTag, { type: 'info', size: 'small' }, () => '未支付'),
                        refund
                            ? h(ElTag, { type: refundDict?.tagType || 'warning', size: 'small' },
                                () => refundDict?.dictLabel || '退款中')
                            : h(ElTag, { type: 'info', size: 'small', effect: 'plain' }, () => '无退款'),
                    ])
                }
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    if (auth.hasAuth('business:orders:query')) {
                        buttons.push(h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row) }))
                    }
                    if (auth.hasAuth('business:orders:update')) {
                        buttons.push(h(ArtButtonTable, { type: 'edit', onClick: () => showRemark(row) }))
                    }
                    return h('div', buttons)
                }
            }
        ]
    }
})

onMounted(() => {
    loadOrderStats()
})

const handleSearch = (params: Record<string, any>) => {
    const { daterange, ...rest } = params
    Object.assign(searchParams, rest)
    const sp = searchParams as Record<string, unknown>
    delete sp.daterange
    if (Array.isArray(daterange) && daterange[0] && daterange[1]) {
        sp.startTime = daterange[0]
        sp.endTime = daterange[1]
    } else {
        delete sp.startTime
        delete sp.endTime
    }
    getData()
}

const showDetail = (row: Partial<OrdersListItem>) => {
    currentOrderId.value = row.id
    nextTick(() => { detailVisible.value = true })
}

const showRemark = (row: Partial<OrdersListItem>) => {
    currentOrderData.value = { ...row }
    nextTick(() => { dialogVisible.value = true })
}
</script>

<style scoped lang="scss">
.orders-page {
    .orders-table-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .orders-stats-tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }

    .orders-table-top__header {
        flex: 1;
        min-width: 200px;
    }

    :deep(.orders-cell) {
        padding: 4px 0;
    }

    :deep(.orders-cell--flex8) {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    :deep(.orders-cell--flex10) {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    :deep(.orders-cell--tags) {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
    }

    :deep(.orders-cell__order-no) {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        font-family: monospace;
        font-weight: 600;
        color: var(--el-text-color-primary);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: var(--el-color-primary);
        }
    }

    :deep(.orders-cell__t) {
        font-size: 13px;
        color: var(--el-text-color-primary);
        line-height: 1.9;
    }

    :deep(.orders-cell__t--ellipsis) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.85;
    }

    :deep(.orders-cell__t--ship) {
        margin-bottom: 2px;
        line-height: 1.9;
    }

    :deep(.orders-cell__s) {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1.7;
    }

    :deep(.orders-cell__s--ellipsis) {
        overflow: hidden;
        max-width: 178px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :deep(.orders-cell__amount) {
        margin-bottom: 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }

    :deep(.orders-cell__fill) {
        flex: 1;
        min-width: 0;
        overflow: hidden;
    }

    :deep(.orders-cell__avatar) {
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-7);
    }

    :deep(.orders-cell__thumb) {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
        background: var(--el-fill-color-lighter);
    }

    :deep(.orders-cell__thumb-error) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        color: var(--el-text-color-placeholder);
    }
}
</style>