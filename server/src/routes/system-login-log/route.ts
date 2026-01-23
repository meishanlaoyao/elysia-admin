import type { IRouteModule } from "@/common/route";

const SystemLoginLogModule: IRouteModule = {
    tags: '登录日志',
    routes: [
        { url: '/system/login-log/list', method: 'get', summary: '查询列表', handle: () => { }, meta: { isAuth: true, permission: 'system:login-log:query' } },
        { url: '/system/login-log/:id', method: 'get', summary: '查询详情', handle: () => { }, meta: { isAuth: true, permission: 'system:login-log:query' } },
        { url: '/system/login-log/:ids', method: 'delete', summary: '删除', handle: () => { }, meta: { isAuth: true, permission: 'system:login-log:delete' } },
    ]
};

export default SystemLoginLogModule;