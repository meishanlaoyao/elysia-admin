import type { IRouteModule } from "@/types/route";
import { ListDto, PayOrderDto } from "./dto";
import { payOrder, findList, findOne, payOrderReturn, payOrderNotify } from "./handle";

const BusinessPaymentsModule: IRouteModule = {
    tags: '支付模块',
    routes: [
        { url: '/business/payments', method: 'post', summary: '支付订单', dto: PayOrderDto, handle: payOrder, meta: { isAuth: true, ipRateLimit: '5:1' } },
        { url: '/business/payments/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'business:payments:query' } },
        { url: '/business/payments/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'business:payments:query' } },
        { url: '/business/payments/return', method: 'get', summary: '支付同步回调', handle: payOrderReturn, },
        { url: '/business/payments/notify', method: 'post', summary: '支付异步回调', handle: payOrderNotify, },
    ],
};

export default BusinessPaymentsModule;