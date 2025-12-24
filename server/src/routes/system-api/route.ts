import type { IRouteModule } from "@/common/route";
import { create, findList, findOne, remove, update } from './handle'
import { CreateDto, ListDto, UpdateDto } from "./dto";

const SystemApiModule: IRouteModule = {
    tags: '系统API',
    routes: [
        { url: '/system/api', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, },
        { url: '/system/api/list', method: 'get', summary: '查询列表', isAuth: true, dto: ListDto, handle: findList, },
        { url: '/system/api/:id', method: 'get', summary: '查询详情', isAuth: true, handle: findOne, },
        { url: '/system/api', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, },
        { url: '/system/api/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, },
    ]
};

export default SystemApiModule;