<template>
    <div class="online-page art-full-height">
        <ElCard class="art-table-card" shadow="never">
            <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
                <template #left>
                    <ElSpace wrap>
                        <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchForceLogout"
                            v-ripple v-auth="'monitor:online:forceLogout'">
                            批量强退
                        </ElButton>
                    </ElSpace>
                </template>
            </ArtTableHeader>
            <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
                @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
                @pagination:current-change="handleCurrentChange">
            </ArtTable>
        </ElCard>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetOnlineList, fetchForceLogout } from '@/api/monitor/online'
import { useDictStore } from '@/store/modules/dict';

defineOptions({ name: 'OnlineUser' })

const dictStore = useDictStore()
const auth = useAuth()

type OnlineListItem = Api.MonitorOnline.OnlineListItem

// 选中行
const selectedRows = ref<OnlineListItem[]>([])

const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
} = useTable({
    // 核心配置
    core: {
        apiFn: fetchGetOnlineList,
        apiParams: {},
        paginationKey: { current: 'pageNum', size: 'pageSize' },
        columnsFactory: () => [
            { type: 'selection' }, // 勾选列
            { type: 'index', width: 60, label: '序号', align: 'center' }, // 序号
            { prop: 'username', label: '用户名', align: 'center' },
            { prop: 'email', label: '邮箱', align: 'center', showOverflowTooltip: true },
            { prop: 'phone', label: '手机号', align: 'center', showOverflowTooltip: true },
            {
                prop: 'sex',
                label: '性别',
                align: 'center',
                formatter: (row) => dictStore.getDictLabel('system_user_sex', row.sex)
            },
            {
                prop: 'userType',
                label: '用户类型',
                align: 'center',
                formatter: (row: OnlineListItem) => h(
                    ElTag,
                    { type: dictStore.getTagType('system_user_type', row.userType) },
                    () => dictStore.getDictLabel('system_user_type', row.userType)
                )
            },
            { prop: 'ipaddr', label: 'IP地址', align: 'center', showOverflowTooltip: true },
            { prop: 'loginLocation', label: '登录地点', align: 'center', showOverflowTooltip: true },
            {
                prop: 'loginTime',
                label: '登录时间',
                align: 'center',
                showOverflowTooltip: true,
                sortable: true,
                formatter: (row: OnlineListItem) =>
                    row.loginTime ? dayjs(row.loginTime).format('YYYY-MM-DD HH:mm:ss') : ''
            },
            {
                prop: 'operation',
                label: '操作',
                width: 100,
                align: 'center',
                fixed: 'right',
                formatter: (row: OnlineListItem) => {
                    const buttons = []
                    if (auth.hasAuth('monitor:online:forceLogout')) {
                        buttons.push(h(ArtButtonTable, {
                            type: 'delete',
                            text: '强退',
                            onClick: () => forceLogout(row)
                        }))
                    }
                    return buttons
                }
            }
        ]
    }
})

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: OnlineListItem[]): void => {
    selectedRows.value = selection
}

/**
 * 强退用户
 */
const forceLogout = (row: OnlineListItem): void => {
    ElMessageBox.confirm(`确定要强制退出用户 "${row.username}" 吗？`, '强制退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        fetchForceLogout(row.userId).then(() => {
            refreshData()
        })
    })
}

/**
 * 批量强退
 */
const handleBatchForceLogout = (): void => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要强退的用户')
        return
    }

    ElMessageBox.confirm(`确定要强制退出选中的 ${selectedRows.value.length} 个用户吗？`, '批量强退', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const ids = selectedRows.value.map((item) => item.userId)
        fetchForceLogout(ids).then(() => {
            refreshData()
        })
    })
}
</script>

<style scoped lang="scss"></style>