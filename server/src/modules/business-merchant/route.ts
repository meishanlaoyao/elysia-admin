import type { IRouteModule } from "@/core/route";
import { create, update, remove } from './handle';
import { CreateDto, UpdateDto } from './dto';

const BusinessMerchantModule: IRouteModule = {
    tags: '商户模块',
    routes: [
        { url: '/business/merchant', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'business:merchant:create' } },
        { url: '/business/merchant', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:merchant:update' } },
        { url: '/business/merchant/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, } },
    ]
};

export default BusinessMerchantModule;