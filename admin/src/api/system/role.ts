import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateRole(data: Api.SystemRole.RoleListItem) {
    return request.post({
        url: '/api/system/role',
        data
    })
}

/**
 * 查询列表
 */
export function fetchGetRoleList(params: Api.SystemRole.RoleSearchParams) {
    return request.get<Api.SystemRole.RoleList>({
        url: '/api/system/role/list',
        params
    })
}

/**
 * 查询角色权限
 */
export function fetchGetRolePermission(roleId: number) {
    return request.get<Api.SystemRole.RolePermission[]>({
        url: `/api/system/role/permission/${roleId}`
    })
}

/**
 * 更新
 */
export function fetchUpdateRole(data: Api.SystemRole.RoleListItem) {
    return request.put({
        url: '/api/system/role',
        data
    })
}

/**
 * 更新角色权限
 */
export function fetchUpdateRolePermission(data: Api.SystemRole.UpdateRolePermissionParams) {
    return request.put({
        url: '/api/system/role/permission',
        data
    })
}

/**
 * 删除
 */
export function fetchDeleteRole(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/role/${str}`
    })
}