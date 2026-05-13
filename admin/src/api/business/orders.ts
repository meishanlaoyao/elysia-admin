import request from '@/utils/http'

/**
 * 创建订单（调试/业务入口）
 */
export function fetchCreateOrders() {
    return request.post<string>({
        url: '/api/business/orders',
        data: {},
        showSuccessMessage: true,
        showErrorMessage: true
    })
}

/**
 * 查询订单列表
 */
export function fetchGetOrdersList(params: Api.BusinessOrders.OrdersSearchParams) {
    return request.get<Api.BusinessOrders.OrdersList>({
        url: '/api/business/orders/list',
        params
    })
}

/**
 * 订单状态统计
 */
export function fetchGetOrdersStatusStats() {
    return request.get<Api.BusinessOrders.OrdersStatusStats>({
        url: '/api/business/orders/stats',
    })
}

/**
 * 查询详情
 */
export function fetchGetOrdersDetail(id: number) {
    return request.get<Api.BusinessOrders.OrdersListItem>({
        url: `/api/business/orders/${id}`
    })
}

/**
 * 更新
 */
export function fetchUpdateOrders(data: Partial<Api.BusinessOrders.OrdersListItem>) {
    return request.put({
        url: '/api/business/orders',
        data
    })
}