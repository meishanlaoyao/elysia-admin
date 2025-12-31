<template>
    <div class="dept-page art-full-height">
        <DeptSearch v-model="searchForm" @search="handleSearch" @reset="() => { }" />
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader :showZebra="false" :loading="loading" v-model:columns="columnChecks" @refresh="getData">
                <template #left>
                    <ElButton @click="showDialog('add')" v-ripple>添加部门</ElButton>
                    <ElButton @click="toggleExpand" v-ripple>
                        {{ isExpanded ? '收起' : '展开' }}
                    </ElButton>
                </template>
            </ArtTableHeader>
            <ArtTable ref="tableRef" rowKey="path" :loading="loading" :columns="columns" :data="tableData"
                :stripe="false" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                :default-expand-all="false" />
            <DeptDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentDictData"
                @submit="handleDialogSubmit" />
        </ElCard>
    </div>
</template>

<script setup lang='ts'>
import dayjs from 'dayjs'
import { ElTag, ElMessageBox } from 'element-plus'
import { useTableColumns } from '@/hooks/core/useTableColumns'
import { DialogType } from '@/types'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { fetchCreateDept, fetchDeleteDept, fetchGetDeptTree, fetchUpdateDept } from '@/api/system/dept'
import DeptSearch from './modules/dept-search.vue'
import DeptDialog from './modules/dept-dialog.vue'

type DeptListItem = Api.SystemDept.DeptListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentDictData = ref<Partial<DeptListItem>>({})

// 状态管理
const loading = ref(false)
const isExpanded = ref(false)
const tableRef = ref()

// 数据相关
const tableData = ref<DeptListItem[]>([])

// 搜索表单
const searchForm = ref({
    deptName: undefined,
})

// 表格列配置
const { columnChecks, columns } = useTableColumns(() => [
    {
        prop: 'deptName',
        label: '部门名称',
    },
    {
        prop: 'sort',
        label: '排序',
    },
    {
        prop: 'status',
        label: '状态',
        formatter: (row: DeptListItem) => h(ElTag, { type: row?.status ? 'success' : 'danger' }, () => row?.status ? '启用' : '停用')
    },
    {
        prop: 'createTime',
        label: '创建时间',
        formatter: (row: DeptListItem) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        prop: 'operation',
        label: '操作',
        width: 180,
        align: 'right',
        formatter: (row: DeptListItem) => {
            const buttonStyle = { style: 'text-align: right' }
            return h('div', buttonStyle, [
                h(ArtButtonTable, {
                    type: 'add',
                    onClick: () => showDialog('add', { parentId: row.deptId })
                }),
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
    }
])

/**
 * 获取数据
 */
const getData = async (): Promise<void> => {
    loading.value = true
    try {
        const list = await fetchGetDeptTree(searchForm.value)
        tableData.value = list
    } catch (error) {
        throw error instanceof Error ? error : new Error('获取部门列表失败')
    } finally {
        loading.value = false
    }
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async (formData: Partial<DeptListItem>) => {
    Object.assign(currentDictData.value, formData)
    try {
        if (dialogType.value == 'add') {
            await fetchCreateDept(currentDictData.value)
        } else {
            await fetchUpdateDept(currentDictData.value)
        }
        dialogVisible.value = false
        currentDictData.value = {}
        getData()
    } catch (error) {
        console.error('提交失败:', error)
    }
}

/**
 * 显示API弹窗
 */
const showDialog = (type: DialogType, row?: DeptListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentDictData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}


/**
 * 删除
 */
const deleteDict = (row: DeptListItem): void => {
    console.log('删除部门:', row)
    ElMessageBox.confirm(`确定要删除该 ${row.deptName} 吗？`, '删除部门', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteDept(row.deptId as number).then(() => {
            ElMessage.success('删除成功')
            getData()
        }).catch(() => {
            ElMessage.error('删除失败')
        })
    })
}

/**
 * 切换展开/收起所有菜单
 */
const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
        // if (tableRef.value?.elTableRef && filteredTableData.value) {
        //   const processRows = (rows: AppRouteRecord[]) => {
        //     rows.forEach((row) => {
        //       if (row.children?.length) {
        //         tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
        //         processRows(row.children)
        //       }
        //     })
        //   }
        //   processRows(filteredTableData.value)
        // }
    })
}

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchForm.value, params)
    getData()
}

onMounted(() => {
    getData()
})
</script>

<style scoped lang='scss'>
.dept-page {}
</style>