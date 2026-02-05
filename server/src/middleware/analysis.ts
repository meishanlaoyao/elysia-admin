import { Context } from 'elysia';
import { RouteMap, RouteList } from '@/modules';
import { BaseResultData } from '@/core/result';

/**
 * 解析路由信息
 */
export async function AnalysisRoute(ctx: Context) {
    const routeKey = `${ctx.request.method}:${ctx.route}`;
    const routeIndex = RouteMap.get(routeKey);
    if (routeIndex === undefined || routeIndex === null) return BaseResultData.fail(404);
    const route = RouteList[routeIndex];
    const routeInfo = {
        tags: route.tags[0],
        summary: route.route.summary,
        meta: route.route.meta
    };
    (ctx as any).routeInfo = routeInfo;
};