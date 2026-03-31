declare namespace Api {
    namespace SystemApi {
        interface ApiListItem {
            apiId?: number;
            apiName?: string;
            apiPath?: string;
            apiMethod?: string;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type ApiList = Api.Common.PaginatedResponse<ApiListItem>

        type ApiSearchParams = Partial<
            Pick<ApiListItem, 'apiName' | 'apiPath' | 'apiMethod'> &
            Api.Common.CommonSearchParams
        >
    }
}