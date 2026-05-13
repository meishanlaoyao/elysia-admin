import request from '@/utils/http'

/**
 * 创建退款申请
 */
export function fetchCreateRefund(data: Api.BusinessRefund.CreateRefundBody) {
    return request.post<string>({
        url: '/api/business/refund',
        data,
        showSuccessMessage: true,
        showErrorMessage: true
    })
}
