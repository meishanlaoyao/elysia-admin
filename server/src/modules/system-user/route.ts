import type { IRouteModule } from "@/types/route";
import { CreateDto, ListDto, UpdateDto, UpdateBasicDto, UpdatePasswordDto } from "./dto";
import { create, findList, findPerm, findOne, findBasic, update, updateBasic, updatePassword, remove } from "./handle";

const SystemUserModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        { url: '/system/user', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:user:create' } },
        { url: '/system/user/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:user:query' } },
        { url: '/system/user/perm', method: 'get', summary: '查询个人基本权限', handle: findPerm, meta: { isAuth: true, } },
        { url: '/system/user/basic', method: 'get', summary: '查询个人基本信息', handle: findBasic, meta: { isAuth: true, permission: 'system:user:query' } },
        { url: '/system/user/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'system:user:query' } },
        { url: '/system/user', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:user:update' } },
        { url: '/system/user/basic', method: 'put', summary: '更新个人基本信息', dto: UpdateBasicDto, handle: updateBasic, meta: { isAuth: true, isLog: true, permission: 'system:user:update' } },
        { url: '/system/user/password', method: 'put', summary: '更新个人密码', dto: UpdatePasswordDto, handle: updatePassword, meta: { isAuth: true, isLog: true, permission: 'system:user:update' } },
        { url: '/system/user/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:user:delete' } },
    ]
};

export default SystemUserModule;