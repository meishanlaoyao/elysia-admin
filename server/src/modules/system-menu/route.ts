import type { IRouteModule } from "@/types/route";
import { findSimple, findTree, createMenu, createMenuBtn, updateMenu, removeMenu, updateMenuBtn, removeMenuBtn } from "./handle";
import { CreateMenuDto, CreateMenuBtnDto, FindAllMenuDto, UpdateMenuDto, UpdateMenuBtnDto } from './dto';

const SystemMenuModule: IRouteModule = {
    tags: '系统菜单',
    routes: [
        { url: '/system/menu', method: 'post', summary: '创建菜单', dto: CreateMenuDto, handle: createMenu, meta: { isAuth: true, isLog: true, permission: 'system:menu:create' } },
        { url: '/system/menu/simple', method: 'get', summary: '查询用户菜单树', handle: findSimple, meta: { isAuth: true, } },
        { url: '/system/menu/tree', method: 'get', summary: '查询完整菜单树', dto: FindAllMenuDto, handle: findTree, meta: { isAuth: true, permission: 'system:menu:query' } },
        { url: '/system/menu/:id', method: 'get', summary: '查询菜单详情', handle: () => { }, meta: { isAuth: true, permission: 'system:menu:query' } },
        { url: '/system/menu', method: 'put', summary: '更新菜单', dto: UpdateMenuDto, handle: updateMenu, meta: { isAuth: true, isLog: true, permission: 'system:menu:update' } },
        { url: '/system/menu/:ids', method: 'delete', summary: '删除菜单', handle: removeMenu, meta: { isAuth: true, isLog: true, permission: 'system:menu:delete' } },
        { url: '/system/menu/btn', method: 'post', summary: '创建按钮', dto: CreateMenuBtnDto, handle: createMenuBtn, meta: { isAuth: true, isLog: true, permission: 'system:menu:create' } },
        { url: '/system/menu/btn', method: 'put', summary: '更新按钮', dto: UpdateMenuBtnDto, handle: updateMenuBtn, meta: { isAuth: true, isLog: true, permission: 'system:menu:update' } },
        { url: '/system/menu/btn/:ids', method: 'delete', summary: '删除按钮', handle: removeMenuBtn, meta: { isAuth: true, isLog: true, permission: 'system:menu:delete' } },
    ]
};

export default SystemMenuModule;