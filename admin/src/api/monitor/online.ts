import request from '@/utils/http'

/**
 * 查询列表
 */
export function fetchGetOnlineList(params: Api.MonitorOnline.OnlineSearchParams) {
    return request.get<Api.MonitorOnline.OnlineList>({
        url: '/api/monitor/online/list',
        params
    })
}

/**
 * 强退
 */
export function fetchForceLogout(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/monitor/online/forceLogout/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}