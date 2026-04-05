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
            // @ts-expect-error - 此文件在构建时生成
            const { allRoutes } = await import('./route-registry.generated') as { allRoutes: any[] };
            const validRoutes: IRouteModule[] = [];
            allRoutes.forEach((routeModule) => {
                if (!routeModule || !routeModule.tags || !Array.isArray(routeModule.routes)) return;
                validRoutes.push(routeModule);
                logger.info(`✓ 加载路由模块: ${routeModule.tags} (${routeModule.routes.length}个路由)`);
            });
            return validRoutes;
        } catch (error: any) {
            logger.error('生产环境路由加载失败:', error);
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
                    };
                } catch (error) {
                    // 如果文件不存在或导入失败，跳过
                    continue;
                }
            }
        } catch (error: any) {
            logger.error('扫描路由目录失败:', error);
            throw error;
        }
        return modules;
    };
};