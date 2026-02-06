import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateIpBlack(data: Api.SystemIpBlack.IpBlackItem) {
    return request.post({
        url: '/api/system/ip-black',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询全部
 */
export function fetchGetIpBlackAll(params: Api.SystemIpBlack.IpBlackSearchParams) {
    return request.get<Api.SystemIpBlack.IpBlackItem[]>({
        url: '/api/system/ip-black/all',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateIpBlack(data: Api.SystemIpBlack.IpBlackItem) {
    return request.put({
        url: '/api/system/ip-black',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteIpBlack(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/ip-black/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}