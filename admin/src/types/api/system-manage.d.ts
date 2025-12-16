/**
 * API 系统管理类型定义
 *
 * 提供用户、角色等系统管理相关类型
 *
 * @module types/api/system-manage
 */

declare namespace Api {
    /** 系统管理类型 */
    namespace SystemManage {
        /** 用户列表 */
        type UserList = Api.Common.PaginatedResponse<UserListItem>

        /** 用户列表项 */
        interface UserListItem {
            id: number
            avatar: string
            status: string
            userName: string
            userGender: string
            nickName: string
            userPhone: string
            userEmail: string
            userRoles: string[]
            createBy: string
            createTime: string
            updateBy: string
            updateTime: string
        }

        /** 用户搜索参数 */
        type UserSearchParams = Partial<
            Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
            Api.Common.CommonSearchParams
        >

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
