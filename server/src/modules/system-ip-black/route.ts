import type { IRouteModule } from "@/types/route";
import { create, findAll, update, remove } from "./handle";
import { CreateDto, UpdateDto, FindAllDto } from './dto';

const SystemIpBlackModule: IRouteModule = {
    tags: '黑名单IP',
    routes: [
        { url: '/system/ip-black', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:ip-black:create' } },
        { url: '/system/ip-black/all', method: 'get', summary: '查询全部', dto: FindAllDto, handle: findAll, meta: { isAuth: true, permission: 'system:ip-black:query' } },
        { url: '/system/ip-black', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:ip-black:update' } },
        { url: '/system/ip-black/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:ip-black:delete' } },
    ]
};

export default SystemIpBlackModule;