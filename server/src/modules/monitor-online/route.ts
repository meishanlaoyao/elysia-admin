import type { IRouteModule } from "@/core/route";
import { ListDto } from './dto';
import { findList, forceLogout } from './handle';

const MonitorOnlineModule: IRouteModule = {
    tags: '在线用户',
    routes: [
        { url: '/monitor/online/list', method: 'get', summary: '查询列表', dto: ListDto, handle: findList, meta: { isAuth: true, permission: 'monitor:online:query' } },
        { url: '/monitor/online/forceLogout/:ids', method: 'delete', summary: '强退', handle: forceLogout, meta: { isAuth: true, permission: 'monitor:online:forceLogout' } },
    ]
};

export default MonitorOnlineModule;