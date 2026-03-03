<template>
    <ElCard class="cache-type-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>缓存类型</span>
                <ElButton :icon="Refresh" circle size="small" @click="refreshList" :loading="loading" />
            </div>
        </template>

        <div v-loading="loading" class="type-list">
            <div v-for="type in typeList" :key="type" class="type-item" :class="{ 'is-active': selectedType === type }"
                @click="handleSelectType(type)">
                <div class="type-name">{{ type }}</div>
                <ElButton :icon="Delete" size="small" type="danger" text @click.stop="handleClearType(type)"
                    v-auth="'monitor:cache:delete'">
                    清除
                </ElButton>
            </div>

            <ElEmpty v-if="!loading && typeList.length === 0" description="暂无缓存类型" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetCacheTypeList, fetchClearCacheType } from '@/api/monitor/cache'

defineOptions({ name: 'CacheTypeList' })

interface Props {
    selectedType?: string
}

interface Emits {
    (e: 'select-type', type: string): void
    (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const typeList = ref<string[]>([])

const loadTypeList = async () => {
    loading.value = true
    try {
        const res = await fetchGetCacheTypeList()
        typeList.value = res || []
    } finally {
        loading.value = false
    }
}

const refreshList = () => {
    loadTypeList()
    emit('refresh')
}

const handleSelectType = (type: string) => {
    emit('select-type', type)
}

const handleClearType = (type: string) => {
    ElMessageBox.confirm(
        `确定要清除缓存类型 "${type}" 下的所有数据吗？`,
        '清除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        await fetchClearCacheType({ cacheType: type })
        refreshList()
    })
}

onMounted(() => {
    loadTypeList()
})
</script>

<style scoped lang="scss">
.cache-type-card {
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

.type-list {
    height: 100%;
    overflow-y: auto;
    padding: 12px;
}

.type-item {
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

.type-name {
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
