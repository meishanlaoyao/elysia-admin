import type { IRouteModule } from "@/common/route";
import { create, findList, findOne, update, remove } from "./handle";
import { CreateDto, UpdateDto, ListDto } from './dto';

const SystemRoleModule: IRouteModule = {
    tags: '系统角色',
    routes: [
        { url: '/system/role', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, },
        { url: '/system/role/list', method: 'get', summary: '查询列表', isAuth: true, dto: ListDto, handle: findList, },
        { url: '/system/role/:id', method: 'get', summary: '查询详情', isAuth: true, handle: findOne, },
        { url: '/system/role', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, },
        { url: '/system/role/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, },
    ]
};

export default SystemRoleModule;