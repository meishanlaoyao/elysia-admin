<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <RoleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams">
    </RoleSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'system:role:create'" @click="showDialog('add')" v-ripple>新增角色</ElButton>
            <ElButton v-auth="'system:role:delete'" type="danger" :disabled="selectedRows.length === 0"
              @click="handleBatchDelete" v-ripple>
              批量删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange">
      </ArtTable>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog v-model="dialogVisible" :dialog-type="dialogType" :role-data="currentRoleData"
      @submit="refreshData" />

    <!-- 菜单权限弹窗 -->
    <RolePermissionDialog v-model="permissionDialog" :role-data="currentRoleData" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetRoleList, fetchDeleteRole } from '@/api/system/role'
import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
import RoleSearch from './modules/role-search.vue'
import RoleEditDialog from './modules/role-edit-dialog.vue'
import RolePermissionDialog from './modules/role-permission-dialog.vue'
import { ElTag, ElMessageBox } from 'element-plus'

defineOptions({ name: 'Role' })

type RoleListItem = Api.SystemRole.RoleListItem

// 选中行
const selectedRows = ref<RoleListItem[]>([])
const auth = useAuth()

// 搜索表单
const searchForm = ref({
  roleName: undefined,
  roleCode: undefined,
  description: undefined,
  enabled: undefined,
  daterange: undefined
})

const dialogVisible = ref(false)
const permissionDialog = ref(false)
const currentRoleData = ref<RoleListItem | undefined>(undefined)

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
    apiFn: fetchGetRoleList,
    apiParams: searchForm.value,
    paginationKey: { current: 'pageNum', size: 'pageSize' },
    excludeParams: ['daterange'],
    columnsFactory: () => [
      { type: 'selection' }, // 勾选列
      { type: 'index', width: 60, label: '序号' }, // 序号
      {
        prop: 'roleName',
        label: '角色名称',
        align: 'center',
      },
      {
        prop: 'roleCode',
        label: '角色编码'
      },
      {
        prop: 'remark',
        label: '角色描述',
        showOverflowTooltip: true
      },
      {
        prop: 'enabled',
        label: '角色状态',
        formatter: (row) => {
          const statusConfig = row.status
            ? { type: 'success', text: '启用' }
            : { type: 'warning', text: '禁用' }
          return h(
            ElTag,
            { type: statusConfig.type as 'success' | 'warning' },
            () => statusConfig.text
          )
        }
      },
      {
        prop: 'createTime',
        label: '创建日期',
        sortable: true,
        formatter: (row) => row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      {
        prop: 'operation',
        label: '操作',
        width: 80,
        fixed: 'right',
        formatter: (row) => {
          const buttons: ButtonMoreItem[] = [];
          if (auth.hasAuth('system:role:update')) {
            buttons.push({
              key: 'permission',
              label: '菜单权限',
              icon: 'ri:user-3-line',
            })
            buttons.push({
              key: 'edit',
              label: '编辑角色',
              icon: 'ri:edit-2-line'
            })
          }
          if (auth.hasAuth('system:role:delete')) {
            buttons.push({
              key: 'delete',
              label: '删除角色',
              icon: 'ri:delete-bin-4-line',
              color: '#f56c6c'
            })
          }
          return h('div', [
            h(ArtButtonMore, {
              list: buttons,
              onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
            })
          ])
        }
      }
    ]
  }
})

const dialogType = ref<'add' | 'edit'>('add')

const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
  dialogVisible.value = true
  dialogType.value = type
  currentRoleData.value = row
}

/**
 * 搜索处理
 * @param params 搜索参数
 */
const handleSearch = (params: Record<string, any>) => {
  // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
  const { daterange, ...filtersParams } = params
  const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

  // 搜索参数赋值
  Object.assign(searchParams, { ...filtersParams, startTime, endTime })
  getData()
}

const buttonMoreClick = (item: ButtonMoreItem, row: RoleListItem) => {
  switch (item.key) {
    case 'permission':
      showPermissionDialog(row)
      break
    case 'edit':
      showDialog('edit', row)
      break
    case 'delete':
      deleteRole(row)
      break
  }
}

const showPermissionDialog = (row?: RoleListItem) => {
  permissionDialog.value = true
  currentRoleData.value = row
}

const deleteRole = (row: RoleListItem) => {
  ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      fetchDeleteRole(row.roleId as number).then(() => {
        ElMessage.success('删除成功')
        refreshData()
      }).catch(() => {
        ElMessage.error('删除失败')
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: RoleListItem[]): void => {
  selectedRows.value = selection
  console.log('选中行数据:', selectedRows.value)
}

/**
 * 批量删除角色
 */
const handleBatchDelete = (): void => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  const roleNames = selectedRows.value.map((item) => item.roleName).join('、')
  ElMessageBox.confirm(`确定要删除以下角色吗？此操作不可恢复！\n${roleNames}`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map((item) => item.roleId as number)
    fetchDeleteRole(ids)
      .then(() => {
        ElMessage.success('批量删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.error('批量删除失败')
      })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>
