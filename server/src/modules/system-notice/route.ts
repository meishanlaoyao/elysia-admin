import type { IRouteModule } from "@/types/route";
import { create, findList, findOne, remove, update } from './handle';
import { CreateDto, ListDto, UpdateDto } from "./dto";

const SystemNoticeModule: IRouteModule = {
    tags: '通知公告',
    routes: [
        { url: '/system/notice', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'system:notice:create' } },
        { url: '/system/notice/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:notice:query' } },
        { url: '/system/notice/:id', method: 'get', summary: '查询详情', handle: findOne, meta: { isAuth: true, permission: 'system:notice:query' } },
        { url: '/system/notice', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'system:notice:update' } },
        { url: '/system/notice/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:notice:delete' } },
    ],
};

export default SystemNoticeModule;