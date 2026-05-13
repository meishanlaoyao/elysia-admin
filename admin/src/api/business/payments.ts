import request from '@/utils/http'

/**
 * 发起支付
 */
export function fetchPayOrder(data: Api.BusinessPayments.PayOrderBody) {
    return request.post<Api.BusinessPayments.PayOrderResult>({
        url: '/api/business/payments',
        data,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}
