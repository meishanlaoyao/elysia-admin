import type { IRouteModule } from "@/types/route";
import { CreateDto, ListDto, UpdateDto } from './dto';
import { create, findList, update, remote } from './handle';

const MonitorJobModule: IRouteModule = {
    tags: '定时任务',
    routes: [
        { url: '/monitor/job', method: 'post', summary: '创建', dto: CreateDto, handle: create, meta: { isAuth: true, isLog: true, permission: 'monitor:job:create' } },
        { url: '/monitor/job/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'monitor:job:query' } },
        { url: '/monitor/job', method: 'put', summary: '更新', dto: UpdateDto, handle: update, meta: { isAuth: true, isLog: true, permission: 'monitor:job:update', } },
        { url: '/monitor/job/:ids', method: 'delete', summary: '删除', handle: remote, meta: { isAuth: true, isLog: true, permission: 'monitor:job:delete', } },
    ]
};

export default MonitorJobModule;