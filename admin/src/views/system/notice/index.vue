<template>
    <div class="notice-page art-full-height">
        <NoticeSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'system:notice:create'">新增通知公告</ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'system:notice:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <NoticeDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentRowData"
                @submit="refreshData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { useDictStore } from '@/store/modules/dict'
import { DialogType } from '@/types'
import { useTable } from '@/hooks/core/useTable'
import { ElMessage, ElMessageBox, ElSwitch, ElSpace } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import NoticeSearch from './modules/notice-search.vue'
import NoticeDialog from './modules/notice-dialog.vue'
import { fetchGetNoticeList, fetchDeleteNotice, fetchUpdateNotice } from '@/api/system/notice'

type NoticeListItem = Api.SystemNotice.NoticeListItem

defineOptions({ name: 'Notice' })

const auth = useAuth()
const dictStore = useDictStore()

const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentRowData = ref<Partial<NoticeListItem>>({})
const selectedRows = ref<NoticeListItem[]>([])

const searchForm = ref({
    title: undefined,
    noticeType: undefined,
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
    core: {
        apiFn: fetchGetNoticeList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' },
            { type: 'index', width: 60, label: '序号', align: 'center' },
            { prop: 'title', label: '公告标题', align: 'center', showOverflowTooltip: true },
            {
                prop: 'noticeType',
                label: '通知类型',
                align: 'center',
                formatter: (row) => dictStore.getDictLabel('system_notice_type', row.noticeType),
            },
            {
                prop: 'status',
                label: '状态',
                align: 'center',
                formatter: (row) => h(ElSwitch, {
                    modelValue: row.status,
                    activeValue: true,
                    inactiveValue: false,
                    disabled: !auth.hasAuth('system:notice:update'),
                    onChange: async (val) => {
                        row.status = val as boolean
                        await fetchUpdateNotice(row)
                        refreshData()
                    },
                }),
            },
            { prop: 'sort', label: '排序', align: 'center', width: 80 },
            {
                prop: 'createTime',
                label: '创建时间',
                align: 'center',
                width: 180,
                formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '',
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    if (auth.hasAuth('system:notice:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row),
                        }))
                    }
                    if (auth.hasAuth('system:notice:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => handleDelete(row),
                        }))
                    }
                    return h('div', buttons)
                },
            },
        ],
    },
})

const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
}

const handleSelectionChange = (selection: NoticeListItem[]): void => {
    selectedRows.value = selection
}

const showDialog = (type: DialogType, row?: NoticeListItem): void => {
    dialogType.value = type
    currentRowData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

const handleDelete = (row: NoticeListItem): void => {
    ElMessageBox.confirm(`确定要删除公告"${row.title}"吗？`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(() => {
        fetchDeleteNotice(row.noticeId as number).then(() => refreshData())
    })
}

const handleBatchDelete = (): void => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的数据')
        return
    }
    ElMessageBox.confirm('确定要删除选中的记录吗？', '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.noticeId as number)
        fetchDeleteNotice(ids).then(() => refreshData())
    })
}
</script>
