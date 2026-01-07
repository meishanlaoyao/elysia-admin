import type { IRouteModule } from "@/common/route";
import { findSimple, create, update, remove } from "./handle";
import { CreateDto, ListDto, UpdateDto } from './dto';



const SystemMenuModule: IRouteModule = {
    tags: '系统菜单',
    routes: [
        { url: '/system/menu', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, },
        { url: '/system/menu/simple', method: 'get', summary: '查询简单菜单树', isAuth: true, handle: findSimple, },
        { url: '/system/menu/:id', method: 'get', summary: '查询详情', isAuth: true, handle: () => { }, },
        { url: '/system/menu', method: 'put', isAuth: true, summary: '更新', dto: UpdateDto, handle: update, },
        { url: '/system/menu/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, },
    ]
};

export default SystemMenuModule;