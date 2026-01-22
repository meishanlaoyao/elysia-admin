import { t } from 'elysia';
import type { Elysia } from "elysia";
import type { IRouteModule, IRoute } from "@/common/route";

import AuthModule from "./auth/route";
import SystemUserModule from "./system-user/route";
import SystemDictModule from "./system-dict/route";
import SystemMenuModule from "./system-menu/route";
import SystemRoleModule from "./system-role/route";
import SystemDeptModule from "./system-dept/route";
import SystemApiModule from "./system-api/route";
import SystemLoginLogModule from "./system-login-log/route";

export const RouteTree: IRouteModule[] = [
    AuthModule,
    SystemUserModule,
    SystemDictModule,
    SystemMenuModule,
    SystemRoleModule,
    SystemDeptModule,
    SystemApiModule,
    SystemLoginLogModule,
];
export const RouteList: { tags: string[], route: IRoute }[] = [];


/**
 * 注册所有路由
 * @param app Elysia 实例
 */
export function RegisterRoutes(app: Elysia) {
    const PublicRoutes: { tags: string[], route: IRoute }[] = [];
    const AuthRoutes: { tags: string[], route: IRoute }[] = [];
    RouteTree.forEach(module => {
        module.routes.forEach(route => {
            if (route.isAuth) {
                AuthRoutes.push({ tags: [module.tags], route });
            } else {
                PublicRoutes.push({ tags: [module.tags], route });
            };
        });
    });
    PublicRoutes.forEach(({ tags, route }) => {
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
    AuthRoutes.forEach(({ tags, route }) => {
        (app as any)[route.method](route.url, route.handle, {
            detail: { tags, summary: route.summary },
            ...route.dto
        });
    });
    RouteList.push(...PublicRoutes, ...AuthRoutes);
    console.log(`接口已注册: 公共${PublicRoutes.length}个 权限${AuthRoutes.length}个`);
};