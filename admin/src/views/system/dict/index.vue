<template>
    <ElRow class="dict-page art-full-height" :gutter="20">
        <ElCol :span="12">
            <DictSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />
        </ElCol>
        <ElCol :span="12">

        </ElCol>
    </ElRow>
</template>

<script setup lang="ts">
import DictSearch from './modules/dict-search.vue';
import DictDialog from './modules/dict-dialog.vue';
import { useTable } from '@/hooks/core/useTable'

// 搜索表单
const searchForm = ref({
    dictName: undefined,
    dictType: undefined,
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
    refreshData
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
const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    //   Object.assign(searchParams, params)
    //   getData()
}

</script>

<style scoped lang='scss'></style>