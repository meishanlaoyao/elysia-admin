declare namespace Api {
    namespace MonitorOnline {
        interface OnlineListItem {
            userId: number;
            username: string;
            email: string;
            phone: string;
            sex: string;
            avatar: null | string;
            loginLocation: string;
            ipaddr: string;
            userType: string;
            loginTime: Date;
        }

        type OnlineList = Api.Common.PaginatedResponse<OnlineListItem>;

        type OnlineSearchParams = Partial<Api.Common.CommonSearchParams>
    }
}