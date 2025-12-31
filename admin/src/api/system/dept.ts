import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateDept(data: Api.SystemDept.DeptListItem) {
    return request.post({
        url: '/api/system/dept',
        data
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
 * 更新
 */
export function fetchUpdateDept(data: Api.SystemDept.DeptListItem) {
    return request.put({
        url: '/api/system/dept',
        data
    })
}

/**
 * 删除
 */
export function fetchDeleteDept(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/dept/${str}`
    })
}