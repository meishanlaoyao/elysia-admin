import type { IRouteModule } from "@/core/route";
import { create, findList, generateSts, update, remove } from './handle';
import { CreateDto, UpdateDto, ListDto } from './dto';

const SystemStorageModule: IRouteModule = {
    tags: '存储配置',
    routes: [
        { url: '/system/storage', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:storage:create' } },
        { url: '/system/storage/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:storage:query' } },
        { url: '/system/storage/sts', method: 'get', summary: '生成STS', handle: generateSts, meta: { isAuth: true, } },
        { url: '/system/storage', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:storage:update' } },
        { url: '/system/storage/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:storage:delete' } },
    ]
};

export default SystemStorageModule;