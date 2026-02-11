import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateJob(data: Api.MonitorJob.JobListItem) {
    return request.post({
        url: '/api/monitor/job',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询列表
 */
export function fetchGetJobList(params: Api.MonitorJob.JobSearchParams) {
    return request.get<Api.MonitorJob.JobList>({
        url: '/api/monitor/job/list',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateJob(data: Api.MonitorJob.JobListItem) {
    return request.put({
        url: '/api/monitor/job',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteJob(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/monitor/job/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}