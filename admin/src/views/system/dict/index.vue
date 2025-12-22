<template>
    <ElRow class="dict-page art-full-height" :gutter="20">
        <ElCol :span="12">
            <DictTypeSearch v-model="searchFormType" @search="handleSearchType" @reset="resetSearchParamsType" />
            <ElCard class="art-table-card" shadow="never">
                <ArtTableHeader v-model:columns="columnChecksType" :loading="loadingType" @refresh="refreshDataType">
                    <template #left>
                        <ElSpace wrap>
                            <ElButton v-ripple @click="showDialogType('add')">新增类型</ElButton>
                        </ElSpace>
                    </template>
                </ArtTableHeader>
                <ArtTable :loading="loadingType" :data="dataType" :columns="columnsType" :pagination="paginationType"
                    @selection-change="handleSelectionChangeType" @pagination:size-change="handleSizeChangeType"
                    @pagination:current-change="handleCurrentChangeType">
                </ArtTable>
                <DictTypeDialog v-model:visible="dialogVisibleType" :type="dialogTypeType" :data="currentDictDataType"
                    @submit="handleDialogSubmitType" />
            </ElCard>
        </ElCol>
        <ElCol :span="12">
            <DictDataSearch v-model="searchFormData" :dict-type-list="cacheDictType" @search="handleSearchData"
                @reset="resetSearchParamsData" />
            <ElCard class="art-table-card" shadow="never">
                <ArtTableHeader v-model:columns="columnChecksData" :loading="loadingData" @refresh="refreshDataData">
                    <template #left>
                        <ElSpace wrap>
                            <ElButton v-ripple @click="showDialogData('add')">新增数据</ElButton>
                        </ElSpace>
                    </template>
                </ArtTableHeader>
                <ArtTable :loading="loadingData" :data="dataData" :columns="columnsData" :pagination="paginationData"
                    @selection-change="handleSelectionChangeData" @pagination:size-change="handleSizeChangeData"
                    @pagination:current-change="handleCurrentChangeData">
                </ArtTable>
                <DictDataDialog v-model:visible="dialogVisibleData" :type="dialogTypeData" :data="currentDictDataData"
                    :dict-type-list="cacheDictType" @submit="handleDialogSubmitData" />
            </ElCard>
        </ElCol>
    </ElRow>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import DictTypeSearch from './modules/dict-type-search.vue';
import DictDataSearch from './modules/dict-data-search.vue';
import DictTypeDialog from './modules/dict-type-dialog.vue';
import DictDataDialog from './modules/dict-data-dialog.vue';
import { useTable } from '@/hooks/core/useTable';
import {
    fetchGetDictTypeList,
    fetchGetDictDataList,
    fetchCreateDictData,
    fetchCreateDictType,
    fetchUpdateDictType,
    fetchUpdateDictData,
    fetchDeleteDictType,
    fetchDeleteDictData,
    fetchGetCacheDictTypeList
} from '@/api/system/dict';
import { DialogType } from '@/types'

type DictTypeListItem = Api.SystemDict.DictTypeListItem
type DictDataListItem = Api.SystemDict.DictDataListItem

const cacheDictType = ref<DictTypeListItem[]>([])

// 弹窗相关
const dialogTypeType = ref<DialogType>('add')
const dialogVisibleType = ref(false)
const currentDictDataType = ref<Partial<DictTypeListItem>>({})

const dialogTypeData = ref<DialogType>('add')
const dialogVisibleData = ref(false)
const currentDictDataData = ref<Partial<DictDataListItem>>({})

// 选中行
const selectedRowsData = ref<DictDataListItem[]>([])
const selectedRowsType = ref<DictTypeListItem[]>([])

// 搜索表单
const searchFormType = ref({
    dictName: undefined,
    dictType: undefined,
})

// 搜索表单
const searchFormData = ref({
    dictName: undefined,
    dictType: undefined,
})

const {
    columns: columnsType,
    columnChecks: columnChecksType,
    data: dataType,
    loading: loadingType,
    pagination: paginationType,
    getData: getDataType,
    searchParams: searchParamsType,
    resetSearchParams: resetSearchParamsType,
    handleSizeChange: handleSizeChangeType,
    handleCurrentChange: handleCurrentChangeType,
    refreshData: refreshDataType,
} = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetDictTypeList,
        apiParams: searchFormType.value,
        // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            { prop: 'dictName', label: '字典名称' },
            { prop: 'dictType', label: '字典类型' },
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
                            onClick: () => showDialogType('edit', row)
                        }),
                        h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteDictType(row)
                        }),
                        h(ArtButtonTable, {
                            type: 'view',
                            onClick: () => chooseDictType(row)
                        })
                    ])
            }
        ]
    }
})

const {
    columns: columnsData,
    columnChecks: columnChecksData,
    data: dataData,
    loading: loadingData,
    pagination: paginationData,
    getData: getDictData,
    searchParams: searchParamsData,
    resetSearchParams: resetSearchParamsData,
    handleSizeChange: handleSizeChangeData,
    handleCurrentChange: handleCurrentChangeData,
    refreshData: refreshDataData,
} = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetDictDataList,
        apiParams: searchFormData.value,
        // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
        paginationKey: {
            current: 'pageNum',
            size: 'pageSize'
        },
        columnsFactory: () => [
            { type: 'selection' },
            { type: 'index', width: 60, label: '序号' },
            { prop: 'dictLabel', label: '字典标签' },
            { prop: 'dictValue', label: '字典值' },
            { prop: 'dictSort', label: '字典排序' },
            { prop: 'createTime', label: '创建日期', sortable: true, formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                fixed: 'right',
                formatter: (row) =>
                    h('div', [
                        h(ArtButtonTable, {
                            type: 'edit',
                            onClick: () => showDialogData('edit', row)
                        }),
                        h(ArtButtonTable, {
                            type: 'delete',
                            onClick: () => deleteDictData(row)
                        })
                    ])
            }
        ]
    }
})

function getCacheDictTypeList() {
    fetchGetCacheDictTypeList().then(res => {
        cacheDictType.value = res
    })
}

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearchType = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParamsType, params)
    getDataType()
}

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearchData = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParamsData, params)
    getDictData()
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChangeType = (selection: DictTypeListItem[]): void => {
    selectedRowsType.value = selection
    console.log('选中行数据:', selectedRowsType.value)
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChangeData = (selection: DictDataListItem[]): void => {
    selectedRowsData.value = selection
    console.log('选中行数据:', selectedRowsData.value)
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmitType = async (formData: Partial<DictTypeListItem>) => {
    Object.assign(currentDictDataType.value, formData)
    try {
        if (dialogTypeType.value == 'add') {
            await fetchCreateDictType(currentDictDataType.value)
        } else {
            await fetchUpdateDictType(currentDictDataType.value)
        }
        dialogVisibleType.value = false
        currentDictDataType.value = {}
        refreshDataType()
        getCacheDictTypeList()
    } catch (error) {
        console.error('提交失败:', error)
    }
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmitData = async (formData: Partial<DictDataListItem>) => {
    Object.assign(currentDictDataData.value, formData)
    try {
        if (dialogTypeData.value == 'add') {
            await fetchCreateDictData(currentDictDataData.value)
        } else {
            await fetchUpdateDictData(currentDictDataData.value)
        }
        dialogVisibleData.value = false
        currentDictDataData.value = {}
        refreshDataData()
    } catch (error) {
        console.error('提交失败:', error)
    }
}

/**
 * 显示字典类型弹窗
 */
const showDialogType = (type: DialogType, row?: DictTypeListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogTypeType.value = type
    currentDictDataType.value = row || {}
    nextTick(() => {
        dialogVisibleType.value = true
    })
}

/**
 * 显示字典数据弹窗
 */
const showDialogData = (type: DialogType, row?: DictDataListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogTypeData.value = type
    currentDictDataData.value = row || { dictType: searchFormData.value.dictType }
    nextTick(() => {
        dialogVisibleData.value = true
    })
}

/**
 * 删除字典类型
 */
const deleteDictType = (row: DictTypeListItem): void => {
    console.log('删除字典类型:', row)
    ElMessageBox.confirm(`确定要删除该字典类型吗？`, '删除字典类型', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteDictType(row.dictId as number).then(() => {
            ElMessage.success('删除成功')
            refreshDataType()
        }).catch(() => {
            ElMessage.error('删除失败')
        })
    })
}

/**
 * 删除字典数据
 */
const deleteDictData = (row: DictDataListItem): void => {
    console.log('删除字典数据:', row)
    ElMessageBox.confirm(`确定要删除该字典数据吗？`, '删除字典数据', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteDictData(row.dictCode as number).then(() => {
            ElMessage.success('删除成功')
            refreshDataData()
        }).catch(() => {
            ElMessage.error('删除失败')
        })
    })
}

function chooseDictType(row: DictTypeListItem) {
    searchParamsData.dictType = row.dictType
    searchFormData.value.dictType = row.dictType as never
    getDictData()
}

onMounted(() => {
    getCacheDictTypeList()
})
</script>

<style scoped lang='scss'>
.dict-page {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;

    :deep(.el-col) {
        flex: 0 0 50% !important;
        max-width: 50% !important;
        width: 50% !important;
    }
}
</style>