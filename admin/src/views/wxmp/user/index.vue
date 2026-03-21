<template>
    <div class="art-full-height">
        <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ArtExcelExport :data="selectedRows.map(item => ({
                            username: item.username,
                            nickname: item.nickname,
                            phone: item.phone,
                            sex: item.sex,
                        }))" filename="用户信息数据" :headers="{
                            username: '用户名',
                            nickname: '昵称',
                            phone: '手机号',
                            sex: '性别',
                        }" />
                    </ElSpace>
                </template>
            </ArtTableHeader>

            <!-- 表格 -->
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>

            <!-- 用户弹窗 -->
            <UserDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentUserData"
                @submit="handleDialogSubmit" />
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetWxmpUserList, fetchDeleteWxmpUser } from '@/api/wxmp/user'
import { ElTag, ElMessageBox, ElImage } from 'element-plus'
import { DialogType } from '@/types'
import { useDictStore } from '@/store/modules/dict';
import UserSearch from './modules/user-search.vue';
import UserDialog from './modules/user-dialog.vue';

const auth = useAuth()
const dictStore = useDictStore()

type UserListItem = Api.WxmpUser.UserListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentUserData = ref<Partial<UserListItem>>({})

// 选中行
const selectedRows = ref<UserListItem[]>([])

// 搜索表单
const searchForm = ref({
    username: undefined,
    nickname: undefined,
    phone: undefined,
    status: undefined
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
    core: {
        apiFn: fetchGetWxmpUserList,
        apiParams: searchForm.value,
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号' }, // 序号
            { prop: 'username', label: '用户名', showOverflowTooltip: true },
            { prop: 'nickname', label: '昵称', showOverflowTooltip: true },
            {
                prop: 'avatar',
                label: '头像',
                formatter: (row) => h(ElImage, {
                    class: 'size-9.5 rounded-md',
                    src: row.avatar || '',
                    previewSrcList: [row.avatar || ''],
                    previewTeleported: true
                }),
            },
            {
                prop: 'phone',
                label: '手机号',
                showOverflowTooltip: true
            },
            {
                prop: 'sex',
                label: '性别',
                sortable: true,
                formatter: (row) => dictStore.getDictLabel('system_user_sex', row.sex)
            },
            {
                prop: 'status',
                label: '状态',
                formatter: (row) => h(ElTag, { type: row.status ? 'success' : 'danger' }, () => row.status ? '启用' : '停用')
            },
            {
                prop: 'createTime',
                label: '创建日期',
                sortable: true,
                formatter: (row) => dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                prop: 'operation',
                label: '操作',
                width: 120,
                fixed: 'right', // 固定列
                formatter: (row) => {
                    const buttons = [];
                    if (auth.hasAuth('wxmp:user:update')) {
                        buttons.push(
                            h(ArtButtonTable, {
                                type: 'edit',
                                onClick: () => showDialog('edit', row)
                            })
                        )
                    }
                    if (auth.hasAuth('wxmp:user:delete')) {
                        buttons.push(
                            h(ArtButtonTable, {
                                type: 'delete',
                                onClick: () => deleteUser(row)
                            })
                        )
                    }
                    return h('div', buttons)
                }
            }
        ],
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
 * 显示用户弹窗
 */
const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
        dialogVisible.value = true
    })
}

/**
 * 删除用户
 */
const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(() => {
        fetchDeleteWxmpUser(row.userId as string).then(() => {
            refreshData()
        })
    }).catch(() => {
        ElMessage.info('注销已取消')
    })
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async () => {
    try {
        await refreshData()
        currentUserData.value = {}
    } catch (error) {
        console.error('提交失败:', error)
    }
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
}
</script>

<style scoped lang='scss'></style>