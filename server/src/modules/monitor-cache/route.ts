import type { IRouteModule } from "@/types/route";
import { findTypeList, findCacheList, findKey, updateKey, removeType, removeKey } from './handle';
import { CacheListDto, CacheKeyDto, UpdateCacheDto } from './dto';

const MonitorCacheModule: IRouteModule = {
    tags: '缓存列表',
    routes: [
        { url: '/monitor/cache/type', method: 'get', summary: '查询类型', handle: findTypeList, meta: { isAuth: true, permission: 'monitor:cache:query' } },
        { url: '/monitor/cache/list', method: 'get', summary: '查询列表', dto: CacheListDto, handle: findCacheList, meta: { isAuth: true, permission: 'monitor:cache:query' } },
        { url: '/monitor/cache/key', method: 'get', summary: '查询详情', dto: CacheKeyDto, handle: findKey, meta: { isAuth: true, permission: 'monitor:cache:query' } },
        { url: '/monitor/cache/update-key', method: 'put', summary: '更新指定缓存', dto: UpdateCacheDto, handle: updateKey, meta: { isAuth: true, isLog: true, permission: 'monitor:cache:update' } },
        { url: '/monitor/cache/clear-type', method: 'delete', summary: '清除指定类型', dto: CacheListDto, handle: removeType, meta: { isAuth: true, isLog: true, permission: 'monitor:cache:delete' } },
        { url: '/monitor/cache/clear-key', method: 'delete', summary: '清除指定缓存', dto: CacheKeyDto, handle: removeKey, meta: { isAuth: true, isLog: true, permission: 'monitor:cache:delete' } },
    ]
};

export default MonitorCacheModule;