<template>
    <div class="loginlog-page art-full-height">
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple>
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <LoginLogDetailDialog v-model:visible="detailDialogVisible" :data="currentLogData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { useDictStore } from '@/store/modules/dict'
import { fetchGetLoginLogList, fetchDeleteLoginLog } from '@/api/system/loginlog'
import LoginLogDetailDialog from './modules/loginlog-detail-dialog.vue'

defineOptions({ name: 'LoginLog' })

type LoginLogListItem = Api.SystemLoginLog.LoginLogListItem

const dictStore = useDictStore()

// 选中行
const selectedRows = ref<LoginLogListItem[]>([])

// 详情弹窗
const detailDialogVisible = ref(false)
const currentLogData = ref<LoginLogListItem | undefined>(undefined)

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
        apiFn: fetchGetLoginLogList,
        apiParams: {},
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'createBy', label: '用户ID', align: 'center' },
            {
                prop: 'loginType', label: '用户类型', align: 'center', formatter: (row: LoginLogListItem) => h(
                    ElTag,
                    { type: dictStore.getTagType('system_user_type', row.loginType) },
                    () => dictStore.getDictLabel('system_user_type', row.loginType)
                )
            },
            { prop: 'clientType', label: '客户端类型', align: 'center' },
            { prop: 'clientPlatform', label: '客户端平台', align: 'center' },
            { prop: 'ipaddr', label: 'IP地址', align: 'center' },
            { prop: 'loginLocation', label: '登录地点', align: 'center', showOverflowTooltip: true },
            { prop: 'os', label: '操作系统', align: 'center', showOverflowTooltip: true },
            {
                prop: 'status',
                label: '状态',
                align: 'center',
                formatter: (row: LoginLogListItem) => {
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
            { prop: 'message', label: '提示消息', align: 'center', showOverflowTooltip: true },
            {
                prop: 'createTime',
                label: '登录时间',
                align: 'center',
                width: 180,
                sortable: true,
                formatter: (row: LoginLogListItem) =>
                    row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'operation',
                label: '操作',
                width: 150,
                align: 'center',
                fixed: 'right',
                formatter: (row: LoginLogListItem) =>
                    h('div', [
                        h(ArtButtonTable, {
                            type: 'view',
                            onClick: () => showDetail(row)
                        }),
                        h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteLoginLog(row)
                        })
                    ])
            }
        ]
    }
})

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: LoginLogListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示详情
 */
const showDetail = (row: LoginLogListItem): void => {
    currentLogData.value = row
    detailDialogVisible.value = true
}

/**
 * 删除登录日志
 */
const deleteLoginLog = (row: LoginLogListItem): void => {
    console.log('删除登录日志:', row)
    ElMessageBox.confirm(`确定要删除该登录日志吗？`, '删除登录日志', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteLoginLog(row.logId as number)
            .then(() => {
                ElMessage.success('删除成功')
                refreshData()
            })
            .catch(() => {
                ElMessage.error('删除失败')
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

    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条登录日志吗？`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.logId as number)
        fetchDeleteLoginLog(ids)
            .then(() => {
                ElMessage.success('批量删除成功')
                refreshData()
            })
            .catch(() => {
                ElMessage.error('批量删除失败')
            })
    })
}
</script>

<style scoped lang="scss"></style>
