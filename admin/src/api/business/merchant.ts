import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateMerchant(data: Partial<Api.BusinessMerchant.MerchantListItem>) {
    return request.post({
        url: '/api/business/merchant',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 创建商户配置
 */
export function fetchCreateMerchantConfig(data: Partial<Api.BusinessMerchant.MerchantConfigItem>) {
    return request.post({
        url: '/api/business/merchant/config',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询商户配置
 */
export function fetchGetMerchantConfig(id: number) {
    return request.get<Api.BusinessMerchant.MerchantConfigItem>({
        url: `/api/business/merchant/config/${id}`,
    })
}

/**
 * 查询列表
 */
export function fetchGetMerchantList(params: Api.BusinessMerchant.MerchantSearchParams) {
    return request.get<Api.BusinessMerchant.MerchantList>({
        url: '/api/business/merchant/list',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateMerchant(data: Partial<Api.BusinessMerchant.MerchantListItem>) {
    return request.put({
        url: '/api/business/merchant',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 更新商户配置
 */
export function fetchUpdateMerchantConfig(data: Partial<Api.BusinessMerchant.MerchantConfigItem>) {
    return request.put({
        url: '/api/business/merchant/config',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteMerchant(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/business/merchant/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除商户配置
 */
export function fetchDeleteMerchantConfig(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/business/merchant/config/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}