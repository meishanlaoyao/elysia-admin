import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateUser(data: Api.SystemUser.UserListItem & { roles: number[] }) {
    return request.post({
        url: '/api/system/user',
        data
    })
}

// 获取用户列表
export function fetchGetUserList(params: Api.SystemUser.UserSearchParams) {
    return request.get<Api.SystemUser.UserList>({
        url: '/api/system/user/list',
        params
    })
}

/**
 * 查询详情
 */
export function fetchGetUserDetail(id: number) {
    return request.get<Api.SystemUser.UserListItem>({
        url: `/api/system/user/${id}`
    })
}

/**
 * 更新
 */
export function fetchUpdateUser(data: Api.SystemUser.UserListItem & { roles: number[] }) {
    return request.put({
        url: '/api/system/user',
        data
    })
}

/**
 * 删除
 */
export function fetchDeleteUser(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/user/${str}`
    })
}