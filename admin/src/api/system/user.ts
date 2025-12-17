import request from '@/utils/http'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
    return request.get<Api.SystemManage.UserList>({
        url: '/api/system/user/list',
        params
    })
}