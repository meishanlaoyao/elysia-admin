import request from '@/utils/http'

/**
 * 创建-类型​
 */
export function fetchCreateDictType(data: Api.SystemDict.DictTypeListItem) {
    return request.post({
        url: '/api/system/dict/type',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/** 
 * 创建-数据​
 */
export function fetchCreateDictData(data: Api.SystemDict.DictDataListItem) {
    return request.post({
        url: '/api/system/dict/data',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询列表-类型​
 */
export function fetchGetDictTypeList(params: Api.SystemDict.DictTypeSearchParams) {
    return request.get<Api.SystemDict.DictTypeList>({
        url: '/api/system/dict/type/list',
        params
    })
}

/**
 * 查询列表-数据
 */
export function fetchGetDictDataList(params: Api.SystemDict.DictDataSearchParams) {
    return request.get<Api.SystemDict.DictDataList>({
        url: '/api/system/dict/data/list',
        params
    })
}

/**
 * 更新-类型
 */
export function fetchUpdateDictType(data: Api.SystemDict.DictTypeListItem) {
    return request.put({
        url: '/api/system/dict/type',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 更新-数据
 */
export function fetchUpdateDictData(data: Api.SystemDict.DictDataListItem) {
    return request.put({
        url: '/api/system/dict/data',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除-类型
 */
export function fetchDeleteDictType(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/dict/type/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}



/**
 * 删除-数据
 */
export function fetchDeleteDictData(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/dict/data/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询所有-缓存类型
 */
export function fetchGetCacheDictTypeList() {
    return request.get<Api.SystemDict.DictTypeListItem[]>({
        url: '/api/system/dict/type/all'
    })
}

/**
 * 查询所有-缓存数据
 * @param dictType 字典类型
 * @returns 
 */
export function fetchGetDictDataListByType(dictType: string) {
    return request.get<Api.SystemDict.DictDataListItem[]>({
        url: `/api/system/dict/data/all`,
        params: { dictType }
    })
}