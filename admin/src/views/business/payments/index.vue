<template>
    <div class="payments-page art-full-height">
        <PaymentsSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @pagination:size-change="handleSizeChange" @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <PaymentsDetailDialog v-model:visible="detailVisible" :id="currentPaymentId" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import { ElTag, ElText, ElSpace, ElMessage } from 'element-plus'
import { useDictStore } from '@/store/modules/dict'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import PaymentsSearch from './modules/payments-search.vue'
import PaymentsDetailDialog from './modules/payments-detail-dialog.vue'
import { fetchGetPaymentsList } from '@/api/business/payments'

type PaymentsListItem = Api.BusinessPayments.PaymentsListItem

const auth = useAuth()
const dictStore = useDictStore()
const { system_pay_platform, system_pay_method, system_pay_status } = dictStore.getDictData(['system_pay_platform', 'system_pay_method', 'system_pay_status'])

const detailVisible = ref(false)
const currentPaymentId = ref<number>()

const searchForm = ref({
    orderNo: undefined,
    paymentNo: undefined,
    platform: undefined,
    paymentMethod: undefined,
    status: undefined,
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
        apiFn: fetchGetPaymentsList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'index', width: 60, label: '序号', align: 'center' },
            {
                prop: 'paymentNo', label: '支付订单号', align: 'center', width: 300, formatter: (row) => {
                    return h(
                        ElText,
                        {
                            type: 'primary',
                            style: 'cursor:pointer',
                            onClick: () => {
                                navigator.clipboard.writeText(row.paymentNo)
                                ElMessage.success('复制成功')
                            }
                        },
                        { default: () => row.paymentNo }
                    )
                }
            },
            {
                prop: 'orderNo', label: '关联订单号', align: 'center', width: 300, formatter: (row) => {
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
            {
                prop: 'platform',
                label: '支付平台',
                align: 'center',
                formatter: (row) => {
                    const dict = system_pay_platform.value?.find(item => item.dictValue === row.platform)
                    return dict?.dictLabel || row.platform || '-'
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
                prop: 'amount',
                label: '支付金额',
                align: 'center',
                formatter: (row) => {
                    return row.amount?.toFixed(2) || '0.00'
                }
            },
            {
                prop: 'status',
                label: '支付状态',
                align: 'center',
                formatter: (row) => {
                    const dict = system_pay_status.value?.find(item => item.dictValue === row.status)
                    return h(ElTag, { type: dict?.tagType || 'info' }, { default: () => dict?.dictLabel || '未知' })
                }
            },
            {
                prop: 'createTime',
                label: '创建时间',
                align: 'center',
                sortable: true,
                formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'operation',
                label: '操作',
                width: 100,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    if (auth.hasAuth('business:payments:query')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'view',
                            onClick: () => showDetail(row)
                        }))
                    }
                    return h('div', buttons)
                }
            }
        ]
    }
})

const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
}

const showDetail = (row: Partial<PaymentsListItem>) => {
    currentPaymentId.value = row.id
    nextTick(() => {
        detailVisible.value = true
    })
}
</script>

<style scoped lang='scss'>
.payments-page {
    .text-blue-600 {
        color: #2563eb;
    }

    .text-green-600 {
        color: #16a34a;
    }
}
</style>