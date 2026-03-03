<template>
    <ElCard class="cache-key-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>缓存键列表</span>
                <ElButton :icon="Refresh" circle size="small" @click="refreshList" :loading="loading"
                    :disabled="!cacheType" />
            </div>
        </template>

        <div v-loading="loading" class="key-list">
            <template v-if="cacheType">
                <!-- 如果没有键列表，显示提示 -->
                <div v-if="hasNoKeys" class="no-keys-tip">
                    <ElEmpty description="此类型无键列表，已自动加载详情" :image-size="80" />
                </div>

                <!-- 有键列表时显示 -->
                <template v-else>
                    <div v-for="key in keyList" :key="key" class="key-item"
                        :class="{ 'is-active': selectedKey === key }" @click="handleSelectKey(key)">
                        <div class="key-name">{{ key }}</div>
                        <ElButton :icon="Delete" size="small" type="danger" text @click.stop="handleClearKey(key)"
                            v-auth="'monitor:cache:delete'">
                            清除
                        </ElButton>
                    </div>

                    <ElEmpty v-if="!loading && keyList.length === 0" description="暂无缓存键" />
                </template>
            </template>

            <ElEmpty v-else description="请先选择缓存类型" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetCacheList, fetchClearCacheKey } from '@/api/monitor/cache'

defineOptions({ name: 'CacheKeyList' })

interface Props {
    cacheType?: string
    selectedKey?: string
}

interface Emits {
    (e: 'select-key', key: string): void
    (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const keyList = ref<string[]>([])
const hasNoKeys = ref(false) // 标记是否没有键列表（直接显示详情）

const loadKeyList = async () => {
    if (!props.cacheType) {
        keyList.value = []
        hasNoKeys.value = false
        return
    }

    loading.value = true
    try {
        const res = await fetchGetCacheList({ cacheType: props.cacheType })

        // 如果返回 [""] 或空数组，说明没有键列表，应该直接显示详情
        if (res && res.length === 1 && res[0] === '') {
            keyList.value = []
            hasNoKeys.value = true
            // 直接触发选择，使用空字符串作为键
            emit('select-key', '')
        } else {
            keyList.value = res || []
            hasNoKeys.value = false
        }
    } finally {
        loading.value = false
    }
}

const refreshList = () => {
    loadKeyList()
    emit('refresh')
}

const handleSelectKey = (key: string) => {
    emit('select-key', key)
}

const handleClearKey = (key: string) => {
    ElMessageBox.confirm(
        `确定要清除缓存键 "${key}" 吗？`,
        '清除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        await fetchClearCacheKey({
            cacheType: props.cacheType!,
            cacheKey: key
        })
        refreshList()
    })
}

watch(() => props.cacheType, () => {
    loadKeyList()
})

onMounted(() => {
    if (props.cacheType) {
        loadKeyList()
    }
})
</script>

<style scoped lang="scss">
.cache-key-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
        flex: 1;
        overflow: hidden;
        padding: 0;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.key-list {
    height: 100%;
    overflow-y: auto;
    padding: 12px;
}

.key-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid var(--el-border-color);

    &:hover {
        background-color: var(--el-fill-color-light);
    }

    &.is-active {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
    }
}

.key-name {
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
}

.no-keys-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
}
</style>
