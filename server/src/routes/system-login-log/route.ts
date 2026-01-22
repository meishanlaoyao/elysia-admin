import type { IRouteModule } from "@/common/route";

const SystemLoginLogModule: IRouteModule = {
    tags: '登录日志',
    routes: [
        { url: '/system/login-log/list', method: 'get', summary: '查询列表', isAuth: true, handle: () => { }, meta: { permission: 'system:login-log:query' } },
        { url: '/system/login-log/:id', method: 'get', summary: '查询详情', isAuth: true, handle: () => { }, meta: { permission: 'system:login-log:query' } },
        { url: '/system/login-log/:ids', method: 'delete', isAuth: true, summary: '删除', handle: () => { }, meta: { permission: 'system:login-log:delete' } },
    ]
};

export default SystemLoginLogModule;