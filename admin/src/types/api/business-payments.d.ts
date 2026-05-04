declare namespace Api {
    namespace BusinessPayments {
        interface PaymentsListItem {
            id: number; // 支付记录ID（自增主键）
            orderId: number; // 关联订单ID
            orderNo: string; // 关联订单号
            merchantConfigId: number; // 关联商户配置ID
            paymentNo: string; // 支付订单号（唯一）
            channel?: string | null; // 支付渠道
            platform: string; // 支付平台（字典：system_pay_platform）
            paymentMethod: string; // 支付方式（字典：system_pay_method）
            amount?: number | null; // 实付金额（默认0）
            status?: string | null; // 支付状态（字典：system_pay_status，默认'0'）
            thirdTradeNo?: string | null; // 第三方交易号
            extra?: Record<string, any> | null; // 扩展字段（JSONB，默认{}）
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            configList?: MerchantConfigItem[];
            remark?: null | string;
        }

        type PaymentsList = Api.Common.PaginatedResponse<PaymentsListItem>

        type PaymentsSearchParams = Partial<
            Pick<PaymentsListItem, 'orderNo' | 'status' | 'paymentNo' | 'platform' | 'paymentMethod'> &
            Api.Common.CommonSearchParams
        >
    }
}