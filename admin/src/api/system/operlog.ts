import request from '@/utils/http'

/**
 * 查询列表
 */
export function fetchGetOperLogList(params: Api.SystemOperLog.OperLogSearchParams) {
    return request.get<Api.SystemOperLog.OperLogList>({
        url: '/api/system/oper-log/list',
        params
    })
}

/**
 * 删除
 */
export function fetchDeleteOperLog(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/oper-log/${str}`
    })
}