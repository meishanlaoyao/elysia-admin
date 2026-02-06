import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateDept(data: Api.SystemDept.DeptListItem) {
    return request.post({
        url: '/api/system/dept',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 查询部门树
 */
export function fetchGetDeptTree(params: Api.SystemDept.DeptSearchParams) {
    return request.get<Api.SystemDept.DeptListItem[]>({
        url: '/api/system/dept/tree',
        params
    })
}

/**
 * 下拉选项数据
 */
export function fetchGetDeptOptions() {
    return request.get<Api.SystemDept.DeptListItem[]>({
        url: '/api/system/dept/options',
    })
}

/**
 * 更新
 */
export function fetchUpdateDept(data: Api.SystemDept.DeptListItem) {
    return request.put({
        url: '/api/system/dept',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteDept(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/dept/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}