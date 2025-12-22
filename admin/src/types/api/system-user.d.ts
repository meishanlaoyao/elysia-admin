declare namespace Api {
    namespace SystemUser {
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
    }
}