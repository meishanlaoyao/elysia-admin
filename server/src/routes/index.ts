import type { Elysia } from "elysia";
import type { IRouteModule } from "@/common/route";

import SystemUserModule from "./system-user/route";
const routeList: IRouteModule[] = [
    SystemUserModule,
];


/**
 * 注册所有路由
 * @param app Elysia 实例
 */
export function RegisterRoutes(app: Elysia) {
    routeList.forEach(module => {
        module.routes.forEach(route => {
            (app as any)[route.method](route.url, route.handle, {
                detail: {
                    tags: [module.tags],
                    summary: route.summary
                },
                ...route.dto
            });
        });
    });
};