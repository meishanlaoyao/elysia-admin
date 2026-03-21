import request from '@/utils/http'

/**
 * 查询列表
 * @param params 
 * @returns 
 */
export function fetchGetWxmpUserList(params: Api.WxmpUser.UserSearchParams) {
    return request.get<Api.WxmpUser.UserList>({
        url: '/api/wxmp/user/list',
        params
    })
}

/**
 * 更新
 */
export function fetchUpdateWxmpUser(data: Api.WxmpUser.UserListItem) {
    return request.put({
        url: '/api/wxmp/user',
        data,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}

/**
 * 删除
 */
export function fetchDeleteWxmpUser(ids: string | string[]) {
    let str = Array.isArray(ids) ? ids.join(',') : ids.toString()
    return request.del({
        url: `/api/wxmp/user/${str}`,
        showSuccessMessage: true, // 显示成功消息
        showErrorMessage: true // 显示错误消息
    })
}