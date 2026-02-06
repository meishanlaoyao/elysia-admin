import request from '@/utils/http'

/**
 * 创建
 */
export function fetchCreateUser(data: Api.SystemUser.UserListItem & { roles: number[] }) {
    return request.post({
        url: '/api/system/user',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

// 获取用户列表
export function fetchGetUserList(params: Api.SystemUser.UserSearchParams) {
    return request.get<Api.SystemUser.UserList>({
        url: '/api/system/user/list',
        params
    })
}

// 查询个人基本信息
export function fetchGetUserBasic() {
    return request.get<Api.SystemUser.UserListItem & { deptName: string }>({
        url: '/api/system/user/basic'
    })
}

// 更新个人基本信息
export function fetchUpdateUserBasic(data: Api.SystemUser.UserListItem) {
    return request.put({
        url: '/api/system/user/basic',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
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
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 修改密码
 */
export function fetchUpdateUserPassword(data: { oldPassword: string, newPassword: string }) {
    return request.put({
        url: '/api/system/user/password',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteUser(ids: number | number[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/system/user/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}