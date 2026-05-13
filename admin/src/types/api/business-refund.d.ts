declare namespace Api {
    namespace BusinessRefund {
        interface CreateRefundBody {
            orderId: number
            paymentId: number
            amount: number
            reason?: string
        }
    }
}
