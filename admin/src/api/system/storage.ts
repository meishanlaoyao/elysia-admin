import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateStorage(data: Api.SystemStorage.StorageListItem) {
    return request.post({
        url: '/api/system/storage',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询列表
 */
export function fetchGetStorageList(params: Api.SystemStorage.StorageSearchParams) {
    return request.get<Api.SystemStorage.StorageList>({
        url: '/api/system/storage/list',
        params
    })
}

/**
 * 生成预签名URL
 */
export function fetchGeneratePresign(params: { fileName: string }) {
    return request.get<string>({
        url: '/api/system/storage/presign',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateStorage(data: Api.SystemStorage.StorageListItem) {
    return request.put({
        url: '/api/system/storage',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteStorage(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/storage/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}