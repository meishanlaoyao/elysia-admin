declare namespace Api {
    namespace BusinessOrders {
        interface OrdersListItem {
            id: number;
            orderNo: string;
            status: string;
            userId: number;
            merchantId: number;
            title: string;
            description: string;
            amount: number;
            currency: string;
            expireTime?: Date;
            timeout: number;
            extra?: any;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            configList?: MerchantConfigItem[];
            remark?: null | string;
        }

        type OrdersList = Api.Common.PaginatedResponse<OrdersListItem>

        type OrdersSearchParams = Partial<
            Pick<OrdersListItem, 'orderNo' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}