<template>
  <div class="dict-page art-full-height">
    <aside class="dict-aside">
      <DictTypePanel
        :active-dict-type="activeType?.dictType"
        @select="handleSelectType"
        @refresh-cache="getCacheDictTypeList"
        @dict-type-changed="handleDictTypeChanged"
        @type-deleted="handleTypeDeleted"
        @first-loaded="handleFirstLoaded"
      />
    </aside>
    <section class="dict-main">
      <DictDataPanel :cache-dict-type="cacheDictType" :active-type="activeType" />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetCacheDictTypeList } from '@/api/system/dict'
  import DictTypePanel from './modules/dict-type-panel.vue'
  import DictDataPanel from './modules/dict-data-panel.vue'

  defineOptions({ name: 'SystemDict' })

  type DictTypeListItem = Api.SystemDict.DictTypeListItem

  const cacheDictType = ref<DictTypeListItem[]>([])
  const activeType = ref<DictTypeListItem | null>(null)

  function getCacheDictTypeList() {
    fetchGetCacheDictTypeList().then((res) => {
      cacheDictType.value = res
      // 缓存刷新后同步当前选中项的最新名称等信息
      if (activeType.value?.dictType) {
        const latest = res.find((item) => item.dictType === activeType.value?.dictType)
        if (latest) activeType.value = latest
      }
    })
  }

  function handleSelectType(item: DictTypeListItem) {
    activeType.value = item
  }

  function handleFirstLoaded(item: DictTypeListItem | null) {
    if (!activeType.value && item) {
      activeType.value = item
    }
  }

  function handleDictTypeChanged(payload: { oldDictType: string; newDictType: string }) {
    if (activeType.value?.dictType === payload.oldDictType) {
      activeType.value = {
        ...activeType.value,
        dictType: payload.newDictType
      }
    }
    // refresh-cache 已由类型面板同步触发，此处仅更新选中编码
  }

  function handleTypeDeleted(dictType: string) {
    if (activeType.value?.dictType !== dictType) return
    // 删除当前选中项后回退：优先相邻缓存项，否则清空展示空态
    const list = cacheDictType.value.filter((item) => item.dictType !== dictType)
    const idx = cacheDictType.value.findIndex((item) => item.dictType === dictType)
    const fallback = list[Math.min(Math.max(idx, 0), list.length - 1)] ?? null
    activeType.value = fallback
    // refresh-cache 随后会刷新全量缓存
  }

  onMounted(() => {
    getCacheDictTypeList()
  })
</script>

<style scoped lang="scss">
  .dict-page {
    display: flex;
    flex-direction: row;
    gap: 16px;
    min-height: 0;
  }

  .dict-aside {
    width: 320px;
    flex-shrink: 0;
    min-height: 0;
  }

  .dict-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  @media (max-width: 1200px) {
    .dict-page {
      flex-direction: column;
    }

    .dict-aside {
      width: 100%;
      height: 260px;
      flex-shrink: 0;
    }

    .dict-main {
      flex: 1;
      min-height: 0;
    }
  }
</style>
