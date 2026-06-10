<template>
    <ElCard class="queue-list-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>队列列表</span>
                <ElSpace :size="6">
                    <ElSelect :model-value="pollInterval" size="small" class="poll-select"
                        @update:model-value="emit('update:pollInterval', $event)">
                        <ElOption label="不自动刷新" :value="0" />
                        <ElOption label="3 秒" :value="3000" />
                        <ElOption label="5 秒" :value="5000" />
                    </ElSelect>
                    <ElButton :icon="Refresh" circle size="small" @click="refreshList" :loading="loading" />
                </ElSpace>
            </div>
        </template>

        <div v-loading="loading" class="queue-list">
            <div v-for="item in queueList" :key="item.name" class="queue-item"
                :class="{ 'is-active': selectedQueue === item.name }" @click="handleSelect(item)">
                <div class="queue-info">
                    <div class="queue-name">{{ item.name }}</div>
                    <div v-if="item.description" class="queue-desc">{{ item.description }}</div>
                    <div class="queue-stats">
                        <ElTag size="small" type="info">等待 {{ item.counts.waiting ?? 0 }}</ElTag>
                        <ElTag size="small" type="primary">执行 {{ item.counts.active ?? 0 }}</ElTag>
                        <ElTag size="small" type="warning">延迟 {{ item.counts.delayed ?? 0 }}</ElTag>
                        <ElTag size="small" type="danger">失败 {{ item.counts.failed ?? 0 }}</ElTag>
                        <ElTag size="small" type="success">完成 {{ item.counts.completed ?? 0 }}</ElTag>
                    </div>
                    <ElTag v-if="item.isPaused" size="small" type="warning" class="paused-tag">已暂停</ElTag>
                    <div class="queue-actions" @click.stop>
                        <ElButton v-if="item.isPaused" size="small" text type="success"
                            v-auth="'monitor:queue:pause'" @click="handlePauseToggle(item, false)">
                            恢复
                        </ElButton>
                        <ElButton v-else size="small" text type="warning"
                            v-auth="'monitor:queue:pause'" @click="handlePauseToggle(item, true)">
                            暂停
                        </ElButton>
                    </div>
                </div>
            </div>

            <ElEmpty v-if="!loading && queueList.length === 0" description="暂无队列" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetQueueList, fetchPauseQueue } from '@/api/monitor/queue'

defineOptions({ name: 'QueueList' })

interface Props {
    selectedQueue?: string
    pollInterval?: number
}

interface Emits {
    (e: 'select-queue', name: string, counts: Api.MonitorQueue.QueueCounts): void
    (e: 'update:pollInterval', value: number): void
    (e: 'loaded', list: Api.MonitorQueue.QueueListItem[]): void
    (e: 'refresh'): void
    (e: 'ops-done'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const queueList = ref<Api.MonitorQueue.QueueListItem[]>([])

const loadList = async (silent = false) => {
    if (!silent) loading.value = true
    try {
        queueList.value = await fetchGetQueueList() || []
        emit('loaded', queueList.value)
    } finally {
        if (!silent) loading.value = false
    }
}

const refreshList = () => {
    loadList()
    emit('refresh')
}

const handleSelect = (item: Api.MonitorQueue.QueueListItem) => {
    emit('select-queue', item.name, item.counts)
}

const handlePauseToggle = (item: Api.MonitorQueue.QueueListItem, pause: boolean) => {
    const action = pause ? '暂停' : '恢复'
    ElMessageBox.confirm(`确定要${action}队列「${item.name}」吗？`, `${action}确认`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await fetchPauseQueue({ queueName: item.name, pause })
        await loadList(true)
        emit('ops-done')
    })
}

defineExpose({
    reload: (silent = false) => loadList(silent),
})

onMounted(() => {
    loadList()
})
</script>

<style scoped lang="scss">
.queue-list-card {
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

.poll-select {
    width: 108px;

    :deep(.el-select__wrapper) {
        min-height: 28px;
        padding: 0 8px;
    }
}

.queue-list {
    height: 100%;
    overflow-y: auto;
    padding: 12px;
}

.queue-item {
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
    }
}

.queue-name {
    font-weight: 600;
    margin-bottom: 4px;
    word-break: break-all;
}

.queue-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
}

.queue-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.paused-tag {
    margin-top: 8px;
}

.queue-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
}
</style>
