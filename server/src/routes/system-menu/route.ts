import type { IRouteModule } from "@/common/route";

const SystemMenuModule: IRouteModule = {
    tags: '系统菜单',
    routes: [
        { url: '/system/menu', method: 'post', summary: '创建', isAuth: true, handle: () => { }, },
        { url: '/system/menu/tree', method: 'get', summary: '查询菜单树', isAuth: true, handle: () => { }, },
        { url: '/system/menu/:id', method: 'get', summary: '查询详情', isAuth: true, handle: () => { }, },
        { url: '/system/menu', method: 'put', isAuth: true, summary: '更新', handle: () => { }, },
        { url: '/system/menu/:ids', method: 'delete', isAuth: true, summary: '删除', handle: () => { }, },
    ]
};

export default SystemMenuModule;