declare namespace Api {
    namespace SystemUser {
        /** 用户列表 */
        type UserList = Api.Common.PaginatedResponse<UserListItem>

        /** 用户列表项 */
        interface UserListItem {
            userId?: number;
            username?: string;
            password?: string;
            nickname?: string;
            email?: string;
            phone?: string;
            sex?: string;
            avatar?: string;
            deptId?: number;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        /** 用户搜索参数 */
        type UserSearchParams = Partial<
            Pick<UserListItem, 'id' | 'username' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}