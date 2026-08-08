<template>
  <div class="dict-data-panel">
    <!-- 未选中空态 -->
    <div v-if="!activeType?.dictType" class="idle-state">
      <div class="idle-orb">
        <ArtSvgIcon icon="ri:book-marked-line" class="text-4xl text-theme" />
      </div>
      <h3 class="idle-title">选择一个字典类型</h3>
      <p class="idle-desc">从左侧列表点选类型，即可在此管理对应的字典数据项</p>
    </div>

    <Transition v-else name="panel-swap" mode="out-in">
      <div :key="activeType.dictType" class="panel-body">
        <!-- Hero -->
        <div class="hero">
          <div class="hero-main">
            <div class="hero-title-row">
              <h2 class="hero-name">{{ activeType.dictName }}</h2>
              <button type="button" class="code-chip" @click="copyText(activeType.dictType || '')">
                <span class="code-text">{{ activeType.dictType }}</span>
                <ArtSvgIcon
                  :icon="copiedCode === activeType.dictType ? 'ri:check-line' : 'ri:file-copy-line'"
                  class="code-icon"
                  :class="{ 'is-ok': copiedCode === activeType.dictType }"
                />
              </button>
            </div>
            <div class="hero-meta">
              <span class="meta-item">
                <ArtCountTo :target="pagination.total" :duration="800" />
                <span class="meta-label">条数据项</span>
              </span>
              <span v-if="activeType.remark" class="meta-divider">·</span>
              <span v-if="activeType.remark" class="meta-remark" :title="activeType.remark">
                {{ activeType.remark }}
              </span>
            </div>
          </div>
          <div class="hero-search">
            <ElInput
              v-model="labelKeyword"
              clearable
              placeholder="搜索字典标签"
              @clear="handleLabelSearch"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
              </template>
            </ElInput>
          </div>
        </div>

        <!-- 表格卡片 -->
        <ElCard class="art-table-card data-card" shadow="never">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton v-auth="'system:dict:data:create'" v-ripple @click="showDialog('add')">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                  新增数据
                </ElButton>
                <ElButton
                  v-auth="'system:dict:data:delete'"
                  type="danger"
                  plain
                  :disabled="selectedRows.length === 0"
                  v-ripple
                  @click="handleBatchDelete"
                >
                  批量删除
                </ElButton>
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            row-key="dictCode"
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          />
        </ElCard>

        <DictDataDialog
          v-model:visible="dialogVisible"
          :type="dialogType"
          :data="currentRow"
          :dict-type-list="cacheDictType"
          @submit="refreshData"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs'
  import { useAuth } from '@/hooks'
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtCountTo from '@/components/core/text-effect/art-count-to/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { fetchGetDictDataList, fetchDeleteDictData } from '@/api/system/dict'
  import { DialogType } from '@/types'
  import DictDataDialog from './dict-data-dialog.vue'

  type DictTypeListItem = Api.SystemDict.DictTypeListItem
  type DictDataListItem = Api.SystemDict.DictDataListItem

  const props = defineProps<{
    cacheDictType: DictTypeListItem[]
    activeType?: DictTypeListItem | null
  }>()

  const auth = useAuth()
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentRow = ref<Partial<DictDataListItem>>({})
  const selectedRows = ref<DictDataListItem[]>([])
  const labelKeyword = ref('')
  const copiedCode = ref('')
  let copyTimer: ReturnType<typeof setTimeout> | null = null

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetDictDataList,
      apiParams: {
        dictType: props.activeType?.dictType,
        dictLabel: undefined
      },
      immediate: !!props.activeType?.dictType,
      paginationKey: { current: 'pageNum', size: 'pageSize' },
      columnsFactory: () => [
        { type: 'selection', width: 48 },
        { type: 'index', width: 56, label: '序号' },
        {
          prop: 'dictLabel',
          label: '字典标签',
          minWidth: 140,
          formatter: (row: DictDataListItem) =>
            h(
              ElTag,
              {
                type: (row.tagType || 'primary') as Api.SystemDict.ElTagType,
                effect: 'light',
                class: row.customClass || undefined,
                round: false
              },
              () => row.dictLabel
            )
        },
        {
          prop: 'dictValue',
          label: '字典值',
          minWidth: 120,
          formatter: (row: DictDataListItem) =>
            h(
              'button',
              {
                type: 'button',
                class: 'value-chip',
                title: '点击复制',
                onClick: (e: Event) => {
                  e.stopPropagation()
                  copyText(row.dictValue)
                }
              },
              [
                h('span', row.dictValue),
                h(ArtSvgIcon, {
                  icon: 'ri:file-copy-line',
                  class: 'value-chip-icon'
                })
              ]
            )
        },
        {
          prop: 'dictSort',
          label: '排序',
          width: 88,
          align: 'center',
          formatter: (row: DictDataListItem) =>
            h('span', { class: 'sort-badge' }, String(row.dictSort ?? 0))
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 130,
          sortable: true,
          formatter: (row: DictDataListItem) => {
            if (!row.createTime) return ''
            const d = dayjs(row.createTime)
            return h('div', { class: 'time-cell' }, [
              h('div', { class: 'time-date' }, d.format('YYYY-MM-DD')),
              h('div', { class: 'time-clock' }, d.format('HH:mm:ss'))
            ])
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: DictDataListItem) => {
            const buttons = []
            if (auth.hasAuth('system:dict:data:update')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row)
                })
              )
            }
            if (auth.hasAuth('system:dict:data:delete')) {
              buttons.push(
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => deleteOne(row)
                })
              )
            }
            return h('div', { class: 'flex items-center gap-1' }, buttons)
          }
        }
      ]
    }
  })

  watch(
    () => props.activeType?.dictType,
    (dictType) => {
      labelKeyword.value = ''
      selectedRows.value = []
      if (!dictType) return
      searchParams.dictType = dictType
      searchParams.dictLabel = undefined
      getData()
    }
  )

  const debouncedLabelSearch = useDebounceFn(() => {
    searchParams.dictLabel = labelKeyword.value.trim() || undefined
    getData()
  }, 300)

  function handleLabelSearch() {
    debouncedLabelSearch()
  }

  watch(labelKeyword, () => debouncedLabelSearch())

  async function copyText(text: string) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      copiedCode.value = text
      ElMessage.success('已复制')
      if (copyTimer) clearTimeout(copyTimer)
      copyTimer = setTimeout(() => {
        copiedCode.value = ''
      }, 1600)
    } catch {
      ElMessage.error('复制失败')
    }
  }

  function handleSelectionChange(selection: DictDataListItem[]) {
    selectedRows.value = selection
  }

  function showDialog(type: DialogType, row?: DictDataListItem) {
    dialogType.value = type
    currentRow.value = row ? { ...row } : { dictType: props.activeType?.dictType }
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  function deleteOne(row: DictDataListItem) {
    ElMessageBox.confirm(`确定要删除字典数据「${row.dictLabel}」吗？`, '删除字典数据', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      fetchDeleteDictData(row.dictCode as number).then(() => refreshData())
    })
  }

  function handleBatchDelete() {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的数据')
      return
    }
    const labels = selectedRows.value.map((item) => item.dictLabel).join('、')
    ElMessageBox.confirm(`确定要删除以下字典数据吗？\n${labels}`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      const ids = selectedRows.value.map((item) => item.dictCode as number)
      fetchDeleteDictData(ids).then(() => {
        selectedRows.value = []
        refreshData()
      })
    })
  }
</script>

<style scoped lang="scss">
  .dict-data-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--default-box-color);
    border: 1px solid var(--art-card-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
    overflow: hidden;
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px 12px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--art-card-border);
  }

  .hero-main {
    min-width: 0;
    flex: 1;
  }

  .hero-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-name {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--art-gray-900);
    letter-spacing: -0.02em;
    line-height: 1.3;
  }

  .code-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 4px 10px;
    border: 1px solid var(--art-card-border);
    border-radius: 8px;
    background: var(--art-gray-100);
    color: var(--art-gray-700);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--main-color) 40%, transparent);
      color: var(--main-color);
      background: color-mix(in srgb, var(--main-color) 8%, transparent);
    }
  }

  .code-text {
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    @include ellipsis(1);
  }

  .code-icon {
    font-size: 13px;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.is-ok {
      color: var(--art-success);
      transform: scale(1.15);
    }
  }

  .hero-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .meta-item {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    font-weight: 500;
    color: var(--art-gray-800);

    :deep(.tabular-nums) {
      font-size: 15px;
      font-weight: 600;
      color: var(--main-color);
    }
  }

  .meta-label {
    font-weight: 400;
    color: var(--art-gray-500);
  }

  .meta-divider {
    color: var(--art-gray-400);
  }

  .meta-remark {
    max-width: 360px;
    color: var(--art-gray-500);
    @include ellipsis(1);
  }

  .hero-search {
    width: 220px;
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

  .data-card {
    flex: 1;
    margin-top: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    min-height: 0;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding-top: 8px;
    }
  }

  .idle-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    text-align: center;
  }

  .idle-orb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    border-radius: 24px;
    background: color-mix(in srgb, var(--main-color) 10%, transparent);
    animation: float 3.2s ease-in-out infinite;
  }

  .idle-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .idle-desc {
    margin: 0;
    max-width: 280px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--art-gray-500);
  }

  /* 表格内自定义元素（formatter 渲染到表格，需 :deep） */
  :deep(.value-chip) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 2px 8px;
    border: 1px solid var(--art-card-border);
    border-radius: 6px;
    background: var(--art-gray-100);
    color: var(--art-gray-800);
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--main-color) 40%, transparent);
      color: var(--main-color);
    }
  }

  :deep(.value-chip-icon) {
    font-size: 12px;
    opacity: 0.55;
  }

  :deep(.sort-badge) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 26px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-700);
    background: var(--art-gray-200);
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
  }

  .panel-swap-enter-active,
  .panel-swap-leave-active {
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .panel-swap-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .panel-swap-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @media (max-width: 900px) {
    .hero {
      flex-direction: column;
    }

    .hero-search {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .idle-orb {
      animation: none;
    }

    .panel-swap-enter-active,
    .panel-swap-leave-active {
      transition: none;
    }
  }
</style>
