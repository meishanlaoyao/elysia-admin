<template>
    <div class="queue-page art-full-height">
        <ElRow :gutter="16" class="queue-row">
            <ElCol :span="5">
                <QueueList ref="queueListRef" :selected-queue="selectedQueue" v-model:poll-interval="pollInterval"
                    @select-queue="handleSelectQueue" @loaded="handleQueueLoaded" @refresh="handleQueueRefresh"
                    @ops-done="handleOpsDone" />
            </ElCol>
            <ElCol :span="11">
                <JobList ref="jobListRef" :queue-name="selectedQueue" :selected-job-id="selectedJobId"
                    :queue-counts="selectedCounts" @select-job="handleSelectJob" @refresh="handleJobRefresh"
                    @ops-done="handleOpsDone" />
            </ElCol>
            <ElCol :span="8">
                <JobDetail ref="jobDetailRef" :queue-name="selectedQueue" :job-id="selectedJobId"
                    @refresh="handleJobRefresh" @ops-done="handleOpsDone" />
            </ElCol>
        </ElRow>
    </div>
</template>

<script setup lang="ts">
import QueueList from './modules/queue-list.vue'
import JobList from './modules/job-list.vue'
import JobDetail from './modules/job-detail.vue'

defineOptions({ name: 'QueueMonitor' })

const selectedQueue = ref('')
const selectedJobId = ref('')
const selectedCounts = ref<Api.MonitorQueue.QueueCounts>({})
const pollInterval = ref(0)

const queueListRef = ref<InstanceType<typeof QueueList>>()
const jobListRef = ref<InstanceType<typeof JobList>>()
const jobDetailRef = ref<InstanceType<typeof JobDetail>>()

let pollTimer: ReturnType<typeof setInterval> | null = null
let polling = false

const handleSelectQueue = (name: string, counts: Api.MonitorQueue.QueueCounts) => {
    selectedQueue.value = name
    selectedCounts.value = counts
    selectedJobId.value = ''
}

const handleSelectJob = (jobId: string) => {
    selectedJobId.value = jobId
}

const handleQueueLoaded = (list: Api.MonitorQueue.QueueListItem[]) => {
    if (!selectedQueue.value) return
    const item = list.find((q) => q.name === selectedQueue.value)
    if (item) selectedCounts.value = item.counts
}

const handleQueueRefresh = () => {
    selectedQueue.value = ''
    selectedJobId.value = ''
    selectedCounts.value = {}
}

const handleJobRefresh = () => {
    selectedJobId.value = ''
}

const handleOpsDone = () => {
    tickPoll()
}

const stopPoll = () => {
    if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
    }
}

const tickPoll = async () => {
    if (polling) return
    polling = true
    try {
        await queueListRef.value?.reload(true)
        if (selectedQueue.value) {
            await jobListRef.value?.reload(true)
        }
        if (selectedJobId.value) {
            await jobDetailRef.value?.reload(true)
        }
    } finally {
        polling = false
    }
}

const startPoll = () => {
    stopPoll()
    if (!pollInterval.value) return
    pollTimer = setInterval(tickPoll, pollInterval.value)
}

watch(pollInterval, () => {
    startPoll()
})

onActivated(() => {
    if (pollInterval.value > 0) {
        tickPoll()
        startPoll()
    }
})

onDeactivated(() => {
    stopPoll()
})

onUnmounted(() => {
    stopPoll()
})
</script>

<style scoped lang="scss">
.queue-page {
    overflow: hidden;
}

.queue-row {
    height: 100%;
    display: flex !important;
    flex-wrap: nowrap !important;
}
</style>
