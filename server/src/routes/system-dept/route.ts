import type { IRouteModule } from "@/common/route";
import { CreateDto, TreeDto, UpdateDto } from "./dto";
import { create, findTree, update, remove } from './handle';

const SystemDeptModule: IRouteModule = {
    tags: '系统部门',
    routes: [
        { url: '/system/dept', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, permission: 'system:dept:create' } },
        { url: '/system/dept/tree', method: 'get', summary: '查询部门树', dto: TreeDto, handle: findTree, meta: { isAuth: true, permission: 'system:dept:query' } },
        { url: '/system/dept', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, permission: 'system:dept:update' } },
        { url: '/system/dept/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, permission: 'system:dept:delete' } },
    ]
};

export default SystemDeptModule;