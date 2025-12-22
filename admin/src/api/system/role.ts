import request from '@/utils/http'

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemRole.RoleSearchParams) {
    return request.get<Api.SystemRole.RoleList>({
        url: '/api/system/role/list',
        params
    })
}