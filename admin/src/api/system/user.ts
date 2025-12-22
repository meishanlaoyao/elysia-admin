import request from '@/utils/http'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemUser.UserSearchParams) {
    return request.get<Api.SystemUser.UserList>({
        url: '/api/system/user/list',
        params
    })
}