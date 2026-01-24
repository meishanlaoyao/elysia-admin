<template>
    <div class="art-full-height">
        <DictDataSearch v-model="searchFormData" :dict-type-list="cacheDictType" @search="handleSearchData"
            @reset="resetSearchParamsData" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecksData" :loading="loadingData" @refresh="refreshDataData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton v-ripple @click="showDialogData('add')">新增数据</ElButton>
                        <ElButton type="danger" :disabled="selectedRowsData.length === 0" @click="handleBatchDeleteData"
                            v-ripple>
                            批量删除
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loadingData" :data="dataData" :columns="columnsData" :pagination="paginationData"
                @selection-change="handleSelectionChangeData" @pagination:size-change="handleSizeChangeData"
                @pagination:current-change="handleCurrentChangeData">
            </ArtTable>
            <DictDataDialog v-model:visible="dialogVisibleData" :type="dialogTypeData" :data="currentDictDataData"
                :dict-type-list="cacheDictType" @submit="refreshDataData" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import DictDataSearch from './dict-data-search.vue';
import DictDataDialog from './dict-data-dialog.vue';
import { useTable } from '@/hooks/core/useTable';
import {
    fetchGetDictDataList,
    fetchDeleteDictData
} from '@/api/system/dict';
import { DialogType } from '@/types'

type DictTypeListItem = Api.SystemDict.DictTypeListItem
type DictDataListItem = Api.SystemDict.DictDataListItem

// 定义组件的props和emits
const props = defineProps<{
    cacheDictType: DictTypeListItem[]
    selectedDictType?: string
}>()

// 弹窗相关
const dialogTypeData = ref<DialogType>('add')
const dialogVisibleData = ref(false)
const currentDictDataData = ref<Partial<DictDataListItem>>({})

// 选中行
const selectedRowsData = ref<DictDataListItem[]>([])

// 搜索表单
const searchFormData = ref({
    dictName: undefined,
    dictType: props.selectedDictType || undefined,
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
            { prop: 'createTime', label: '创建日期', sortable: true, showOverflowTooltip: true, formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' },
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

// 监听选中的字典类型变化
watch(() => props.selectedDictType, (newVal) => {
    if (newVal) {
        searchParamsData.dictType = newVal
        searchFormData.value.dictType = newVal as never
        getDictData()
    }
})

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
const handleSelectionChangeData = (selection: DictDataListItem[]): void => {
    selectedRowsData.value = selection
    console.log('选中行数据:', selectedRowsData.value)
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

/**
 * 批量删除字典数据
 */
const handleBatchDeleteData = (): void => {
    if (selectedRowsData.value.length === 0) {
        ElMessage.warning('请选择要删除的数据')
        return
    }

    const dictLabels = selectedRowsData.value.map((item) => item.dictLabel).join('、')
    ElMessageBox.confirm(`确定要删除以下字典数据吗？\n${dictLabels}`, '批量删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        const ids = selectedRowsData.value.map((item) => item.dictCode as number)
        fetchDeleteDictData(ids)
            .then(() => {
                ElMessage.success('批量删除成功')
                refreshDataData()
            })
            .catch(() => {
                ElMessage.error('批量删除失败')
            })
    })
}
</script>

<style scoped lang='scss'></style>