import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, update } from "./handle";
import { CreateDto, ListDto, UpdateDto } from "./dto";

const BusinessOrdersModule: IRouteModule = {
    tags: '订单模块',
    routes: [
        { url: '/business/orders', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, } },
        { url: '/business/orders/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'business:orders:query' } },
        { url: '/business/orders/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'business:orders:query' } },
        { url: '/business/orders', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:orders:update' } },
    ],
};

export default BusinessOrdersModule;