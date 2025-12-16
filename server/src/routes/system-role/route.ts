import type { IRouteModule } from "@/common/route";
import { findList } from "./handle";

const SystemRoleModule: IRouteModule = {
    tags: '系统角色',
    routes: [
        { url: '/system/role', method: 'post', summary: '创建', isAuth: true, handle: () => { }, },
        { url: '/system/role/all', method: 'get', summary: '查询所有', isAuth: true, handle: () => { }, },
        { url: '/system/role/list', method: 'get', summary: '查询列表', isAuth: true, handle: findList, },
        { url: '/system/role/:id', method: 'get', summary: '查询详情', isAuth: true, handle: () => { }, },
        { url: '/system/role', method: 'put', isAuth: true, summary: '更新', handle: () => { }, },
        { url: '/system/role/:ids', method: 'delete', isAuth: true, summary: '删除', handle: () => { }, },
    ]
};

export default SystemRoleModule;