<template>
    <ElRow class="dict-page art-full-height" :gutter="20">
        <ElCol :span="12">
            <DictTypeSearch v-model="searchForm" @search="handleSearchType" @reset="resetSearchParamsType" />
            <ElCard class="art-table-card" shadow="never" v-model:columns="columnChecksType" :loading="loadingType"
                @refresh="refreshDataType"></ElCard>
        </ElCol>
        <ElCol :span="12">
            <DictDataSearch v-model="searchForm" @search="handleSearchData" @reset="resetSearchParamsData" />
        </ElCol>
    </ElRow>
</template>

<script setup lang="ts">
import DictTypeSearch from './modules/dict-type-search.vue';
import DictDataSearch from './modules/dict-data-search.vue';
import DictTypeDialog from './modules/dict-type-dialog.vue';
import { useTable } from '@/hooks/core/useTable'

// 搜索表单
const searchForm = ref({
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
        apiFn: () => Promise.resolve({
            code: 200,
            data: {
                current: 1,
                size: 20,
                total: 100,
                records: []
            }
        }),
        apiParams: {
            current: 1,
            size: 20,
            ...searchForm.value
        },
        // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
        // paginationKey: {
        //   current: 'pageNum',
        //   size: 'pageSize'
        // },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            { prop: 'userPhone', label: '手机号' },
            {
                prop: 'createTime',
                label: '创建日期',
                sortable: true
            },
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
        apiFn: () => Promise.resolve({
            code: 200,
            data: {
                current: 1,
                size: 20,
                total: 100,
                records: []
            }
        }),
        apiParams: {
            current: 1,
            size: 20,
            ...searchForm.value
        },
        // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
        // paginationKey: {
        //   current: 'pageNum',
        //   size: 'pageSize'
        // },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            { prop: 'userPhone', label: '手机号' },
            {
                prop: 'createTime',
                label: '创建日期',
                sortable: true
            },
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
    //   Object.assign(searchParams, params)
    //   getData()
}

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearchData = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    //   Object.assign(searchParams, params)
    //   getData()
}

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