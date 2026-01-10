import type { IRouteModule } from "@/common/route";
import { create, findList, findOne, update, remove, findOnePermission, updatePermission } from "./handle";
import { CreateDto, UpdateDto, ListDto, UpdatePermissionDto } from './dto';

const SystemRoleModule: IRouteModule = {
    tags: '系统角色',
    routes: [
        { url: '/system/role', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, meta: { permission: 'system:role:create' } },
        { url: '/system/role/list', method: 'get', summary: '查询列表', isAuth: true, dto: ListDto, handle: findList, meta: { permission: 'system:role:query' } },
        { url: '/system/role/permission/:id', method: 'get', summary: '查询角色权限', isAuth: true, handle: findOnePermission, meta: { permission: 'system:role:query' } },
        { url: '/system/role/:id', method: 'get', summary: '查询详情', isAuth: true, handle: findOne, meta: { permission: 'system:role:query' } },
        { url: '/system/role', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, meta: { permission: 'system:role:update' } },
        { url: '/system/role/permission', method: 'put', summary: '更新角色权限', isAuth: true, dto: UpdatePermissionDto, handle: updatePermission, meta: { permission: 'system:role:update' } },
        { url: '/system/role/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, meta: { permission: 'system:role:delete' } },
    ]
};

export default SystemRoleModule;