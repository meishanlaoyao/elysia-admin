declare namespace Api {
    namespace SystemOperLog {
        interface OperLogListItem {
            operId: number;
            title: string | null;
            action: string | null;
            requestMethod: string;
            operatorType: string | null;
            userId: string | null;
            operName: string | null;
            operUrl: string | null;
            operIp: string | null;
            operLocation: string | null;
            operParam: string | null;
            jsonResult: string | null;
            costTime: number | null;
            status: boolean | null;
            createTime?: Date;
            createBy?: string | null;
            updateTime?: null | Date;
            updateBy?: null | string;
            delFlag?: boolean;
            remark?: null | string;
        }

        type OperLogList = Api.Common.PaginatedResponse<OperLogListItem>

        type OperLogSearchParams = Partial<
            Api.Common.CommonSearchParams
        >
    }
}