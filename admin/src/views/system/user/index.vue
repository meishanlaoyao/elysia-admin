<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange">
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog v-model:visible="dialogVisible" :type="dialogType" :user-data="currentUserData"
        @submit="handleDialogSubmit" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetUserList } from '@/api/system/user'
import UserSearch from './modules/user-search.vue'
import UserDialog from './modules/user-dialog.vue'
import { ElTag, ElMessageBox, ElImage } from 'element-plus'
import { DialogType } from '@/types'
import { useDictStore } from '@/store/modules/dict';

const dictStore = useDictStore()

defineOptions({ name: 'User' })

type UserListItem = Api.SystemUser.UserListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentUserData = ref<Partial<UserListItem>>({})

// 选中行
const selectedRows = ref<UserListItem[]>([])

// 搜索表单
const searchForm = ref({
  username: undefined,
  userGender: undefined,
  userPhone: undefined,
  userEmail: undefined,
  status: '1'
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
    apiFn: fetchGetUserList,
    apiParams: {
      current: 1,
      size: 20,
      // ...searchForm.value
    },
    // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
    paginationKey: {
      current: 'pageNum',
      size: 'pageSize'
    },
    columnsFactory: () => [
      { type: 'selection' }, // 勾选列
      { type: 'index', width: 60, label: '序号' }, // 序号
      {
        prop: 'userInfo',
        label: '用户名',
        width: 280,
        formatter: (row) => {
          return h('div', { class: 'user flex-c' }, [
            h(ElImage, {
              class: 'size-9.5 rounded-md',
              src: row.avatar || '',
              previewSrcList: [row.avatar || ''],
              // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
              previewTeleported: true
            }),
            h('div', { class: 'ml-2' }, [
              h('p', { class: 'user-name' }, row.nickname),
              h('p', { class: 'email' }, row.email)
            ])
          ])
        }
      },
      {
        prop: 'userGender',
        label: '性别',
        sortable: true,
        formatter: (row) => dictStore.getDictLabel('system_user_sex', row.sex)
      },
      { prop: 'phone', label: '手机号' },
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
        formatter: (row) =>
          h('div', [
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => showDialog('edit', row)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => deleteUser(row)
            })
          ])
      }
    ]
  },
  // 数据处理
  transform: {
    // 数据转换器 - 替换头像
    dataTransformer: (records) => {
      // 类型守卫检查
      if (!Array.isArray(records)) {
        console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
        return []
      }

      // 使用本地头像替换接口返回的头像
      return records.map((item, index: number) => {
        return {
          ...item,
          avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
        }
      })
    }
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
  console.log('删除用户:', row)
  ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('注销成功')
  })
}

/**
 * 处理弹窗提交事件
 */
const handleDialogSubmit = async () => {
  try {
    dialogVisible.value = false
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
