import type { IRouteModule } from "@/core/route";
import { findList, remove } from './handle';
import { ListDto } from './dto';

const SystemLoginLogModule: IRouteModule = {
    tags: '登录日志',
    routes: [
        { url: '/system/login-log/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'system:login-log:query' } },
        { url: '/system/login-log/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:login-log:delete' } },
    ]
};

export default SystemLoginLogModule;