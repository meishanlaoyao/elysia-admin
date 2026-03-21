declare namespace Api {
    namespace WxmpUser {

        type UserList = Api.Common.PaginatedResponse<UserListItem>

        interface UserListItem {
            userId?: string;
            username?: string;
            nickname?: string;
            phone?: string;
            sex?: string;
            avatar?: string;
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
            Pick<UserListItem, 'sex' | 'username' | 'nickname' | 'phone' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}