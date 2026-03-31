<template>
    <div class="merchant-page art-full-height">
        <MerchantSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'business:merchant:create'">
                            新增商户
                        </ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'business:merchant:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <MerchantDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentMerchantData"
                @submit="refreshData" />
            <MerchantConfigDialog v-model:visible="configDialogVisible" :type="configDialogType"
                :data="configCurrentMerchantData" @submit="refreshData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { DialogType } from '@/types'
import { useTable } from '@/hooks/core/useTable'
import { ElMessage, ElMessageBox, ElSwitch, ElSpace } from 'element-plus'
import { useDictStore } from '@/store/modules/dict'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import MerchantSearch from './modules/merchant-search.vue'
import MerchantDialog from './modules/merchant-dialog.vue'
import MerchantConfigDialog from './modules/config-dialog.vue'
import { fetchGetMerchantList, fetchDeleteMerchant, fetchUpdateMerchant } from '@/api/business/merchant'

type MerchantListItem = Api.BusinessMerchant.MerchantListItem
type MerchantConfigItem = Api.BusinessMerchant.MerchantConfigItem

const auth = useAuth()

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentMerchantData = ref<Partial<MerchantListItem>>({})

// 商户配置弹窗相关
const configDialogVisible = ref(false)
const configDialogType = ref<DialogType>('add')
const configCurrentMerchantData = ref<Partial<MerchantConfigItem>>({})

const dictStore = useDictStore()
const { system_pay_method } = dictStore.getDictData(['system_pay_method'])

// 选中行
const selectedRows = ref<MerchantListItem[]>([])

// 搜索表单
const searchForm = ref({
    name: undefined,
    status: undefined,
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
    // 核心配置
    core: {
        apiFn: fetchGetMerchantList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'name', label: '商户名称', align: 'center' },
            {
                prop: 'configList',
                label: '支付渠道',
                align: 'center',
                formatter: (row) => {
                    const configList = row.configList || []
                    const infoList = configList.map(item => {
                        const dictItem = system_pay_method.value?.find(dictItem => dictItem.dictValue === item.channel);
                        return {
                            ...item,
                            dictLabel: dictItem?.dictLabel || '',
                            icon: dictItem?.remark || '',
                            customClass: dictItem?.customClass || ''
                        };
                    });
                    return h(
                        ElSpace,
                        { wrap: true },
                        {
                            default: () => infoList.map(item => h(
                                ArtSvgIcon,
                                {
                                    icon: item.icon,
                                    class: item.customClass,
                                    style: { cursor: 'pointer', },
                                    onClick: () => showConfigDialog('edit', {
                                        merchantId: row.id!,
                                        merchantName: row.name,
                                        id: item.id,
                                    })
                                }
                            ))
                        }
                    )
                }
            },
            {
                prop: 'status', label: '状态', align: 'center', formatter: (row) => h(ElSwitch, {
                    modelValue: row.status,
                    activeValue: true,
                    inactiveValue: false,
                    onChange: async (val) => {
                        row.status = val as boolean
                        await fetchUpdateMerchant(row)
                        refreshData()
                    },
                })
            },
            { prop: 'createTime', label: '创建日期', align: 'center', sortable: true, formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' },
            {
                prop: 'operation',
                label: '操作',
                width: 180,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    const configList = row.configList || []
                    if (configList.length < system_pay_method.value.length && auth.hasAuth('business:merchant:create')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'add',
                            onClick: () => showConfigDialog('add', {
                                merchantId: row.id!,
                                merchantName: row.name,
                                usedChannel: configList.map(item => item.channel),
                            })
                        }))
                    }
                    if (auth.hasAuth('business:merchant:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row)
                        }))
                    }
                    if (auth.hasAuth('business:merchant:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteMerchant(row)
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
 * @param params 参数
 */
const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: MerchantListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示弹窗
 */
const showDialog = (type: DialogType, row?: MerchantListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentMerchantData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 显示商户配置弹窗
 */
const showConfigDialog = (
    type: DialogType,
    row?: {
        merchantId: number,
        merchantName: string,
        id?: number,
        usedChannel?: string[],
    }): void => {
    console.log('打开商户配置弹窗:', { type, row })
    configDialogType.value = type
    configCurrentMerchantData.value = row || {}
    nextTick(() => {
        configDialogVisible.value = true
    })
}

/**
 * 删除商户
 */
const deleteMerchant = (row: MerchantListItem): void => {
    console.log('删除商户:', row)
    ElMessageBox.confirm(`确定要删除商户"${row.name}"吗？`, '删除商户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteMerchant(row.id as number).then(() => {
            refreshData()
        })
    })
}

/**
 * 批量删除
 */
const handleBatchDelete = (): void => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的数据')
        return
    }
    const merchantNames = selectedRows.value.map((item) => item.name).join('、')
    ElMessageBox.confirm(`确定要删除以下商户吗？\n${merchantNames}`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.id as number)
        fetchDeleteMerchant(ids)
            .then(() => {
                refreshData()
            })
    })
}
</script>

<style scoped lang='scss'>
.merchant-page {
    .text-blue-600 {
        color: #2563eb;
    }

    .text-green-600 {
        color: #16a34a;
    }
}
</style>