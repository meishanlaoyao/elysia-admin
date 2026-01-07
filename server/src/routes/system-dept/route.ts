import type { IRouteModule } from "@/common/route";
import { CreateDto, TreeDto, UpdateDto } from "./dto";
import { create, findTree, update, remove } from './handle';

const SystemDeptModule: IRouteModule = {
    tags: '系统部门',
    routes: [
        { url: '/system/dept', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, },
        { url: '/system/dept/tree', method: 'get', summary: '查询部门树', isAuth: true, dto: TreeDto, handle: findTree, },
        { url: '/system/dept', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, },
        { url: '/system/dept/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, },
    ]
};

export default SystemDeptModule;