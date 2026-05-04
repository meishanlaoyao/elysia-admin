import request from '@/utils/http'

/**
 * 查询支付记录列表
 */
export function fetchGetPaymentsList(params: Api.BusinessPayments.PaymentsSearchParams) {
    return request.get<Api.BusinessPayments.PaymentsList>({
        url: '/api/business/payments/list',
        params
    })
}

/**
 * 查询详情
 */
export function fetchGetPaymentsDetail(id: number) {
    return request.get<Api.BusinessPayments.PaymentsListItem>({
        url: `/api/business/payments/${id}`
    })
}