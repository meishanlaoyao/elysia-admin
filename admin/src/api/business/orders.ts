import request from '@/utils/http'

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