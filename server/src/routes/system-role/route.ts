import type { IRouteModule } from "@/common/route";
import { create, findList, findOptions, findOne, update, remove, findOnePermission, updatePermission } from "./handle";
import { CreateDto, UpdateDto, ListDto, UpdatePermissionDto } from './dto';

const SystemRoleModule: IRouteModule = {
    tags: '系统角色',
    routes: [
        { url: '/system/role', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:role:create' } },
        { url: '/system/role/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:role:query' } },
        { url: '/system/role/options', method: 'get', summary: '下拉选项数据', handle: findOptions, meta: { isAuth: true, permission: 'system:role:query' } },
        { url: '/system/role/permission/:id', method: 'get', summary: '查询角色权限', handle: findOnePermission, meta: { isAuth: true, permission: 'system:role:query' } },
        { url: '/system/role/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'system:role:query' } },
        { url: '/system/role', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:role:update' } },
        { url: '/system/role/permission', method: 'put', summary: '更新角色权限', dto: UpdatePermissionDto, handle: updatePermission, meta: { isAuth: true, isLog: true, permission: 'system:role:update' } },
        { url: '/system/role/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:role:delete' } },
    ]
};

export default SystemRoleModule;