<!-- 用户管理 -->
<template>
  <div class="user-page art-full-height">
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card user-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'system:user:create'" @click="showDialog('add')" v-ripple>
              <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
              新增用户
            </ElButton>
            <ArtExcelExport :data="exportRows" filename="用户信息数据" :headers="exportHeaders" />
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange" />
    </ElCard>

    <UserDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentUserData"
      @submit="handleDialogSubmit" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetUserList, fetchDeleteUser } from '@/api/system/user'
import UserSearch from './modules/user-search.vue'
import UserDialog from './modules/user-dialog.vue'
import { ElMessageBox, ElImage } from 'element-plus'
import { DialogType } from '@/types'
import { useDictStore } from '@/store/modules/dict'

const auth = useAuth()
const dictStore = useDictStore()

defineOptions({ name: 'User' })

type UserListItem = Api.SystemUser.UserListItem

const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentUserData = ref<Partial<UserListItem>>({})
const selectedRows = ref<UserListItem[]>([])

const searchForm = ref({
  username: undefined,
  nickname: undefined,
  email: undefined,
  phone: undefined,
  status: undefined
})

const exportHeaders = {
  username: '用户名',
  nickname: '昵称',
  email: '邮箱',
  phone: '手机号',
  sex: '性别'
}

const exportRows = computed(() =>
  selectedRows.value.map((item) => ({
    username: item.username,
    nickname: item.nickname,
    email: item.email,
    phone: item.phone,
    sex: item.sex
  }))
)

const AVATAR_TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d'] as const

const pickTone = (seed?: string) => {
  const text = seed || '?'
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash + text.charCodeAt(i) * (i + 1)) % 97
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}

const getInitial = (row: UserListItem) => {
  const source = (row.nickname || row.username || '?').trim()
  return source.slice(0, 1).toUpperCase()
}

const formatPhone = (phone?: string) => {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
  return phone
}

const renderUserCell = (row: UserListItem) => {
  const tone = pickTone(row.username || row.nickname)
  const avatarNode = row.avatar
    ? h(ElImage, {
      class: 'user-avatar__img',
      src: row.avatar,
      previewSrcList: [row.avatar],
      previewTeleported: true,
      fit: 'cover'
    })
    : h('span', { class: 'user-avatar__initial' }, getInitial(row))

  return h('div', { class: 'user-identity' }, [
    h('div', { class: ['user-avatar', tone] }, [avatarNode]),
    h('div', { class: 'user-identity__body' }, [
      h('div', { class: 'user-identity__name' }, row.nickname || '未命名'),
      h('div', { class: 'user-identity__sub' }, [
        h('span', { class: 'user-identity__handle' }, `@${row.username || '—'}`),
        row.email
          ? h('span', { class: 'user-identity__mail', title: row.email }, row.email)
          : null
      ])
    ])
  ])
}

const renderStatus = (row: UserListItem) =>
  h(
    'span',
    { class: ['status-pill', row.status ? 'is-on' : 'is-off'] },
    [h('i', { class: 'status-pill__dot' }), h('span', row.status ? '启用' : '停用')]
  )

const renderTime = (row: UserListItem) => {
  if (!row.createTime) return h('span', { class: 'time-empty' }, '—')
  const d = dayjs(row.createTime)
  return h('div', { class: 'time-cell' }, [
    h('div', { class: 'time-date' }, d.format('YYYY-MM-DD')),
    h('div', { class: 'time-clock' }, d.format('HH:mm:ss'))
  ])
}

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
    apiFn: fetchGetUserList,
    apiParams: searchForm.value,
    paginationKey: {
      current: 'pageNum',
      size: 'pageSize'
    },
    columnsFactory: () => [
      { type: 'selection' },
      { type: 'index', width: 56, label: '#' },
      {
        prop: 'userInfo',
        label: '用户',
        minWidth: 280,
        formatter: (row) => renderUserCell(row)
      },
      {
        prop: 'userGender',
        label: '性别',
        width: 88,
        sortable: true,
        formatter: (row) =>
          h(
            'span',
            { class: 'sex-chip' },
            dictStore.getDictLabel('system_user_sex', row.sex) || '—'
          )
      },
      {
        prop: 'phone',
        label: '手机号',
        minWidth: 140,
        formatter: (row) => h('span', { class: 'phone-cell' }, formatPhone(row.phone))
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row) => renderStatus(row)
      },
      {
        prop: 'createTime',
        label: '创建时间',
        minWidth: 130,
        sortable: true,
        formatter: (row) => renderTime(row)
      },
      {
        prop: 'operation',
        label: '操作',
        width: 120,
        fixed: 'right',
        formatter: (row) => {
          const buttons = []
          if (auth.hasAuth('system:user:update')) {
            buttons.push(
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              })
            )
          }
          if (auth.hasAuth('system:user:delete')) {
            buttons.push(
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            )
          }
          return h('div', { class: 'op-cell' }, buttons)
        }
      }
    ]
  }
})

const handleSearch = (params: Record<string, any>) => {
  Object.assign(searchParams, params)
  getData()
}

const showDialog = (type: DialogType, row?: UserListItem): void => {
  dialogType.value = type
  currentUserData.value = row || {}
  nextTick(() => {
    dialogVisible.value = true
  })
}

const deleteUser = (row: UserListItem): void => {
  ElMessageBox.confirm(`确定要注销用户「${row.nickname || row.username}」吗？`, '注销用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(() => {
      fetchDeleteUser(row.userId as string).then(() => {
        refreshData()
      })
    })
    .catch(() => {
      ElMessage.info('注销已取消')
    })
}

const handleDialogSubmit = async () => {
  try {
    await refreshData()
    currentUserData.value = {}
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleSelectionChange = (selection: UserListItem[]): void => {
  selectedRows.value = selection
}
</script>

<style scoped lang="scss">
.user-page {
  --user-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

.user-table-card {
  position: relative;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

:deep(.user-identity) {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 2px 0;
}

:deep(.user-avatar) {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--art-card-border) 80%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 35%, transparent);
  transition: transform 0.25s var(--user-ease);

  &.tone-a {
    background: linear-gradient(145deg, #2f343a, #1e2328);
    color: #f3f0ea;
  }

  &.tone-b {
    background: linear-gradient(145deg, #3a4a46, #24312e);
    color: #e8f0ec;
  }

  &.tone-c {
    background: linear-gradient(145deg, #3d3a45, #26232c);
    color: #efeaf5;
  }

  &.tone-d {
    background: linear-gradient(145deg, #4a4036, #2c2620);
    color: #f5efe6;
  }
}

:deep(.user-avatar__img) {
  width: 100%;
  height: 100%;
  display: block;
}

:deep(.user-avatar__initial) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

:deep(.user-identity__body) {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.user-identity__name) {
  font-size: 14px;
  font-weight: 600;
  color: var(--art-gray-900);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.user-identity__sub) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12px;
  color: var(--art-gray-500);
}

:deep(.user-identity__handle) {
  flex-shrink: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--art-gray-600);
}

:deep(.user-identity__mail) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.85;
}

:deep(.status-pill) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
}

:deep(.status-pill__dot) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

:deep(.status-pill.is-on) {
  color: var(--el-color-success);
  background: color-mix(in srgb, var(--el-color-success) 10%, transparent);
  border-color: color-mix(in srgb, var(--el-color-success) 22%, transparent);

  .status-pill__dot {
    background: currentColor;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-success) 18%, transparent);
    animation: status-breathe 2.4s ease-in-out infinite;
  }
}

:deep(.status-pill.is-off) {
  color: var(--art-gray-600);
  background: var(--art-gray-100);
  border-color: var(--art-card-border);

  .status-pill__dot {
    background: currentColor;
  }
}

:deep(.sex-chip) {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--art-gray-700);
  background: var(--art-gray-100);
  border: 1px solid var(--art-card-border);
}

:deep(.phone-cell) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--art-gray-800);
}

:deep(.time-cell) {
  line-height: 1.35;
}

:deep(.time-date) {
  font-size: 13px;
  color: var(--art-gray-800);
}

:deep(.time-clock) {
  font-size: 12px;
  color: var(--art-gray-500);
  font-variant-numeric: tabular-nums;
}

:deep(.time-empty),
:deep(.op-cell) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-table__row) {
  transition: background-color 0.2s var(--user-ease);

  &:hover .user-avatar {
    transform: translateY(-1px);
  }
}

@keyframes status-breathe {

  0%,
  100% {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-success) 14%, transparent);
  }

  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--el-color-success) 8%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.status-pill.is-on .status-pill__dot) {
    animation: none !important;
  }
}
</style>
