import { t } from 'elysia';
import config from '@/config';
import type { Elysia } from "elysia";
import type { IRouteModule, IRoute } from "@/core/route";
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
    const RouteTree = await loadRouteModules();
    const authRoutes: { tags: string[], route: IRoute }[] = [];
    const publicRoutes: { tags: string[], route: IRoute }[] = [];
    RouteTree.forEach(module => {
        module.routes.forEach(route => {
            if (route?.meta?.isAuth) {
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
    RouteList.push(...publicRoutes, ...authRoutes);
    RouteMap = routeToMap(RouteList);
    AuthRoutes = authRoutes;
    console.log(`✓ 接口已注册: 公共${publicRoutes.length}个 权限${authRoutes.length}个`);
};