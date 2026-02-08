import type { IRouteModule } from "@/core/route";

const MonitorJobModule: IRouteModule = {
    tags: '定时任务',
    routes: [
        { url: '/monitor/job/list', method: 'get', summary: '查询列表', handle: () => { }, meta: { isAuth: true, permission: 'monitor:job:query' } },
    ]
};

export default MonitorJobModule;