<template>
    <div class="cache-page art-full-height">
        <ElRow :gutter="16" class="cache-row">
            <!-- 左侧：缓存类型列表 -->
            <ElCol :span="6">
                <CacheTypeList :selected-type="selectedType" @select-type="handleSelectType"
                    @refresh="loadCacheTypes" />
            </ElCol>

            <!-- 中间：缓存键列表 -->
            <ElCol :span="9">
                <CacheKeyList :cache-type="selectedType" :selected-key="selectedKey" @select-key="handleSelectKey"
                    @refresh="loadCacheKeys" />
            </ElCol>

            <!-- 右侧：缓存详情 -->
            <ElCol :span="9">
                <CacheDetail :cache-type="selectedType" :cache-key="selectedKey" @refresh="handleRefreshDetail" />
            </ElCol>
        </ElRow>
    </div>
</template>

<script setup lang="ts">
import CacheTypeList from './modules/cache-type-list.vue'
import CacheKeyList from './modules/cache-key-list.vue'
import CacheDetail from './modules/cache-detail.vue'

defineOptions({ name: 'CacheManagement' })

const selectedType = ref<string>('')
const selectedKey = ref<string>('')

const handleSelectType = (type: string) => {
    selectedType.value = type
    selectedKey.value = '' // 切换类型时清空选中的键
}

const handleSelectKey = (key: string) => {
    selectedKey.value = key
}

const loadCacheTypes = () => {
    selectedType.value = ''
    selectedKey.value = ''
}

const loadCacheKeys = () => {
    selectedKey.value = ''
}

const handleRefreshDetail = () => {
    // 详情刷新后可能需要重新加载键列表
    loadCacheKeys()
}
</script>

<style scoped lang='scss'>
.cache-page {
    overflow: hidden;
}

.cache-row {
    height: 100%;
    display: flex !important;
    flex-wrap: nowrap !important;
}
</style>