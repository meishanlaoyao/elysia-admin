<template>
    <div class="blacklist-page art-full-height">
        <BlacklistSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'system:ip-black:create'">新增黑名单</ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'system:ip-black:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <BlacklistDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentBlacklistData"
                @submit="refreshData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ElMessage, ElMessageBox, ElSwitch } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { DialogType } from '@/types'
import BlacklistSearch from './modules/blacklist-search.vue'
import BlacklistDialog from './modules/blacklist-dialog.vue'
import {
    fetchGetIpBlackAll,
    fetchDeleteIpBlack,
    fetchUpdateIpBlack
} from '@/api/system/ipblack'

type IpBlackItem = Api.SystemIpBlack.IpBlackItem

const auth = useAuth()

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentBlacklistData = ref<Partial<IpBlackItem>>({})

// 选中行
const selectedRows = ref<IpBlackItem[]>([])

// 搜索表单
const searchForm = ref({
    ipAddress: undefined,
    status: undefined
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
    refreshData
} = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetIpBlackAll,
        apiParams: searchForm.value,
        excludeParams: ['current', 'size'], // 排除分页参数
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'ipAddress', label: 'IP地址', align: 'center' },
            {
                prop: 'status',
                label: '状态',
                align: 'center',
                formatter: (row: IpBlackItem) =>
                    h(ElSwitch, {
                        modelValue: row.status,
                        activeValue: true,
                        inactiveValue: false,
                        onChange: async (val) => {
                            row.status = val as boolean
                            await fetchUpdateIpBlack(row)
                            refreshData()
                        }
                    })
            },
            { prop: 'remark', label: '备注', align: 'center', showOverflowTooltip: true },
            {
                prop: 'createTime',
                label: '创建日期',
                align: 'center',
                sortable: true,
                formatter: (row: IpBlackItem) =>
                    row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'operation',
                label: '操作',
                width: 180,
                align: 'center',
                fixed: 'right',
                formatter: (row: IpBlackItem) => {
                    const buttons = [];
                    if (auth.hasAuth('system:ip-black:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row)
                        }))
                    }
                    if (auth.hasAuth('system:ip-black:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteBlacklist(row)
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
const handleSelectionChange = (selection: IpBlackItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示黑名单弹窗
 */
const showDialog = (type: DialogType, row?: IpBlackItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentBlacklistData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 删除黑名单
 */
const deleteBlacklist = (row: IpBlackItem): void => {
    console.log('删除黑名单:', row)
    ElMessageBox.confirm(`确定要删除IP地址 ${row.ipAddress} 吗？`, '删除黑名单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteIpBlack(row.ipBlackId as number)
            .then(() => {
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

    const ipList = selectedRows.value.map((item) => item.ipAddress).join('、')
    ElMessageBox.confirm(`确定要删除以下IP地址吗？\n${ipList}`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.ipBlackId as number)
        fetchDeleteIpBlack(ids)
            .then(() => {
                refreshData()
            })
    })
}
</script>

<style scoped lang="scss"></style>
