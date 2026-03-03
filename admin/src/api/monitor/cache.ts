import request from '@/utils/http'

/**
 * 查询类型
 */
export function fetchGetCacheTypeList() {
    return request.get<string[]>({
        url: '/api/monitor/cache/type',
    })
}

/**
 * 查询列表
 */
export function fetchGetCacheList(params: Api.MonitorCache.CacheListDto) {
    return request.get<string[]>({
        url: '/api/monitor/cache/list',
        params,
    })
}

/**
 * 查询详情
 */
export function fetchGetCacheKey(params: Api.MonitorCache.CacheKeyDto) {
    return request.get<any>({
        url: '/api/monitor/cache/key',
        params,
    })
}

/**
 * 更新指定缓存
 */
export function fetchUpdateCacheKey(data: Api.MonitorCache.UpdateCacheDto) {
    return request.put({
        url: '/api/monitor/cache/update-key',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 清除指定类型
 */
export function fetchClearCacheType(params: Api.MonitorCache.CacheListDto) {
    return request.del({
        url: '/api/monitor/cache/clear-type',
        params,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 清除指定缓存
 */
export function fetchClearCacheKey(params: Api.MonitorCache.CacheKeyDto) {
    return request.del({
        url: '/api/monitor/cache/clear-key',
        params,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}