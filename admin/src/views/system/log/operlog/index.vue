<template>
    <div class="operlog-page art-full-height">
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'system:oper-log:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <OperLogDetailDialog v-model:visible="detailDialogVisible" :data="currentLogData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetOperLogList, fetchDeleteOperLog } from '@/api/system/operlog'
import OperLogDetailDialog from './modules/operlog-detail-dialog.vue'
import { useDictStore } from '@/store/modules/dict';

const dictStore = useDictStore()
const auth = useAuth()

defineOptions({ name: 'OperLog' })

type OperLogListItem = Api.SystemOperLog.OperLogListItem

// 选中行
const selectedRows = ref<OperLogListItem[]>([])

// 详情弹窗
const detailDialogVisible = ref(false)
const currentLogData = ref<OperLogListItem | undefined>(undefined)

const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
} = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetOperLogList,
        apiParams: {},
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'title', label: '模块', align: 'center', showOverflowTooltip: true },
            { prop: 'action', label: '操作', align: 'center', showOverflowTooltip: true },
            {
                prop: 'requestMethod',
                label: '请求方式',
                align: 'center',
                formatter: (row: OperLogListItem) => h(ElTag, {
                    type: dictStore.getTagType('api_request_method', row.requestMethod)
                }, () => dictStore.getDictLabel('api_request_method', row.requestMethod))
            },
            {
                prop: 'operatorType', label: '用户类型', align: 'center', formatter: (row: OperLogListItem) => h(
                    ElTag,
                    { type: dictStore.getTagType('system_user_type', row.operatorType || '') },
                    () => dictStore.getDictLabel('system_user_type', row.operatorType || '')
                )
            },
            { prop: 'userId', label: '操作人员', align: 'center' },
            { prop: 'operIp', label: '操作IP', align: 'center' },
            { prop: 'operLocation', label: '操作地点', align: 'center', showOverflowTooltip: true },
            {
                prop: 'status',
                label: '状态',
                align: 'center',
                formatter: (row: OperLogListItem) => {
                    const statusConfig = row.status
                        ? { type: 'success', text: '成功' }
                        : { type: 'danger', text: '失败' }
                    return h(
                        ElTag,
                        { type: statusConfig.type as 'success' | 'danger' },
                        () => statusConfig.text
                    )
                }
            },
            {
                prop: 'costTime',
                label: '耗时',
                align: 'center',
                sortable: true,
                formatter: (row: OperLogListItem) => `${row.costTime || 0} ms`
            },
            {
                prop: 'createTime',
                label: '操作时间',
                align: 'center',
                width: 180,
                sortable: true,
                formatter: (row: OperLogListItem) =>
                    row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'operation',
                label: '操作',
                width: 150,
                align: 'center',
                fixed: 'right',
                formatter: (row: OperLogListItem) => {
                    const buttons = []
                    if (auth.hasAuth('system:oper-log:query')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'view',
                            onClick: () => showDetail(row)
                        }))
                    }
                    if (auth.hasAuth('system:oper-log:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteOperLog(row)
                        }))
                    }
                    return h('div', buttons)
                }
            }
        ]
    }
})

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: OperLogListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示详情
 */
const showDetail = (row: OperLogListItem): void => {
    currentLogData.value = row
    detailDialogVisible.value = true
}

/**
 * 删除操作日志
 */
const deleteOperLog = (row: OperLogListItem): void => {
    console.log('删除操作日志:', row)
    ElMessageBox.confirm(`确定要删除该操作日志吗？`, '删除操作日志', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteOperLog(row.operId as number)
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

    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条操作日志吗？`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.operId as number)
        fetchDeleteOperLog(ids)
            .then(() => {
                refreshData()
            })
    })
}
</script>

<style scoped lang="scss"></style>