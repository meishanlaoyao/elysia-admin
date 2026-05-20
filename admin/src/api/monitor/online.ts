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
export function fetchForceLogout(ids: string | string[]) {
    const str = Array.isArray(ids) ? ids.join(',') : ids
    return request.del({
        url: `/api/monitor/online/forceLogout/${str}`,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}