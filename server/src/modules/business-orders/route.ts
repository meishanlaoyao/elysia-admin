import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, update, payOrder, payOrderReturn, payOrderNotify } from "./handle";
import { CreateDto, ListDto, UpdateDto, PayOrderDto } from "./dto";

const BusinessOrdersModule: IRouteModule = {
    tags: '订单模块',
    routes: [
        { url: '/business/orders', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, ipRateLimit: '3:1' } },
        { url: '/business/orders/pay', method: 'post', summary: '支付订单', dto: PayOrderDto, handle: payOrder, meta: { isAuth: true, ipRateLimit: '5:1' } },
        { url: '/business/orders/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'business:orders:query' } },
        { url: '/business/orders/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'business:orders:query' } },
        { url: '/business/orders', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:orders:update' } },
        { url: '/business/orders/return', method: 'get', summary: '支付同步回调', handle: payOrderReturn, },
        { url: '/business/orders/notify', method: 'post', summary: '支付异步回调', handle: payOrderNotify, },
    ],
};

export default BusinessOrdersModule;