<template>
    <div class="api-page art-full-height">
        <ApiSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialog('add')">新增API</ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
            <ApiDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentDictData"
                @submit="handleDialogSubmit" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox, ElSwitch } from 'element-plus'
import ArtDictTag from '@/components/core/tag/art-dict-tag/index.vue'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable';
import { DialogType } from '@/types'
import ApiSearch from './modules/api-search.vue';
import ApiDialog from './modules/api-dialog.vue';
import { fetchGetApiList, fetchCreateApi, fetchDeleteApi, fetchUpdateApi } from '@/api/system/api';
import { useDictStore } from '@/store/modules/dict';
const dictStore = useDictStore()
const { api_request_method } = dictStore.getDictData(['api_request_method'])

type ApiListItem = Api.SystemApi.ApiListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentDictData = ref<Partial<ApiListItem>>({})

// 选中行
const selectedRows = ref<ApiListItem[]>([])

// 搜索表单
const searchForm = ref({
    apiName: undefined,
    apiPath: undefined,
    apiMethod: undefined,
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
        apiFn: fetchGetApiList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            { prop: 'apiName', label: '名称' },
            { prop: 'apiPath', label: '路径' },
            {
                prop: 'apiMethod',
                label: '方法',
                formatter: (row) => h(ArtDictTag, {
                    dictList: api_request_method.value,
                    value: row.apiMethod,
                })
            },
            {
                prop: 'status', label: '状态', formatter: (row) => h(ElSwitch, {
                    modelValue: row.status,
                    activeValue: true,
                    inactiveValue: false,
                    onChange: async (val) => {
                        row.status = val as boolean
                        await fetchUpdateApi(row)
                        ElMessage.success('状态更新成功')
                        refreshData()
                    },
                })
            },
            { prop: 'createTime', label: '创建日期', sortable: true, formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' },
            {
                prop: 'operation',
                label: '操作',
                width: 180,
                fixed: 'right',
                formatter: (row) =>
                    h('div', [
                        h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialog('edit', row)
                        }),
                        h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteDict(row)
                        })
                    ])
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
const handleSelectionChange = (selection: ApiListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async (formData: Partial<ApiListItem>) => {
    Object.assign(currentDictData.value, formData)
    try {
        if (dialogType.value == 'add') {
            await fetchCreateApi(currentDictData.value)
        } else {
            await fetchUpdateApi(currentDictData.value)
        }
        dialogVisible.value = false
        currentDictData.value = {}
        refreshData()
    } catch (error) {
        console.error('提交失败:', error)
    }
}

/**
 * 显示API弹窗
 */
const showDialog = (type: DialogType, row?: ApiListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentDictData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 删除API
 */
const deleteDict = (row: ApiListItem): void => {
    console.log('删除API:', row)
    ElMessageBox.confirm(`确定要删除该API吗？`, '删除API', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteApi(row.apiId as number).then(() => {
            ElMessage.success('删除成功')
            refreshData()
        }).catch(() => {
            ElMessage.error('删除失败')
        })
    })
}
</script>

<style scoped lang='scss'></style>