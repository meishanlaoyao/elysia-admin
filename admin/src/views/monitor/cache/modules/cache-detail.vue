<template>
    <ElCard class="cache-detail-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>缓存详情</span>
                <ElSpace>
                    <ElButton :icon="Refresh" circle size="small" @click="loadDetail" :loading="loading"
                        :disabled="!cacheType || (cacheKey === undefined || cacheKey === null)" />
                </ElSpace>
            </div>
        </template>

        <div v-loading="loading" class="detail-content">
            <template v-if="cacheType && (cacheKey !== undefined && cacheKey !== null)">
                <div v-if="cacheValue || detailData.length > 0" class="detail-wrapper">
                    <div class="detail-info">
                        <div class="info-item">
                            <span class="label">缓存类型：</span>
                            <span class="value">{{ cacheType }}</span>
                        </div>
                        <div class="info-item" v-if="cacheKey">
                            <span class="label">缓存键：</span>
                            <span class="value">{{ cacheKey }}</span>
                        </div>
                    </div>

                    <ElDivider />

                    <div class="detail-editor">
                        <div class="editor-header">
                            <span>缓存值</span>
                            <ElSpace>
                                <ElButton size="small" type="primary" @click="handleUpdate" :disabled="!isEdited"
                                    v-auth="'monitor:cache:update'">
                                    保存修改
                                </ElButton>
                                <ElButton size="small" type="danger" @click="handleClear"
                                    v-auth="'monitor:cache:delete'">
                                    清除缓存
                                </ElButton>
                            </ElSpace>
                        </div>

                        <ElInput v-model="cacheValue" type="textarea" :rows="20" placeholder="缓存值"
                            class="cache-textarea" />
                    </div>
                </div>

                <ElEmpty v-else description="暂无缓存数据" />
            </template>

            <ElEmpty v-else description="请先选择缓存键" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetCacheKey, fetchUpdateCacheKey, fetchClearCacheKey } from '@/api/monitor/cache'

defineOptions({ name: 'CacheDetail' })

interface Props {
    cacheType?: string
    cacheKey?: string
}

interface Emits {
    (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const detailData = ref<any[]>([])
const cacheValue = ref('')
const originalValue = ref('')

const isEdited = computed(() => {
    return cacheValue.value !== originalValue.value
})

const loadDetail = async () => {
    // 只要有 cacheType 就可以加载（cacheKey 可以是空字符串）
    if (!props.cacheType || props.cacheKey === undefined || props.cacheKey === null) {
        detailData.value = []
        cacheValue.value = ''
        originalValue.value = ''
        return
    }

    loading.value = true
    try {
        const res = await fetchGetCacheKey({
            cacheType: props.cacheType,
            cacheKey: props.cacheKey
        })

        // 处理返回的数据
        let value = ''
        if (res !== null && res !== undefined) {
            if (Array.isArray(res)) {
                // 过滤掉空字符串
                const filteredRes = res.filter(item => item !== '')
                detailData.value = filteredRes.length > 0 ? filteredRes : res

                // 如果是数组，取第一个元素或整个数组
                const data = filteredRes.length === 1 ? filteredRes[0] : (filteredRes.length > 0 ? filteredRes : res)
                value = typeof data === 'object'
                    ? JSON.stringify(data, null, 2)
                    : String(data)
            } else if (typeof res === 'object') {
                detailData.value = [res]
                value = JSON.stringify(res, null, 2)
            } else {
                detailData.value = [res]
                value = String(res)
            }
        } else {
            detailData.value = []
        }

        cacheValue.value = value
        originalValue.value = value
    } catch (error) {
        console.error('加载缓存详情失败:', error)
        detailData.value = []
        cacheValue.value = ''
        originalValue.value = ''
    } finally {
        loading.value = false
    }
}

const handleUpdate = () => {
    if (!props.cacheType || !props.cacheKey) return

    ElMessageBox.confirm(
        '确定要更新此缓存数据吗？',
        '更新确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        await fetchUpdateCacheKey({
            cacheType: props.cacheType!,
            cacheKey: props.cacheKey!,
            cacheValue: cacheValue.value
        })
        originalValue.value = cacheValue.value
        loadDetail()
    })
}

const handleClear = () => {
    if (!props.cacheType || !props.cacheKey) return

    ElMessageBox.confirm(
        `确定要清除缓存键 "${props.cacheKey}" 吗？`,
        '清除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        await fetchClearCacheKey({
            cacheType: props.cacheType!,
            cacheKey: props.cacheKey!
        })
        emit('refresh')
    })
}

watch(() => [props.cacheType, props.cacheKey], () => {
    loadDetail()
}, { immediate: false })

onMounted(() => {
    if (props.cacheType && props.cacheKey) {
        loadDetail()
    }
})
</script>

<style scoped lang="scss">
.cache-detail-card {
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

.detail-content {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
}

.detail-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.detail-info {
    .info-item {
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        .label {
            font-weight: 500;
            color: var(--el-text-color-secondary);
            min-width: 80px;
        }

        .value {
            color: var(--el-text-color-primary);
            word-break: break-all;
        }
    }
}

.detail-editor {
    flex: 1;
    display: flex;
    flex-direction: column;

    .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
    }

    .cache-textarea {
        flex: 1;

        :deep(textarea) {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
        }
    }
}
</style>
