import request from '@/utils/http'

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
    return request.get<Api.SystemManage.RoleList>({
        url: '/api/system/role/list',
        params
    })
}