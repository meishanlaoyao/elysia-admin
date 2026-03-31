import type { IRouteModule } from "@/core/route";
import { create, findList } from "./handle";
import { CreateDto } from "./dto";

const BusinessOrdersModule: IRouteModule = {
    tags: '订单模块',
    routes: [
        { url: '/business/orders', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, } },
        { url: '/business/orders/list', method: 'get', summary: '查询列表', handle: findList, meta: { isAuth: true, permission: 'business:orders:query' } },
    ],
};

export default BusinessOrdersModule;