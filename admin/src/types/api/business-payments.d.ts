declare namespace Api {
    namespace BusinessPayments {
        interface PayOrderBody {
            orderNo: string
            paymentMethod: 'alipay' | 'wechat' | 'paypal'
            platform: 'app' | 'h5' | 'mini' | 'pc'
        }

        interface PayOrderResult {
            paymentNo: string
            thirdTradeNo?: string
            payload: Record<string, unknown>
        }
    }
}
