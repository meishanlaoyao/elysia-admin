<template>
    <ElCard class="job-list-card" shadow="never">
        <template #header>
            <div class="card-header">
                <span>任务列表</span>
                <ElSpace :size="8">
                    <ElDropdown v-if="queueName && showBatchMenu" trigger="click" @command="handleBatch">
                        <ElButton size="small" text type="primary">
                            批量
                            <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                        </ElButton>
                        <template #dropdown>
                            <ElDropdownMenu>
                                <ElDropdownItem v-if="(queueCounts?.failed ?? 0) > 0" command="retry-all"
                                    v-auth="'monitor:queue:retry'">
                                    重试全部失败
                                </ElDropdownItem>
                                <ElDropdownItem v-if="(queueCounts?.delayed ?? 0) > 0" command="promote-all"
                                    v-auth="'monitor:queue:promote'">
                                    全部立即执行
                                </ElDropdownItem>
                            </ElDropdownMenu>
                        </template>
                    </ElDropdown>
                    <ElDropdown v-if="queueName" trigger="click" @command="handleClean">
                        <ElButton size="small" text type="primary" v-auth="'monitor:queue:clean'">
                            清空
                            <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                        </ElButton>
                        <template #dropdown>
                            <ElDropdownMenu>
                                <ElDropdownItem command="completed">清空已完成</ElDropdownItem>
                                <ElDropdownItem command="failed">清空失败</ElDropdownItem>
                            </ElDropdownMenu>
                        </template>
                    </ElDropdown>
                    <ElButton :icon="Refresh" circle size="small" @click="refreshList" :loading="loading"
                        :disabled="!queueName" />
                </ElSpace>
            </div>
        </template>

        <div v-loading="loading" class="job-content">
            <template v-if="queueName">
                <div class="state-filter">
                    <button v-for="tab in stateTabs" :key="tab.value" type="button" class="state-chip"
                        :class="{ 'is-selected': activeState === tab.value }"
                        @click="switchState(tab.value)">
                        <span class="chip-label">{{ tab.label }}</span>
                        <span class="chip-count">{{ getCount(tab.value) }}</span>
                    </button>
                </div>

                <div class="job-list">
                    <div v-for="job in jobList" :key="job.id" class="job-item"
                        :class="{ 'is-active': selectedJobId === job.id }" @click="handleSelectJob(job.id!)">
                        <div class="job-main">
                            <div class="job-name" :title="job.name || '-'">{{ job.name || '未命名任务' }}</div>
                            <div class="job-sub">
                                <ElTooltip :content="String(job.id)" placement="top" :show-after="300">
                                    <span class="job-id">{{ formatJobId(String(job.id)) }}</span>
                                </ElTooltip>
                                <span class="job-dot">·</span>
                                <span>第 {{ job.attemptsMade ?? 0 }} 次</span>
                                <span v-if="job.timestamp" class="job-time">{{ formatTime(job.timestamp) }}</span>
                            </div>
                        </div>
                        <ElButton v-if="canRemoveQueueJob(job.id, job.state)" :icon="Delete" circle size="small" text
                            type="danger" class="job-delete" v-auth="'monitor:queue:delete'"
                            @click.stop="handleRemove(job.id!)" />
                    </div>

                    <ElEmpty v-if="!loading && jobList.length === 0" description="暂无任务" :image-size="72" />
                </div>

                <div v-if="total > 0" class="list-footer">
                    <span class="footer-total">共 {{ total }} 条</span>
                    <div class="footer-pager">
                        <ElButton size="small" text :disabled="pageNum <= 1" @click="goPrev">上一页</ElButton>
                        <span class="footer-page">{{ pageNum }} / {{ totalPages }}</span>
                        <ElButton size="small" text :disabled="pageNum >= totalPages" @click="goNext">下一页</ElButton>
                    </div>
                </div>
            </template>
            <ElEmpty v-else description="请先选择队列" :image-size="80" />
        </div>
    </ElCard>
</template>

<script setup lang="ts">
import { Refresh, Delete, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { fetchGetQueueJobs, fetchRemoveQueueJob, fetchCleanQueue, fetchRetryAllQueueJobs, fetchPromoteAllQueueJobs } from '@/api/monitor/queue'
import { canRemoveQueueJob } from '../shared'

defineOptions({ name: 'JobList' })

interface Props {
    queueName?: string
    selectedJobId?: string
    queueCounts?: Api.MonitorQueue.QueueCounts
}

interface Emits {
    (e: 'select-job', jobId: string): void
    (e: 'refresh'): void
    (e: 'ops-done'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const jobList = ref<Api.MonitorQueue.JobListItem[]>([])
const activeState = ref<Api.MonitorQueue.JobState>('waiting')
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

const stateTabs: Array<{ label: string; value: Api.MonitorQueue.JobState }> = [
    { label: '等待', value: 'waiting' },
    { label: '执行', value: 'active' },
    { label: '延迟', value: 'delayed' },
    { label: '失败', value: 'failed' },
    { label: '完成', value: 'completed' },
]

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const showBatchMenu = computed(() => {
    const failed = props.queueCounts?.failed ?? 0
    const delayed = props.queueCounts?.delayed ?? 0
    return failed > 0 || delayed > 0
})

const getCount = (state: Api.MonitorQueue.JobState) => props.queueCounts?.[state] ?? 0

const formatTime = (ts: number) => {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatJobId = (id: string) => {
    if (id.length <= 14) return id
    return `${id.slice(0, 6)}…${id.slice(-6)}`
}

const loadJobs = async (silent = false) => {
    if (!props.queueName) {
        jobList.value = []
        total.value = 0
        return
    }
    if (!silent) loading.value = true
    try {
        const res = await fetchGetQueueJobs({
            queueName: props.queueName,
            state: activeState.value,
            pageNum: pageNum.value,
            pageSize: pageSize.value,
        })
        jobList.value = res?.list || []
        total.value = res?.total ?? 0
    } finally {
        if (!silent) loading.value = false
    }
}

const refreshList = () => {
    pageNum.value = 1
    loadJobs()
    emit('refresh')
}

const switchState = (state: Api.MonitorQueue.JobState) => {
    if (activeState.value === state) return
    activeState.value = state
    pageNum.value = 1
    emit('select-job', '')
    loadJobs()
}

const handleSelectJob = (jobId: string) => {
    emit('select-job', jobId)
}

const goPrev = () => {
    if (pageNum.value <= 1) return
    pageNum.value -= 1
    loadJobs()
}

const goNext = () => {
    if (pageNum.value >= totalPages.value) return
    pageNum.value += 1
    loadJobs()
}

const handleRemove = (jobId: string) => {
    ElMessageBox.confirm(`确定要删除该任务吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await fetchRemoveQueueJob({ queueName: props.queueName!, jobId })
        if (props.selectedJobId === jobId) emit('select-job', '')
        loadJobs()
    })
}

const handleClean = (state: 'completed' | 'failed') => {
    const label = state === 'completed' ? '已完成' : '失败'
    ElMessageBox.confirm(`确定要清空当前队列的所有${label}任务吗？`, '清空确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await fetchCleanQueue({ queueName: props.queueName!, state, grace: 0 })
        loadJobs()
        emit('ops-done')
    })
}

const handleBatch = (command: string) => {
    if (!props.queueName) return
    if (command === 'retry-all') {
        ElMessageBox.confirm('确定要重试当前队列的全部失败任务吗？（最多 500 条）', '批量重试', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await fetchRetryAllQueueJobs({ queueName: props.queueName! })
            loadJobs()
            emit('ops-done')
        })
    } else if (command === 'promote-all') {
        ElMessageBox.confirm('确定要将当前队列的全部延迟任务立即执行吗？（最多 500 条）', '批量提升', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(async () => {
            await fetchPromoteAllQueueJobs({ queueName: props.queueName! })
            loadJobs()
            emit('ops-done')
        })
    }
}

watch(() => props.queueName, () => {
    activeState.value = 'waiting'
    pageNum.value = 1
    emit('select-job', '')
    loadJobs()
})

onMounted(() => {
    if (props.queueName) loadJobs()
})

defineExpose({
    reload: (silent = false) => loadJobs(silent),
})
</script>

<style scoped lang="scss">
.job-list-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
        flex: 1;
        overflow: hidden;
        padding: 0;
        display: flex;
        flex-direction: column;
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.job-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 12px;
    gap: 10px;
}

.state-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: 2px;
}

.state-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 999px;
    background: var(--el-fill-color-blank);
    color: var(--el-text-color-regular);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1.4;

    &:hover {
        border-color: var(--el-color-primary-light-5);
        color: var(--el-color-primary);
    }

    &.is-selected {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 600;

        .chip-count {
            background: var(--el-color-primary);
            color: #fff;
        }
    }
}

.chip-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 18px;
    text-align: center;
}

.job-list {
    flex: 1;
    overflow-y: auto;
    margin: 0 -4px;
    padding: 0 4px;
}

.job-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--el-color-primary-light-7);
        box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
    }

    &.is-active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
    }
}

.job-main {
    flex: 1;
    min-width: 0;
}

.job-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
}

.job-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
}

.job-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: var(--el-color-primary);
    cursor: default;
}

.job-dot {
    opacity: 0.5;
}

.job-time {
    margin-left: auto;
    white-space: nowrap;
}

.job-delete {
    flex-shrink: 0;
    transition: opacity 0.2s ease;
}

.list-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.footer-pager {
    display: flex;
    align-items: center;
    gap: 4px;
}

.footer-page {
    min-width: 52px;
    text-align: center;
    color: var(--el-text-color-regular);
}
</style>
