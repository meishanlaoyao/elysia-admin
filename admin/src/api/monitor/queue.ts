import request from '@/utils/http'

export function fetchGetQueueList() {
    return request.get<Api.MonitorQueue.QueueListItem[]>({
        url: '/api/monitor/queue/list',
    })
}

export function fetchGetQueueJobs(params: Api.MonitorQueue.JobListParams) {
    return request.get<Api.MonitorQueue.JobList>({
        url: '/api/monitor/queue/jobs',
        params,
    })
}

export function fetchGetQueueJobDetail(params: Api.MonitorQueue.JobDetailParams) {
    return request.get<Api.MonitorQueue.JobDetail>({
        url: '/api/monitor/queue/job',
        params,
    })
}

export function fetchRetryQueueJob(data: Api.MonitorQueue.RetryJobDto) {
    return request.post({
        url: '/api/monitor/queue/job/retry',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchRemoveQueueJob(params: Api.MonitorQueue.JobDetailParams) {
    return request.del({
        url: '/api/monitor/queue/job',
        params,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchCleanQueue(params: Api.MonitorQueue.CleanQueueParams) {
    return request.del<Api.MonitorQueue.CleanQueueResult>({
        url: '/api/monitor/queue/clean',
        params,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchPauseQueue(data: Api.MonitorQueue.PauseQueueDto) {
    return request.post<Api.MonitorQueue.PauseQueueResult>({
        url: '/api/monitor/queue/pause',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchRetryAllQueueJobs(data: Api.MonitorQueue.QueueBatchDto) {
    return request.post<Api.MonitorQueue.BatchOpsResult>({
        url: '/api/monitor/queue/jobs/retry-all',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchPromoteQueueJob(data: Api.MonitorQueue.PromoteJobDto) {
    return request.post({
        url: '/api/monitor/queue/job/promote',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}

export function fetchPromoteAllQueueJobs(data: Api.MonitorQueue.QueueBatchDto) {
    return request.post<Api.MonitorQueue.BatchOpsResult>({
        url: '/api/monitor/queue/jobs/promote-all',
        data,
        showSuccessMessage: true,
        showErrorMessage: true,
    })
}
