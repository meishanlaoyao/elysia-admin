<template>
    <div class="storage-page art-full-height">
        <StorageSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')" v-auth="'system:storage:create'">新增存储</ElButton>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
                            v-ripple v-auth="'system:storage:delete'">
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <StorageDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentStorageData"
                @submit="refreshData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ElMessage, ElMessageBox, ElSwitch, ElTag } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { DialogType } from '@/types'
import StorageSearch from './modules/storage-search.vue'
import StorageDialog from './modules/storage-dialog.vue'
import { fetchGetStorageList, fetchDeleteStorage, fetchUpdateStorage } from '@/api/system/storage'

type StorageListItem = Api.SystemStorage.StorageListItem

const auth = useAuth()

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentStorageData = ref<Partial<StorageListItem>>({})

// 选中行
const selectedRows = ref<StorageListItem[]>([])

// 搜索表单
const searchForm = ref({
    name: undefined,
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
        apiFn: fetchGetStorageList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'name', label: '存储名称', align: 'center' },
            { prop: 'endpoint', label: '端点地址', align: 'center', showOverflowTooltip: true },
            { prop: 'bucket', label: '存储桶', align: 'center' },
            {
                prop: 'status', label: '状态', align: 'center', formatter: (row) => h(ElSwitch, {
                    modelValue: row.status,
                    activeValue: true,
                    inactiveValue: false,
                    onChange: async (val) => {
                        row.status = val as boolean
                        await fetchUpdateStorage(row)
                        refreshData()
                    },
                })
            },
            { prop: 'remark', label: '备注', align: 'center', showOverflowTooltip: true, },
            { prop: 'createTime', label: '创建日期', align: 'center', sortable: true, formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' },
            {
                prop: 'operation',
                label: '操作',
                width: 180,
                align: 'center',
                fixed: 'right',
                formatter: (row) => {
                    const buttons = []
                    if (auth.hasAuth('system:storage:update')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row)
                        }))
                    }
                    if (auth.hasAuth('system:storage:delete')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteStorage(row)
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
const handleSelectionChange = (selection: StorageListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 显示存储弹窗
 */
const showDialog = (type: DialogType, row?: StorageListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentStorageData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 删除存储
 */
const deleteStorage = (row: StorageListItem): void => {
    console.log('删除存储:', row)
    ElMessageBox.confirm(`确定要删除存储"${row.name}"吗？`, '删除存储', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteStorage(row.storageId as number).then(() => {
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

    const storageNames = selectedRows.value.map((item) => item.name).join('、')
    ElMessageBox.confirm(`确定要删除以下存储配置吗？\n${storageNames}`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.storageId as number)
        fetchDeleteStorage(ids)
            .then(() => {
                refreshData()
            })
    })
}
</script>

<style scoped lang='scss'></style>