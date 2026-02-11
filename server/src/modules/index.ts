import { t } from 'elysia';
import config from '@/config';
import type { Elysia } from "elysia";
import type { IRoute } from "@/core/route";
import { LoadRouteModules } from '@/core/route-registry';

export const RouteList: { tags: string[], route: IRoute }[] = [];
export let RouteMap: Map<string, number> = new Map();
export let AuthRoutes: { tags: string[], route: IRoute }[] = [];

/**
 * 把路由转为Map
 * @param routes 路由数组
 * @returns Map<string, number> 路由键-索引映射
 */
function routeToMap(routes: { tags: string[], route: IRoute }[]) {
    const prefix = config.app.prefix;
    return new Map(routes.map(({ route }, index) => [`${route.method.toUpperCase()}:${prefix}${route.url}`, index]));
};

/**
 * 注册所有路由
 * @param app Elysia 实例
 */
export async function RegisterRoutes(app: Elysia) {
    const RouteTree = await LoadRouteModules();
    const authRoutes: { tags: string[], route: IRoute }[] = [];
    const publicRoutes: { tags: string[], route: IRoute }[] = [];
    RouteTree.forEach(module => {
        module.routes.forEach(route => {
            if (route?.meta?.isAuth) {
                authRoutes.push({ tags: [module.tags], route });
            } else {
                publicRoutes.push({ tags: [module.tags], route });
            }
        });
    });
    publicRoutes.forEach(({ tags, route }) => {
        (app as any)[route.method](route.url, route.handle, {
            detail: { tags, summary: route.summary },
            ...route.dto
        });
    });
    app.guard({
        headers: t.Object({
            authorization: t.String({ description: 'Bearer Token令牌', minLength: 1, error: '请先登陆后访问' }),
        }),
    });
    authRoutes.forEach(({ tags, route }) => {
        (app as any)[route.method](route.url, route.handle, {
            detail: { tags, summary: route.summary },
            ...route.dto
        });
    });
    RouteList.push(...publicRoutes, ...authRoutes);
    RouteMap = routeToMap(RouteList);
    AuthRoutes = authRoutes;
    return {
        moduleCount: RouteTree.length,
        publicCount: publicRoutes.length,
        authCount: authRoutes.length
    };
};