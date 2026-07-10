import { Elysia } from "elysia";
import { resolve } from 'node:path';
import config from "@/config";
import { cors } from '@elysiajs/cors';
import { logger } from '@/shared/logger';
import { RegisterRoutes } from '@/modules';
import { staticPlugin } from '@elysiajs/static';
import { BunAdapter } from 'elysia/adapter/bun';
import { GlobalMiddleware, GlobalResponseMiddleware } from "@/middleware";
import { ConfigureErrorHandler } from '@/middleware/error-handler';
import { ConfigureOpenAPI } from '@/infrastructure/openapi';

/**
 * 创建并配置 Elysia 应用实例
 */
export async function CreateApp() {
    const appEnv = process.env.NODE_ENV || 'development';
    const isProduction = appEnv === 'production';
    const { prefix, maxRequestBodySize, timeout, staticDir, staticPrefix, corsOrigin, corsMethods, corsAllowedHeaders } = config.app;
    const app = new Elysia({
        prefix: prefix as any,
        aot: true,
        normalize: true,
        precompile: true,
        adapter: BunAdapter,
        nativeStaticResponse: isProduction,
        serve: {
            maxRequestBodySize,
            idleTimeout: timeout,
            reusePort: false,
        }
    });
    app.use(cors({
        origin: corsOrigin,
        methods: corsMethods,
        allowedHeaders: corsAllowedHeaders,
    }));
    app.use(await staticPlugin({
        assets: resolve(import.meta.dirname, isProduction ? staticDir : `../${staticDir}`),
        prefix: staticPrefix,    
    }));
    if (!isProduction) await ConfigureOpenAPI(app);
    GlobalMiddleware(app);
    GlobalResponseMiddleware(app);
    ConfigureErrorHandler(app);
    const routeStats = await RegisterRoutes(app);
    logger.info(`✓ 路由注册完成: 公共接口 ${routeStats.publicCount} 个, 权限接口 ${routeStats.authCount} 个`);
    return app;
};