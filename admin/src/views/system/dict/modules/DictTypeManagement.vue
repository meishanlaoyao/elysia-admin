<template>
    <div class="art-full-height">
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
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import DictTypeSearch from './dict-type-search.vue';
import DictTypeDialog from './dict-type-dialog.vue';
import { useTable } from '@/hooks/core/useTable';
import {
    fetchGetDictTypeList,
    fetchCreateDictType,
    fetchUpdateDictType,
    fetchDeleteDictType,
} from '@/api/system/dict';
import { DialogType } from '@/types'

type DictTypeListItem = Api.SystemDict.DictTypeListItem

// 定义组件的props和emits
const props = defineProps<{
    cacheDictType: DictTypeListItem[]
}>()

const emit = defineEmits<{
    'refresh-cache': []
    'choose-dict-type': [dictType: string]
}>()

// 弹窗相关
const dialogTypeType = ref<DialogType>('add')
const dialogVisibleType = ref(false)
const currentDictDataType = ref<Partial<DictTypeListItem>>({})

// 选中行
const selectedRowsType = ref<DictTypeListItem[]>([])

// 搜索表单
const searchFormType = ref({
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
 * 处理表格行选择变化
 */
const handleSelectionChangeType = (selection: DictTypeListItem[]): void => {
    selectedRowsType.value = selection
    console.log('选中行数据:', selectedRowsType.value)
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
        emit('refresh-cache')
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

function chooseDictType(row: DictTypeListItem) {
    emit('choose-dict-type', row.dictType as string)
}
</script>

<style scoped lang='scss'></style>