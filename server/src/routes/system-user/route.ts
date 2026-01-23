import type { IRouteModule } from "@/common/route";
import { CreateDto, ListDto, UpdateDto } from "./dto";
import { create, findList, findInfo, findOne, update, remove } from "./handle";

const SystemUserModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        { url: '/system/user', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:user:create' } },
        { url: '/system/user/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, isLog: true, permission: 'system:user:query' } },
        { url: '/system/user/info', method: 'get', summary: '查询当前用户', handle: findInfo, meta: { isAuth: true, isLog: true, permission: 'system:user:info' } },
        { url: '/system/user/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, isLog: true, permission: 'system:user:query' } },
        { url: '/system/user', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:user:update' } },
        { url: '/system/user/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:user:delete' } },
    ]
};

export default SystemUserModule;