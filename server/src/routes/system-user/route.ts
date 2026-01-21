import type { IRouteModule } from "@/common/route";
import { CreateDto, ListDto, UpdateDto } from "./dto";
import { create, findList, findInfo, findOne, update, remove } from "./handle";

const SystemUserModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        { url: '/system/user', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, meta: { permission: 'system:user:create' } },
        { url: '/system/user/list', method: 'get', summary: '查询列表', isAuth: true, dto: ListDto, handle: findList, meta: { permission: 'system:user:query' } },
        { url: '/system/user/info', method: 'get', summary: '查询当前用户', isAuth: true, handle: findInfo, meta: { permission: 'system:user:info' } },
        { url: '/system/user/:id', method: 'get', summary: '查询详情', isAuth: true, handle: findOne, meta: { permission: 'system:user:query' } },
        { url: '/system/user', method: 'put', summary: '更新', isAuth: true, dto: UpdateDto, handle: update, meta: { permission: 'system:user:update' } },
        { url: '/system/user/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, meta: { permission: 'system:user:delete' } },
    ]
};

export default SystemUserModule;