<template>
  <div class="dict-type-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <div class="header-title">
        <h3>字典类型</h3>
        <span class="count-pill">{{ pagination.total }}</span>
      </div>
      <div class="header-actions">
        <template v-if="multiSelect">
          <ElButton v-if="auth.hasAuth('system:dict:type:delete')" type="danger" size="small"
            :disabled="selectedIds.length === 0" v-ripple @click="handleBatchDelete">
            删除 {{ selectedIds.length || '' }}
          </ElButton>
          <ElButton size="small" @click="exitMultiSelect">取消</ElButton>
        </template>
        <template v-else>
          <ElTooltip content="多选" placement="top">
            <button v-if="auth.hasAuth('system:dict:type:delete')" type="button" class="icon-btn"
              @click="multiSelect = true">
              <ArtSvgIcon icon="ri:checkbox-multiple-line" class="text-base" />
            </button>
          </ElTooltip>
          <ElTooltip content="新增类型" placement="top">
            <button v-if="auth.hasAuth('system:dict:type:create')" type="button" class="icon-btn icon-btn--primary"
              v-ripple @click="showDialog('add')">
              <ArtSvgIcon icon="ri:add-line" class="text-lg" />
            </button>
          </ElTooltip>
        </template>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="panel-search">
      <ElInput v-model="keyword" clearable placeholder="搜索类型名称 / 编码" @clear="handleSearch">
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
        </template>
      </ElInput>
    </div>

    <!-- 列表 -->
    <div ref="listRef" class="panel-list" v-loading="loading && !data.length">
      <!-- 骨架屏 -->
      <template v-if="loading && !data.length">
        <div v-for="i in 6" :key="i" class="skeleton-row">
          <div class="skeleton-avatar shimmer" />
          <div class="skeleton-body">
            <div class="skeleton-line shimmer" style="width: 55%" />
            <div class="skeleton-line shimmer short" style="width: 75%" />
          </div>
        </div>
      </template>

      <!-- 空态 -->
      <div v-else-if="!data.length" class="empty-state">
        <div class="empty-icon">
          <ArtSvgIcon icon="ri:book-2-line" class="text-3xl text-g-400" />
        </div>
        <p class="empty-title">暂无字典类型</p>
        <p class="empty-desc">创建第一个类型开始配置数据字典</p>
        <ElButton v-if="auth.hasAuth('system:dict:type:create')" type="primary" size="small" v-ripple
          @click="showDialog('add')">
          新增类型
        </ElButton>
      </div>

      <!-- 列表项 -->
      <template v-else>
        <div class="indicator" :style="indicatorStyle" />
        <div v-for="(item, index) in data" :key="item.dictId" class="type-item" :class="{
          'is-active': item.dictType === activeDictType,
          'is-multi': multiSelect,
          'is-checked': selectedIds.includes(item.dictId as number)
        }" :style="{ '--i': index }" @click="handleItemClick(item)">
          <ElCheckbox v-if="multiSelect" class="item-check" :model-value="selectedIds.includes(item.dictId as number)"
            @click.stop @change="(val: boolean | string | number) => toggleSelect(item, !!val)" />
          <div class="item-avatar" :style="avatarStyle(item.dictType || '')">
            {{ firstChar(item.dictName) }}
          </div>
          <div class="item-content">
            <div class="item-name" :title="item.dictName">{{ item.dictName }}</div>
            <div class="item-code" :title="item.dictType">{{ item.dictType }}</div>
          </div>
          <div v-if="!multiSelect" class="item-actions" @click.stop>
            <button v-if="auth.hasAuth('system:dict:type:update')" type="button" class="action-btn" title="编辑"
              @click="showDialog('edit', item)">
              <ArtSvgIcon icon="ri:pencil-line" class="text-sm" />
            </button>
            <button v-if="auth.hasAuth('system:dict:type:delete')" type="button" class="action-btn action-btn--danger"
              title="删除" @click="deleteOne(item)">
              <ArtSvgIcon icon="ri:delete-bin-line" class="text-sm" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 分页：数据超出单页时，列表区内滚动 + 底部分页翻页 -->
    <div v-if="pagination.total > 0" class="panel-footer">
      <span class="footer-total">共 {{ pagination.total }} 项</span>
      <ElPagination v-if="pagination.total > pagination.size" small background layout="prev, pager, next"
        :pager-count="3" :current-page="pagination.current" :page-size="pagination.size" :total="pagination.total"
        @current-change="onPageChange" />
    </div>

    <DictTypeDialog v-model:visible="dialogVisible" :type="dialogType" :data="currentRow"
      @submit="handleDialogSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import { fetchGetDictTypeList, fetchDeleteDictType } from '@/api/system/dict'
import { DialogType } from '@/types'
import DictTypeDialog from './dict-type-dialog.vue'

type DictTypeListItem = Api.SystemDict.DictTypeListItem

const AVATAR_PALETTE = [
  'var(--art-primary)',
  'var(--art-secondary)',
  'var(--art-success)',
  'var(--art-warning)',
  'var(--art-info)',
  'var(--art-error)'
] as const

const props = defineProps<{
  activeDictType?: string
}>()

const emit = defineEmits<{
  select: [item: DictTypeListItem]
  'refresh-cache': []
  'dict-type-changed': [payload: { oldDictType: string; newDictType: string }]
  'type-deleted': [dictType: string]
  'first-loaded': [item: DictTypeListItem | null]
}>()

const auth = useAuth()
const listRef = ref<HTMLElement>()
const keyword = ref('')
const multiSelect = ref(false)
const selectedIds = ref<number[]>([])
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentRow = ref<Partial<DictTypeListItem>>({})
const indicatorTop = ref(0)
const indicatorVisible = ref(false)
const hasEmittedFirst = ref(false)

const { data, loading, pagination, searchParams, getData, handleCurrentChange, refreshData } =
  useTable({
    core: {
      apiFn: fetchGetDictTypeList,
      apiParams: {
        dictName: undefined,
        dictType: undefined,
        size: 20
      },
      paginationKey: { current: 'pageNum', size: 'pageSize' }
    },
    hooks: {
      onSuccess: (list) => {
        if (!hasEmittedFirst.value) {
          hasEmittedFirst.value = true
          emit('first-loaded', list[0] ?? null)
        }
        nextTick(() => updateIndicator())
      }
    }
  })

async function onPageChange(page: number) {
  await handleCurrentChange(page)
  listRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const indicatorStyle = computed(() => ({
  opacity: indicatorVisible.value ? 1 : 0,
  transform: `translateY(${indicatorTop.value}px)`
}))

function hashColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function avatarStyle(dictType: string) {
  const color = hashColor(dictType)
  return {
    color,
    background: `color-mix(in srgb, ${color} 14%, transparent)`
  }
}

function firstChar(name?: string) {
  return (name || '?').trim().charAt(0).toUpperCase()
}

function updateIndicator() {
  const list = listRef.value
  if (!list || !props.activeDictType) {
    indicatorVisible.value = false
    return
  }
  const active = list.querySelector('.type-item.is-active') as HTMLElement | null
  if (!active) {
    indicatorVisible.value = false
    return
  }
  indicatorTop.value = active.offsetTop + 8
  indicatorVisible.value = true
}

watch(
  () => [props.activeDictType, data.value] as const,
  () => nextTick(() => updateIndicator()),
  { flush: 'post' }
)

const debouncedSearch = useDebounceFn(() => {
  const kw = keyword.value.trim()
  // 后端 QueryBuilder 为 AND：编码形态走 dictType，其余走 dictName
  const looksLikeCode = /^[a-zA-Z0-9_-]+$/.test(kw)
  Object.assign(searchParams, {
    dictName: kw && !looksLikeCode ? kw : undefined,
    dictType: kw && looksLikeCode ? kw : undefined
  })
  getData()
}, 300)

function handleSearch() {
  debouncedSearch()
}

watch(keyword, () => debouncedSearch())

function handleItemClick(item: DictTypeListItem) {
  if (multiSelect.value) {
    toggleSelect(item, !selectedIds.value.includes(item.dictId as number))
    return
  }
  emit('select', item)
}

function toggleSelect(item: DictTypeListItem, checked: boolean) {
  const id = item.dictId as number
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function exitMultiSelect() {
  multiSelect.value = false
  selectedIds.value = []
}

function showDialog(type: DialogType, row?: DictTypeListItem) {
  dialogType.value = type
  currentRow.value = row || {}
  nextTick(() => {
    dialogVisible.value = true
  })
}

function handleDialogSubmit(payload?: { oldDictType: string; newDictType: string }) {
  refreshData()
  emit('refresh-cache')
  if (payload) emit('dict-type-changed', payload)
}

function deleteOne(row: DictTypeListItem) {
  ElMessageBox.confirm(`确定要删除字典类型「${row.dictName}」吗？`, '删除字典类型', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    fetchDeleteDictType(row.dictId as number).then(() => {
      emit('type-deleted', row.dictType as string)
      refreshData()
      emit('refresh-cache')
    })
  })
}

function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  const names = data.value
    .filter((item) => selectedIds.value.includes(item.dictId as number))
    .map((item) => item.dictName)
    .join('、')
  ElMessageBox.confirm(`确定要删除以下字典类型吗？\n${names}`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const deletedTypes = data.value
      .filter((item) => selectedIds.value.includes(item.dictId as number))
      .map((item) => item.dictType as string)
    fetchDeleteDictType(selectedIds.value).then(() => {
      deletedTypes.forEach((t) => emit('type-deleted', t))
      exitMultiSelect()
      refreshData()
      emit('refresh-cache')
    })
  })
}

defineExpose({
  refreshData,
  getData
})
</script>

<style scoped lang="scss">
.dict-type-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--default-box-color);
  border: 1px solid var(--art-card-border);
  border-radius: calc(var(--custom-radius) / 2 + 2px);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  border-radius: 999px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: var(--art-hover-color);
  color: var(--art-gray-700);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: var(--main-color);
    background: color-mix(in srgb, var(--main-color) 12%, transparent);
  }

  &--primary {
    color: #fff;
    background: var(--main-color);

    &:hover {
      color: #fff;
      background: var(--main-color);
      filter: brightness(1.08);
      transform: rotate(90deg);
    }
  }
}

.panel-search {
  padding: 4px 16px 12px;
  flex-shrink: 0;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--art-card-border) inset;
    background: var(--art-gray-100);

    &:hover,
    &.is-focus {
      box-shadow: 0 0 0 1px var(--main-color) inset;
    }
  }
}

.panel-list {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 10px 8px;
  min-height: 0;
}

.indicator {
  position: absolute;
  left: 10px;
  top: 0;
  width: 3px;
  height: 40px;
  border-radius: 0 3px 3px 0;
  background: var(--main-color);
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
  pointer-events: none;
  z-index: 2;
}

.type-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  animation: item-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: calc(var(--i, 0) * 28ms);

  &:hover {
    background: var(--art-hover-color);

    .item-actions {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
  }

  &.is-active {
    background: color-mix(in srgb, var(--main-color) 8%, transparent);

    .item-name {
      color: var(--main-color);
      font-weight: 600;
    }
  }

  &.is-checked {
    background: color-mix(in srgb, var(--main-color) 8%, transparent);
  }

  &.is-multi {
    padding-left: 8px;
  }
}

.item-check {
  flex-shrink: 0;
}

.item-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--art-gray-900);
  @include ellipsis(1);
  transition: color 0.2s ease;
}

.item-code {
  margin-top: 2px;
  font-size: 11.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--art-gray-500);
  @include ellipsis(1);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--art-gray-600);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--main-color) 12%, transparent);
    color: var(--main-color);
  }

  &--danger:hover {
    background: color-mix(in srgb, var(--art-error) 14%, transparent);
    color: var(--art-error);
  }
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px 12px;
  flex-shrink: 0;
  border-top: 1px solid var(--art-card-border);

  :deep(.el-pagination) {
    flex-wrap: nowrap;
    justify-content: flex-end;
  }
}

.footer-total {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--art-gray-500);
  white-space: nowrap;
}

/* 骨架屏 */
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;

  &.short {
    height: 10px;
  }
}

.shimmer {
  background: linear-gradient(90deg,
      var(--art-gray-200) 25%,
      var(--art-gray-100) 50%,
      var(--art-gray-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  border-radius: 16px;
  background: var(--art-gray-100);
}

.empty-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--art-gray-800);
}

.empty-desc {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--art-gray-500);
}

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .type-item {
    animation: none;
  }

  .indicator {
    transition: none;
  }

  .icon-btn--primary:hover {
    transform: none;
  }

  .shimmer {
    animation: none;
  }
}
</style>
