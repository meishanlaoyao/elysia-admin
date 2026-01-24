import request from '@/utils/http'

/**
 * 查询列表
 */
export function fetchGetLoginLogList(params: Api.SystemLoginLog.LoginLogSearchParams) {
    return request.get<Api.SystemLoginLog.LoginLogList>({
        url: '/api/system/login-log/list',
        params
    })
}

/**
 * 删除
 */
export function fetchDeleteLoginLog(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/login-log/${str}`
    })
}