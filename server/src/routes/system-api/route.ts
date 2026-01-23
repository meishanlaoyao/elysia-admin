import type { IRouteModule } from "@/common/route";
import { create, findList, findOne, remove, update } from './handle'
import { CreateDto, ListDto, UpdateDto } from "./dto";

const SystemApiModule: IRouteModule = {
    tags: '系统API',
    routes: [
        { url: '/system/api', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:api:create' } },
        { url: '/system/api/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, isLog: true, permission: 'system:api:query' } },
        { url: '/system/api/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, isLog: true, permission: 'system:api:query' } },
        { url: '/system/api', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:api:update' } },
        { url: '/system/api/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:api:delete' } },
    ]
};

export default SystemApiModule;