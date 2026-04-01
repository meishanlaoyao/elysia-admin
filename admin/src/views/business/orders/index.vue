<template>
    <div class="orders-page art-full-height">
        <OrdersSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <OrdersDialog v-model:visible="dialogVisible" :data="currentOrderData" @submit="refreshData" />
            <OrdersDetailDialog v-model:visible="detailVisible" :id="currentOrderId" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import { ElMessage, ElTag, ElSpace, ElText } from 'element-plus'
import { useDictStore } from '@/store/modules/dict'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import OrdersSearch from './modules/orders-search.vue'
import OrdersDialog from './modules/orders-dialog.vue'
import OrdersDetailDialog from './modules/orders-detail-dialog.vue'
import { fetchGetOrdersList } from '@/api/business/orders'

type OrdersListItem = Api.BusinessOrders.OrdersListItem

const auth = useAuth()
const dictStore = useDictStore()
const { system_orders_status, system_pay_method } = dictStore.getDictData(['system_orders_status', 'system_pay_method'])

// 弹窗相关
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentOrderData = ref<Partial<OrdersListItem>>({})
const currentOrderId = ref<number>()

// 搜索表单
const searchForm = ref({
    orderNo: undefined,
    status: undefined,
    paymentMethod: undefined,
    daterange: undefined,
})

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
            { type: 'index', width: 60, label: '序号', align: 'center' },
            {
                prop: 'orderNo', label: '订单号', align: 'center', width: 300, formatter: (row) => {
                    return h(
                        ElText,
                        {
                            type: 'primary',
                            style: 'cursor:pointer',
                            onClick: () => {
                                navigator.clipboard.writeText(row.orderNo)
                                ElMessage.success('复制成功')
                            }
                        },
                        { default: () => row.orderNo }
                    )
                }
            },
            { prop: 'title', label: '订单标题', align: 'center', showOverflowTooltip: true },
            {
                prop: 'amount',
                label: '金额',
                align: 'center',
                showOverflowTooltip: true,
                formatter: (row) => {
                    return `${row.amount} ${row.currency || 'CNY'}`
                }
            },
            {
                prop: 'status',
                label: '状态',
                align: 'center',
                formatter: (row) => {
                    const dict = system_orders_status.value?.find(item => item.dictValue === row.status)
                    return h(ElTag, { type: dict?.tagType || 'info' }, { default: () => dict?.dictLabel || '未知' })
                }
            },
            {
                prop: 'paymentMethod',
                label: '支付方式',
                align: 'center',
                width: 150,
                formatter: (row) => {
                    const dict = system_pay_method.value?.find(item => item.dictValue === row.paymentMethod)
                    if (dict?.remark) {
                        return h(ElSpace, { size: 4 }, {
                            default: () => [
                                h(ArtSvgIcon, { icon: dict.remark || '', class: dict.customClass }),
                                h('span', dict.dictLabel)
                            ]
                        })
                    }
                    return dict?.dictLabel || row.paymentMethod || '-'
                }
            },
            {
                prop: 'createTime',
                label: '创建日期',
                align: 'center',
                sortable: true,
                showOverflowTooltip: true,
                formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'timeout',
                label: '超时时间',
                align: 'center',
                width: 120,
                formatter: (row) => {
                    return row.timeout ? `${row.timeout}s` : '-'
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
                        buttons.push(h(ArtButtonTable, {
                            type: 'view',
                            onClick: () => showDetail(row)
                        }))
                    }
                    if (auth.hasAuth('business:orders:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showEdit(row)
                        }))
                    }
                    return h('div', buttons)
                }
            }
        ]
    }
})

/**
 * 搜索处理
 */
const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
}

/**
 * 显示详情
 */
const showDetail = (row: Partial<OrdersListItem>) => {
    currentOrderId.value = row.id
    nextTick(() => {
        detailVisible.value = true
    })
}

/**
 * 显示编辑
 */
const showEdit = (row: Partial<OrdersListItem>) => {
    currentOrderData.value = { ...row }
    nextTick(() => {
        dialogVisible.value = true
    })
}
</script>

<style scoped lang='scss'>
.orders-page {

    .text-blue-600 {
        color: #2563eb;
    }

    .text-green-600 {
        color: #16a34a;
    }
}
</style>
