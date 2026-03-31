import type { IRouteModule } from "@/core/route";
import { create, createConfig, update, updateConfig, remove, removeConfig, findList, findOneConfig } from './handle';
import { CreateDto, CreateConfigDto, UpdateDto, UpdateConfigDto, ListDto } from './dto';

const BusinessMerchantModule: IRouteModule = {
    tags: '商户模块',
    routes: [
        { url: '/business/merchant', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'business:merchant:create' } },
        { url: '/business/merchant/config', method: 'post', summary: '创建商户配置', dto: CreateConfigDto, handle: createConfig, meta: { isAuth: true, isLog: true, permission: 'business:merchant:create' } },
        { url: '/business/merchant/config/:id', method: 'get', summary: '查询商户配置', handle: findOneConfig, meta: { isAuth: true, permission: 'business:merchant:query' } },
        { url: '/business/merchant/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'business:merchant:query' } },
        { url: '/business/merchant', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'business:merchant:update' } },
        { url: '/business/merchant/config', method: 'put', summary: '更新商户配置', dto: UpdateConfigDto, handle: updateConfig, meta: { isAuth: true, isLog: true, permission: 'business:merchant:update' } },
        { url: '/business/merchant/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'business:merchant:delete' } },
        { url: '/business/merchant/config/:ids', method: 'delete', summary: '删除商户配置', handle: removeConfig, meta: { isAuth: true, isLog: true, permission: 'business:merchant:delete' } },
    ]
};

export default BusinessMerchantModule;