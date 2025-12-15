import { t } from 'elysia';
import type { Elysia } from "elysia";
import type { IRouteModule, IRoute } from "@/common/route";

import SystemUserModule from "./system-user/route";
import SystemDictModule from "./system-dict/route";
import AuthModule from "./auth/route";

const routeList: IRouteModule[] = [
    SystemUserModule,
    SystemDictModule,
    AuthModule,
];


/**
 * 注册所有路由
 * @param app Elysia 实例
 */
export function RegisterRoutes(app: Elysia) {
    const publicRoutes: { tags: string[], route: IRoute }[] = [];
    const authRoutes: { tags: string[], route: IRoute }[] = [];
    routeList.forEach(module => {
        module.routes.forEach(route => {
            if (route.isAuth) {
                authRoutes.push({ tags: [module.tags], route });
            } else {
                publicRoutes.push({ tags: [module.tags], route });
            };
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
};