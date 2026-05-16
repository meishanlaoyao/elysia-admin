import type { IRouteModule } from '@/types/route';
import { logger } from '@/shared/logger';

/**
 * 加载所有路由模块
 * 开发环境：动态扫描
 * 生产环境：使用预生成的文件
 */
export async function LoadRouteModules(): Promise<IRouteModule[]> {
    if (process.env.NODE_ENV === 'production') {
        try {
            // @ts-expect-error 构建产物 route-registry.generated，开发环境可能不存在
            const { allRoutes } = (await import('./route-registry.generated')) as {
                allRoutes: IRouteModule[];
            };
            const validRoutes: IRouteModule[] = [];
            allRoutes.forEach((routeModule, index) => {
                if (!routeModule || !routeModule.tags || !Array.isArray(routeModule.routes)) {
                    logger.warn(`生产环境路由预生成项格式无效，已跳过: index=${index}`);
                    return;
                }
                validRoutes.push(routeModule);
                logger.info(`✓ 加载路由模块: ${routeModule.tags} (${routeModule.routes.length}个路由)`);
            });
            return validRoutes;
        } catch (error: unknown) {
            logger.error('生产环境路由加载失败:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    } else {
        const { readdirSync, statSync } = await import('node:fs');
        const { join } = await import('node:path');
        const modulesPath = join(process.cwd(), 'src', 'modules');
        const modules: IRouteModule[] = [];
        try {
            const entries = readdirSync(modulesPath);
            for (const entry of entries) {
                const fullPath = join(modulesPath, entry);
                if (entry === 'index.ts') continue;
                try {
                    const stat = statSync(fullPath);
                    if (!stat.isDirectory()) continue;
                } catch {
                    continue;
                }
                const routeFilePath = join(fullPath, 'route.ts');
                try {
                    const module = await import(routeFilePath);
                    const routeModule = module.default;
                    if (routeModule && routeModule.tags && Array.isArray(routeModule.routes)) {
                        modules.push(routeModule);
                        logger.info(`✓ 加载路由模块: ${routeModule.tags} (${routeModule.routes.length}个路由)`);
                    } else {
                        logger.warn(`路由模块格式无效（缺少 tags 或 routes），已跳过: ${entry}`);
                    }
                } catch (error: unknown) {
                    logger.warn(`路由模块加载失败，已跳过: ${entry}`, {
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            };
        } catch (error: unknown) {
            logger.error('扫描路由目录失败:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
        return modules;
    }
};