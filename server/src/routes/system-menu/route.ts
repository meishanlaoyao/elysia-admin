import type { IRouteModule } from "@/common/route";
import { findSimple, findTree, createMenu, createMenuBtn, updateMenu, removeMenu, updateMenuBtn, removeMenuBtn } from "./handle";
import { CreateMenuDto, CreateMenuBtnDto, FindAllMenuDto, UpdateMenuDto, UpdateMenuBtnDto } from './dto';

const SystemMenuModule: IRouteModule = {
    tags: '系统菜单',
    routes: [
        { url: '/system/menu', method: 'post', summary: '创建菜单', isAuth: true, dto: CreateMenuDto, handle: createMenu, meta: { permission: 'system:menu:create' } },
        { url: '/system/menu/simple', method: 'get', summary: '查询用户菜单树', isAuth: true, handle: findSimple, meta: { permission: 'system:user:info' } },
        { url: '/system/menu/tree', method: 'get', summary: '查询完整菜单树', isAuth: true, dto: FindAllMenuDto, handle: findTree, meta: { permission: 'system:menu:query' } },
        { url: '/system/menu/:id', method: 'get', summary: '查询菜单详情', isAuth: true, handle: () => { }, meta: { permission: 'system:menu:query' } },
        { url: '/system/menu', method: 'put', isAuth: true, summary: '更新菜单', dto: UpdateMenuDto, handle: updateMenu, meta: { permission: 'system:menu:update' } },
        { url: '/system/menu/:ids', method: 'delete', isAuth: true, summary: '删除菜单', handle: removeMenu, meta: { permission: 'system:menu:delete' } },
        { url: '/system/menu/btn', method: 'post', summary: '创建按钮', isAuth: true, dto: CreateMenuBtnDto, handle: createMenuBtn, meta: { permission: 'system:menu:create' } },
        { url: '/system/menu/btn', method: 'put', isAuth: true, summary: '更新按钮', dto: UpdateMenuBtnDto, handle: updateMenuBtn, meta: { permission: 'system:menu:update' } },
        { url: '/system/menu/btn/:ids', method: 'delete', isAuth: true, summary: '删除按钮', handle: removeMenuBtn, meta: { permission: 'system:menu:delete' } },
    ]
};

export default SystemMenuModule;