declare namespace Api {
    namespace BusinessOrders {

        interface PaymentRecord {
            id: number;
            orderId: number;
            orderNo: string;
            paymentNo: string;
            paymentMethod: string;
            platform: string;
            amount: number;
            status: string;
            thirdTradeNo?: string;
            createTime?: Date;
            updateTime?: Date;
        }

        interface RefundRecord {
            id: number;
            orderId: number;
            paymentId: number;
            refundNo: string;
            amount: number;
            status: string;
            thirdRefundNo?: string;
            extra?: {
                reason?: string;
                orderNo?: string;
                paymentNo?: string;
                applyTime?: Date;
                processTime?: Date;
            };
            createTime?: Date;
            updateTime?: Date;
            remark?: string;
        }

        interface OrdersListItem {
            id: number;
            orderNo: string;
            status: string;
            userId: string;
            merchantId: number;
            title: string;
            description: string;
            amount: number;
            currency: string;
            expireTime?: Date;
            timeout: number;
            extra?: {
                products?: {
                    productId?: number;
                    productName?: string;
                    productPrice?: number;
                    productNum?: number;
                    productTotal?: number;
                    specs?: string;
                    image?: string;
                }[];
                user?: {
                    userId?: string;
                    nickname?: string;
                    phone?: string;
                    address?: string;
                    postalCode?: string;
                    avatar?: string;
                };
                marketing?: {
                    couponId?: number | null;
                    discountAmount?: number;
                    couponName?: string;
                };
            };
            createTime?: Date;
            createBy?: string | null;
            updateTime?: null | Date;
            updateBy?: null | string;
            delFlag?: boolean;
            remark?: null | string;
            // 列表摘要（来自关联表批量查询）
            paymentSummary?: PaymentRecord | null;
            refundSummary?: RefundRecord | null;
            // 详情完整记录
            payments?: PaymentRecord[];
            refunds?: RefundRecord[];
        }

        type OrdersList = Api.Common.PaginatedResponse<OrdersListItem>

        type OrdersSearchParams = Partial<
            Pick<OrdersListItem, 'orderNo' | 'status'> &
            Api.Common.CommonSearchParams & {
                pageNum?: number
                pageSize?: number
                orderByColumn?: string
                sortRule?: string
                startTime?: string
                endTime?: string
            }
        >

        type OrdersStatusStats = Record<string, number>
    }
}
