import type { IRouteModule } from "@/types/route";
import { create, findList, generatePresign, update, remove } from './handle';
import { CreateDto, UpdateDto, ListDto, PresignDto } from './dto';

const SystemStorageModule: IRouteModule = {
    tags: '存储配置',
    routes: [
        { url: '/system/storage', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:storage:create' } },
        { url: '/system/storage/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:storage:query' } },
        { url: '/system/storage/presign', method: 'get', summary: '生成预签名URL', dto: PresignDto, handle: generatePresign, meta: { isAuth: true } },
        { url: '/system/storage', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:storage:update' } },
        { url: '/system/storage/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:storage:delete' } },
    ]
};

export default SystemStorageModule;