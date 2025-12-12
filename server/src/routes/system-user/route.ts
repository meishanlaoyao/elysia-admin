import type { IRouteModule } from "@/common/route";
import { create, findAll, findList, findOne, update, remove } from "./handle";

const routeModule: IRouteModule = {
    tags: '系统用户',
    routes: [
        {
            url: '/system/user',
            method: 'post',
            summary: '创建',
            handle: create,
        },
        {
            url: '/system/user/all',
            method: 'get',
            summary: '查询所有',
            handle: findAll,
        },
        {
            url: '/system/user/list',
            method: 'get',
            summary: '查询列表',
            handle: findList,
        },
        {
            url: '/system/user/:id',
            method: 'get',
            summary: '查询详情',
            handle: findOne,
        },
        {
            url: '/system/user',
            method: 'put',
            summary: '更新',
            handle: update,
        },
        {
            url: '/system/user/:ids',
            method: 'delete',
            summary: '删除',
            handle: remove,
        },
    ]
};

export default routeModule;