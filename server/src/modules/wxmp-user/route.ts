import type { IRouteModule } from "@/core/route";

const WxmpUserModule: IRouteModule = {
    tags: '微信小程序用户',
    routes: [
        { url: '/wxmp/user/list', method: 'get', summary: '查询列表', handle: () => { }, meta: { isAuth: true, permission: 'wxmp:user:query' } },
        { url: '/wxmp/user/basic', method: 'get', summary: '查询个人信息', handle: () => { }, meta: { isAuth: true, } },
        { url: '/wxmp/user/update', method: 'put', summary: '更新个人信息', handle: () => { }, meta: { isAuth: true, } },
        { url: '/wxmp/user', method: 'put', summary: '更新', handle: () => { }, meta: { isAuth: true, isLog: true, permission: 'wxmp:user:update' } },
        { url: '/wxmp/user/:ids', method: 'delete', summary: '删除', handle: () => { }, meta: { isAuth: true, isLog: true, permission: 'wxmp:user:delete' } },
    ]
};

export default WxmpUserModule;