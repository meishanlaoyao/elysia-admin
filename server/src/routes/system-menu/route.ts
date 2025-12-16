import type { IRouteModule } from "@/common/route";
import { findSimple } from "./handle";

const SystemMenuModule: IRouteModule = {
    tags: '系统菜单',
    routes: [
        { url: '/system/menu', method: 'post', summary: '创建', isAuth: true, handle: () => { }, },
        { url: '/system/menu/simple', method: 'get', summary: '查询简单菜单树', isAuth: true, handle: findSimple, },
        { url: '/system/menu/:id', method: 'get', summary: '查询详情', isAuth: true, handle: () => { }, },
        { url: '/system/menu', method: 'put', isAuth: true, summary: '更新', handle: () => { }, },
        { url: '/system/menu/:ids', method: 'delete', isAuth: true, summary: '删除', handle: () => { }, },
    ]
};

export default SystemMenuModule;