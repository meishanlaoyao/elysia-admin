import type { IRouteModule } from "@/core/route";
import { create, update, remove, findList } from './handle';
import { CreateDto, UpdateDto, ListDto } from './dto';

const BusinessMerchantModule: IRouteModule = {
    tags: '商户模块',
    routes: [
        { url: '/business/merchant', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'business:merchant:create' } },
        { url: '/business/merchant/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, isLog: true, permission: 'business:merchant:query' } },
        { url: '/business/merchant', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:merchant:update' } },
        { url: '/business/merchant/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'business:merchant:delete' } },
    ]
};

export default BusinessMerchantModule;