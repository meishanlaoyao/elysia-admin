import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, update } from "./handle";
import { CreateDto, ListDto, UpdateDto } from "./dto";

const BusinessRefundModule: IRouteModule = {
    tags: '退款模块',
    routes: [
        { url: '/business/refund', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, ipRateLimit: '3:1' } },
        { url: '/business/refund/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'business:refund:query' } },
        { url: '/business/refund/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'business:refund:query' } },
        { url: '/business/refund', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:refund:update' } },
    ],
};

export default BusinessRefundModule;