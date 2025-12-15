import type { IRouteModule } from "@/common/route";
import { CreateDto, ListDto, UpdateDto } from "./dto";
import { create, findAll, findList, findInfo, findOne, update, remove } from "./handle";

const SystemUserModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        { url: '/system/user', method: 'post', summary: '创建', isAuth: true, dto: CreateDto, handle: create, },
        { url: '/system/user/all', method: 'get', summary: '查询所有', isAuth: true, handle: findAll, },
        { url: '/system/user/list', method: 'get', summary: '查询列表', isAuth: true, dto: ListDto, handle: findList, },
        { url: '/system/user/info', method: 'get', summary: '查询当前用户', isAuth: true, handle: findInfo, },
        { url: '/system/user/:id', method: 'get', summary: '查询详情', isAuth: true, handle: findOne, },
        { url: '/system/user', method: 'put', summary: '更新', isAuth: true, dto: UpdateDto, handle: update, },
        { url: '/system/user/:ids', method: 'delete', isAuth: true, summary: '删除', handle: remove, },
    ]
};

export default SystemUserModule;