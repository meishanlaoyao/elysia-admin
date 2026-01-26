import { t } from 'elysia';
import type { Elysia } from "elysia";
import type { IRouteModule, IRoute } from "@/common/route";
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 自动扫描并加载所有路由模块
 */
async function loadRouteModules(): Promise<IRouteModule[]> {
    const routesDir = join(__dirname);
    const modules: IRouteModule[] = [];
    try {
        const entries = readdirSync(routesDir);
        for (const entry of entries) {
            const fullPath = join(routesDir, entry);
            if (entry === 'index.ts') continue;
            if (!statSync(fullPath).isDirectory()) continue;
            const routeFilePath = join(fullPath, 'route.ts');
            try {
                const module = await import(routeFilePath);
                const routeModule = module.default;
                if (routeModule && routeModule.tags && Array.isArray(routeModule.routes)) {
                    modules.push(routeModule);
                    console.log(`✓ 加载路由模块: ${routeModule.tags} (${routeModule.routes.length}个路由)`);
                }
            } catch (error) {
                console.warn(`⚠ 跳过目录 ${entry}: 未找到有效的 route.ts`);
            }
        }
    } catch (error) {
        console.error('扫描路由目录失败:', error);
    }
    return modules;
};

export let RouteTree: IRouteModule[] = [];
export const RouteList: { tags: string[], route: IRoute }[] = [];
export const PublicRoutes: { tags: string[], route: IRoute }[] = [];
export const AuthRoutes: { tags: string[], route: IRoute }[] = [];

/**
 * 注册所有路由
 * @param app Elysia 实例
 */
export async function RegisterRoutes(app: Elysia) {
    // 自动加载所有路由模块
    RouteTree = await loadRouteModules();

    RouteTree.forEach(module => {
        module.routes.forEach(route => {
            if (route?.meta?.isAuth) {
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
    console.log(`✓ 接口已注册: 公共${PublicRoutes.length}个 权限${AuthRoutes.length}个`);
};