declare namespace Api {
    namespace SystemLoginLog {
        interface LoginLogListItem {
            logId?: number;
            loginType?: string;
            loginName?: string;
            clientType?: string;
            clientPlatform?: string;
            ipaddr?: string;
            loginLocation?: string;
            userAgent?: string;
            os?: string;
            message?: string;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type LoginLogList = Api.Common.PaginatedResponse<LoginLogListItem>

        type LoginLogSearchParams = Partial<
            Api.Common.CommonSearchParams
        >
    }
}