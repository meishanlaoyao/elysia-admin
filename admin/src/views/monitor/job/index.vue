<template>
    <div class="job-page art-full-height">
        <JobSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'monitor:job:create'">新增任务</ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'monitor:job:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <JobDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentJobData"
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
import JobSearch from './modules/job-search.vue'
import JobDialog from './modules/job-dialog.vue'
import { fetchGetJobList, fetchDeleteJob, fetchUpdateJob } from '@/api/monitor/job'

type JobListItem = Api.MonitorJob.JobListItem

const auth = useAuth()

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentJobData = ref<Partial<JobListItem>>({})

// 选中行
const selectedRows = ref<JobListItem[]>([])

// 搜索表单
const searchForm = ref({
    jobName: undefined,
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
        apiFn: fetchGetJobList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'jobName', label: '任务名称', align: 'center' },
            { prop: 'jobCron', label: 'Cron表达式', align: 'center' },
            { prop: 'jobArgs', label: '任务参数', align: 'center', showOverflowTooltip: true },
            {
                prop: 'status', label: '状态', align: 'center', formatter: (row) => h(ElSwitch, {
                    modelValue: row.status,
                    activeValue: true,
                    inactiveValue: false,
                    onChange: async (val) => {
                        row.status = val as boolean
                        await fetchUpdateJob(row)
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
                    if (auth.hasAuth('monitor:job:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row)
                        }))
                    }
                    if (auth.hasAuth('monitor:job:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteJob(row)
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
const handleSelectionChange = (selection: JobListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示任务弹窗
 */
const showDialog = (type: DialogType, row?: JobListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentJobData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 删除任务
 */
const deleteJob = (row: JobListItem): void => {
    console.log('删除任务:', row)
    ElMessageBox.confirm(`确定要删除任务"${row.jobName}"吗？`, '删除任务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteJob(row.jobId as number).then(() => {
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

    const jobNames = selectedRows.value.map((item) => item.jobName).join('、')
    ElMessageBox.confirm(`确定要删除以下任务吗？\n${jobNames}`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.jobId as number)
        fetchDeleteJob(ids)
            .then(() => {
                refreshData()
            })
    })
}
</script>

<style scoped lang='scss'></style>