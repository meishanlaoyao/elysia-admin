declare namespace Api {
    namespace SystemRole {
        /** 角色列表 */
        type RoleList = Api.Common.PaginatedResponse<RoleListItem>

        /** 角色列表项 */
        interface RoleListItem {
            roleId: number
            roleName: string
            roleCode: string
            description: string
            enabled: boolean
            createTime: string
        }

        /** 角色搜索参数 */
        type RoleSearchParams = Partial<
            Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
            Api.Common.CommonSearchParams
        >
    }
}