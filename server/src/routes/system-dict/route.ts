import type { IRouteModule } from "@/common/route";
import {
    CreateDataDto,
    CreateTypeDto,
    ListDataDto,
    ListTypeDto,
    UpdateDataDto,
    UpdateTypeDto
} from './dto';
import {
    createType,
    createData,
    findAllType,
    findAllData,
    findListType,
    findListData,
    findOneType,
    updateType,
    updateData,
    removeType,
    removeData,
} from './handle';

const SystemDictModule: IRouteModule = {
    tags: '系统字典',
    routes: [
        { url: '/system/dict/type', method: 'post', summary: '创建-类型', isAuth: true, dto: CreateTypeDto, handle: createType, meta: { permission: 'system:dict:type:create' } },
        { url: '/system/dict/type/all', method: 'get', summary: '查询所有-缓存类型', isAuth: true, handle: findAllType, meta: { permission: 'system:dict:type:query' } },
        { url: '/system/dict/type/list', method: 'get', summary: '查询列表-类型', isAuth: true, dto: ListTypeDto, handle: findListType, meta: { permission: 'system:dict:type:query' } },
        { url: '/system/dict/type/:id', method: 'get', summary: '查询详情-类型', isAuth: true, handle: findOneType, meta: { permission: 'system:dict:type:query' } },
        { url: '/system/dict/type', method: 'put', summary: '更新-类型', isAuth: true, dto: UpdateTypeDto, handle: updateType, meta: { permission: 'system:dict:type:update' } },
        { url: '/system/dict/type/:ids', method: 'delete', isAuth: true, summary: '删除-类型', handle: removeType, meta: { permission: 'system:dict:type:delete' } },
        { url: '/system/dict/data', method: 'post', summary: '创建-数据', isAuth: true, dto: CreateDataDto, handle: createData, meta: { permission: 'system:dict:data:create' } },
        { url: '/system/dict/data/all', method: 'get', summary: '查询所有-缓存数据', isAuth: false, handle: findAllData, },
        { url: '/system/dict/data/list', method: 'get', summary: '查询列表-数据', isAuth: true, dto: ListDataDto, handle: findListData, meta: { permission: 'system:dict:data:query' } },
        { url: '/system/dict/data/:id', method: 'get', summary: '查询详情-数据', isAuth: true, handle: () => { }, meta: { permission: 'system:dict:data:query' } },
        { url: '/system/dict/data', method: 'put', summary: '更新-数据', isAuth: true, dto: UpdateDataDto, handle: updateData, meta: { permission: 'system:dict:data:update' } },
        { url: '/system/dict/data/:ids', method: 'delete', isAuth: true, summary: '删除-数据', handle: removeData, meta: { permission: 'system:dict:data:delete' } },
    ]
};

export default SystemDictModule;