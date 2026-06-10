<template>
    <ElCard class="job-detail-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>任务详情</span>
                <ElSpace :size="6">
                    <ElButton v-if="detail?.state === 'failed'" size="small" type="primary" :loading="actionLoading"
                        v-auth="'monitor:queue:retry'" @click="handleRetry">
                        重试
                    </ElButton>
                    <ElButton v-if="detail?.state === 'delayed'" size="small" type="warning" plain
                        :loading="actionLoading" v-auth="'monitor:queue:promote'" @click="handlePromote">
                        立即执行
                    </ElButton>
                    <ElButton v-if="canRemoveJob" size="small" type="danger" plain :loading="actionLoading"
                        v-auth="'monitor:queue:delete'" @click="handleRemove">
                        删除
                    </ElButton>
                    <ElButton :icon="Refresh" circle size="small" @click="() => loadDetail()" :loading="loading"
                        :disabled="!queueName || !jobId" />
                </ElSpace>
            </div>
        </template>

        <div v-loading="loading" class="detail-content">
            <template v-if="queueName && jobId">
                <template v-if="detail">
                    <div class="detail-head">
                        <div class="detail-title">{{ detail.name || '未命名任务' }}</div>
                        <ElTag size="small" :type="stateTagType" effect="light" round class="state-tag">
                            {{ stateLabel }}
                        </ElTag>
                    </div>
                    <div class="detail-meta">
                        <div class="meta-row">
                            <span class="meta-label">任务 ID</span>
                            <span class="meta-value mono" :title="String(detail.id)">{{ detail.id }}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">尝试次数</span>
                            <span class="meta-value">{{ detail.attemptsMade ?? 0 }} 次</span>
                        </div>
                        <div v-if="detail.delay" class="meta-row">
                            <span class="meta-label">延迟时长</span>
                            <span class="meta-value">{{ formatDuration(detail.delay) }}</span>
                        </div>
                        <div v-if="detail.delayedUntil && !showDelayProgress" class="meta-row">
                            <span class="meta-label">预计执行</span>
                            <span class="meta-value">{{ formatTime(detail.delayedUntil) }}</span>
                        </div>
                        <div v-if="detail.timestamp" class="meta-row">
                            <span class="meta-label">创建时间</span>
                            <span class="meta-value">{{ formatTime(detail.timestamp) }}</span>
                        </div>
                        <div v-if="detail.processedOn" class="meta-row">
                            <span class="meta-label">开始处理</span>
                            <span class="meta-value">{{ formatTime(detail.processedOn) }}</span>
                        </div>
                        <div v-if="detail.finishedOn" class="meta-row">
                            <span class="meta-label">完成时间</span>
                            <span class="meta-value">{{ formatTime(detail.finishedOn) }}</span>
                        </div>
                    </div>

                    <div v-if="showDelayProgress" class="detail-block delay-block"
                        :class="{ 'is-complete': isDelayComplete, 'is-near': isDelayNear }">
                        <div class="delay-head">
                            <div class="delay-head-main">
                                <span class="delay-head-title">延迟倒计时</span>
                                <span v-if="delayRemaining > 0" class="delay-remain">
                                    剩余 {{ formatDuration(delayRemaining) }}
                                </span>
                                <span v-else class="delay-soon">即将进入队列</span>
                            </div>
                            <span class="delay-percent">{{ delayProgress }}%</span>
                        </div>
                        <ElProgress :percentage="delayProgress" :show-text="false" :stroke-width="8"
                            :color="delayProgressColor" striped :striped-flow="delayProgress < 100" />
                        <div v-if="detail.delayedUntil" class="delay-foot">
                            预计 {{ formatTime(detail.delayedUntil) }} 开始执行
                        </div>
                    </div>

                    <div v-else-if="showActiveProgress" class="detail-block">
                        <div class="block-title">执行进度</div>
                        <ElProgress :percentage="activeProgress" :stroke-width="10" />
                    </div>

                    <div class="detail-block">
                        <div class="block-title">任务数据</div>
                        <div class="code-block">{{ dataJson }}</div>
                    </div>

                    <div v-if="detail.failedReason" class="detail-block is-error">
                        <div class="block-title">失败原因</div>
                        <div class="code-block">{{ detail.failedReason }}</div>
                    </div>

                    <div v-if="detail.stacktrace?.length" class="detail-block is-error">
                        <div class="block-title">错误堆栈</div>
                        <div class="code-block">{{ detail.stacktrace.join('\n') }}</div>
                    </div>

                    <div v-if="detail.logs?.length" class="detail-block">
                        <div class="block-title">运行日志 ({{ detail.logCount ?? detail.logs.length }})</div>
                        <div class="code-block">{{ detail.logs.join('\n') }}</div>
                    </div>
                </template>
                <ElEmpty v-else-if="!loading" description="任务不存在或已删除" :image-size="72" />
            </template>
            <ElEmpty v-else description="请先选择任务" :image-size="80" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetQueueJobDetail, fetchRetryQueueJob, fetchRemoveQueueJob, fetchPromoteQueueJob } from '@/api/monitor/queue'
import { canRemoveQueueJob } from '../shared'

defineOptions({ name: 'JobDetail' })

interface Props {
    queueName?: string
    jobId?: string
}

interface Emits {
    (e: 'refresh'): void
    (e: 'ops-done'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const STATE_LABELS: Record<string, string> = {
    waiting: '等待中',
    active: '执行中',
    delayed: '延迟中',
    failed: '失败',
    completed: '已完成',
}

const loading = ref(false)
const actionLoading = ref(false)
const detail = ref<Api.MonitorQueue.JobDetail | null>(null)
const canRemoveJob = computed(() => canRemoveQueueJob(detail.value?.id ?? props.jobId, detail.value?.state))
const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

const formatTime = (ts: number) => new Date(ts).toLocaleString('zh-CN')

const formatDuration = (ms: number) => {
    if (ms <= 0) return '0 秒'
    const totalSec = Math.ceil(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const parts: string[] = []
    if (days) parts.push(`${days} 天`)
    if (hours) parts.push(`${hours} 小时`)
    if (minutes) parts.push(`${minutes} 分`)
    if (seconds || !parts.length) parts.push(`${seconds} 秒`)
    return parts.join(' ')
}

const showDelayProgress = computed(() => {
    const d = detail.value
    return d?.state === 'delayed' && !!d.delay && d.delay > 0 && !!d.timestamp
})

const delayRemaining = computed(() => {
    if (!showDelayProgress.value || !detail.value?.delayedUntil) return 0
    return Math.max(0, detail.value.delayedUntil - now.value)
})

const delayProgress = computed(() => {
    const d = detail.value
    if (!showDelayProgress.value || !d?.timestamp || !d.delay) return 0
    const elapsed = now.value - d.timestamp
    return Math.min(100, Math.max(0, Math.round((elapsed / d.delay) * 100)))
})

const delayProgressColor = computed(() => {
    if (delayProgress.value >= 100) return 'var(--el-color-success)'
    if (delayProgress.value >= 75) return 'var(--el-color-warning)'
    return 'var(--el-color-primary)'
})

const isDelayComplete = computed(() => delayProgress.value >= 100)
const isDelayNear = computed(() => delayProgress.value >= 75 && delayProgress.value < 100)

const showActiveProgress = computed(() => {
    const p = detail.value?.progress
    return detail.value?.state === 'active' && typeof p === 'number'
})

const activeProgress = computed(() => {
    const p = detail.value?.progress
    return typeof p === 'number' ? Math.min(100, Math.max(0, Math.round(p))) : 0
})

const startTick = () => {
    stopTick()
    if (!showDelayProgress.value) return
    tickTimer = setInterval(() => {
        now.value = Date.now()
    }, 1000)
}

const stopTick = () => {
    if (tickTimer) {
        clearInterval(tickTimer)
        tickTimer = null
    }
}

const dataJson = computed(() => {
    if (!detail.value?.data) return '{}'
    try {
        return JSON.stringify(detail.value.data, null, 2)
    } catch {
        return String(detail.value.data)
    }
})

const stateLabel = computed(() => STATE_LABELS[detail.value?.state || ''] || detail.value?.state || '-')

const stateTagType = computed((): 'success' | 'warning' | 'info' | 'danger' | 'primary' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
        waiting: 'info',
        active: 'primary',
        delayed: 'warning',
        failed: 'danger',
        completed: 'success',
    }
    return map[detail.value?.state || ''] ?? 'info'
})

const loadDetail = async (silent = false) => {
    if (!props.queueName || !props.jobId) {
        detail.value = null
        return
    }
    if (!silent) loading.value = true
    try {
        detail.value = await fetchGetQueueJobDetail({
            queueName: props.queueName,
            jobId: props.jobId,
        })
    } catch {
        detail.value = null
    } finally {
        if (!silent) loading.value = false
        now.value = Date.now()
    }
}

const handleRetry = async () => {
    actionLoading.value = true
    try {
        await fetchRetryQueueJob({ queueName: props.queueName!, jobId: props.jobId! })
        emit('refresh')
        emit('ops-done')
        loadDetail()
    } finally {
        actionLoading.value = false
    }
}

const handlePromote = () => {
    ElMessageBox.confirm('确定要立即执行该延迟任务吗？', '立即执行', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        actionLoading.value = true
        try {
            await fetchPromoteQueueJob({ queueName: props.queueName!, jobId: props.jobId! })
            emit('ops-done')
            loadDetail()
        } finally {
            actionLoading.value = false
        }
    })
}

const handleRemove = () => {
    ElMessageBox.confirm('确定要删除该任务吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        actionLoading.value = true
        try {
            await fetchRemoveQueueJob({ queueName: props.queueName!, jobId: props.jobId! })
            detail.value = null
            emit('refresh')
        } finally {
            actionLoading.value = false
        }
    })
}

watch(() => [props.queueName, props.jobId], () => {
    loadDetail()
}, { immediate: true })

watch(showDelayProgress, (val) => {
    if (val) startTick()
    else stopTick()
}, { immediate: true })

watch(delayProgress, (val, oldVal) => {
    if (val >= 100 && oldVal < 100 && showDelayProgress.value && !loading.value) {
        setTimeout(() => {
            loadDetail()
            emit('refresh')
        }, 600)
    }
})

onUnmounted(() => {
    stopTick()
})

defineExpose({
    reload: (silent = false) => loadDetail(silent),
})
</script>

<style scoped lang="scss">
.job-detail-card {
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
    padding: 14px 16px;
}

.detail-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.detail-title {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
}

.state-tag {
    flex-shrink: 0;
    width: fit-content;
    max-width: none;
}

.detail-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    margin-bottom: 14px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
}

.meta-row {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 8px;
    align-items: start;
    font-size: 12px;
    line-height: 1.5;
}

.meta-label {
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
}

.meta-value {
    color: var(--el-text-color-primary);
    word-break: break-all;

    &.mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
    }
}

.detail-block {
    margin-bottom: 14px;

    &.is-error .code-block {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
        border-color: var(--el-color-danger-light-7);
    }
}

.block-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.delay-block {
    padding: 14px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-fill-color-blank) 100%);
    border: 1px solid var(--el-color-primary-light-5);
    transition: background 0.3s ease, border-color 0.3s ease;

    .delay-percent {
        color: var(--el-color-primary);
        transition: color 0.3s ease;
    }

    &.is-near {
        background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-fill-color-blank) 100%);
        border-color: var(--el-color-warning-light-5);

        .delay-percent {
            color: var(--el-color-warning);
        }
    }

    &.is-complete {
        background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-fill-color-blank) 100%);
        border-color: var(--el-color-success-light-5);

        .delay-percent {
            color: var(--el-color-success);
        }
    }
}

.delay-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
}

.delay-head-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.delay-head-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.delay-remain {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.delay-percent {
    flex-shrink: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}

.delay-foot {
    margin-top: 8px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
}

.delay-soon {
    font-size: 12px;
    color: var(--el-color-success);
    font-weight: 600;
}

.code-block {
    margin: 0;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 220px;
    overflow: auto;
}
</style>
