import { findList, remove } from './handle';
import type { IRouteModule } from "@/common/route";

const SystemOperLogModule: IRouteModule = {
    tags: '操作日志',
    routes: [
        { url: '/system/oper-log/list', method: 'get', summary: '查询列表', handle: findList, meta: { isAuth: true, permission: 'system:oper-log:query' } },
        { url: '/system/oper-log/:ids', method: 'delete', summary: '删除', handle: remove, meta: { isAuth: true, isLog: true, permission: 'system:oper-log:delete' } },
    ]
};

export default SystemOperLogModule;