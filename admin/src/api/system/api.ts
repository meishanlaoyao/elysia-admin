import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateApi(data: Api.SystemApi.ApiListItem) {
    return request.post({
        url: '/api/system/api',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询列表
 */
export function fetchGetApiList(params: Api.SystemApi.ApiSearchParams) {
    return request.get<Api.SystemApi.ApiList>({
        url: '/api/system/api/list',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateApi(data: Api.SystemApi.ApiListItem) {
    return request.put({
        url: '/api/system/api',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteApi(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/api/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}