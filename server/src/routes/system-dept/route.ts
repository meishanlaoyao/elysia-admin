import type { IRouteModule } from "@/common/route";
import { CreateDto, TreeDto, UpdateDto } from "./dto";
import { create, findTree, update, remove } from './handle';

const SystemDeptModule: IRouteModule = {
    tags: '系统部门',
    routes: [
        { url: '/system/dept', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, meta: { permission: 'system:dept:create' } },
        { url: '/system/dept/tree', method: 'get', summary: '查询部门树', isAuth: true, dto: TreeDto, handle: findTree, meta: { permission: 'system:dept:query' } },
        { url: '/system/dept', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, meta: { permission: 'system:dept:update' } },
        { url: '/system/dept/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, meta: { permission: 'system:dept:delete' } },
    ]
};

export default SystemDeptModule;