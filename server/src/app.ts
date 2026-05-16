import { Elysia } from "elysia";
import { resolve } from 'node:path';
import config from "@/config";
import { cors } from '@elysiajs/cors';
import { logger } from '@/shared/logger';
import { RegisterRoutes } from '@/modules';
import { BaseResultData } from '@/core/result';
import { staticPlugin } from '@elysiajs/static';
import { BunAdapter } from 'elysia/adapter/bun';
import { queues } from '@/infrastructure/queue';
import { createBullBoard } from '@bull-board/api';
import { ElysiaAdapter } from '@bull-board/elysia';
import { GlobalMiddleware, GlobalResponseMiddleware } from "@/middleware";

/**
 * 创建并配置 Elysia 应用实例
 */
export async function CreateApp() {
    const appEnv = process.env.NODE_ENV || 'development';
    const { prefix, maxRequestBodySize, timeout } = config.app;
    const app = new Elysia({
        prefix: prefix as any,
        aot: true,
        normalize: true,
        precompile: true,
        adapter: BunAdapter,
        nativeStaticResponse: appEnv === 'production',
        serve: {
            maxRequestBodySize,
            idleTimeout: timeout,
        }
    });

    const corsOrigin = appEnv === 'production'
        ? (config.app.corsOrigin ?? false)
        : (config.app.corsOrigin ?? true);
    app.use(cors({
        origin: corsOrigin as any,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['authorization', 'content-type', 'accept'],
    }));

    // 配置静态文件服务
    app.use(await staticPlugin({ assets: resolve(import.meta.dirname, '../public') }));

    // 开发环境：启用 OpenAPI 文档
    if (appEnv === 'development') await configureOpenAPI(app);

    // 配置 BullMQ UI (存在问题，正常接口会被拦住)
    // await configureBullMQUI(app);

    // 注册全局中间件
    GlobalMiddleware(app);
    GlobalResponseMiddleware(app);

    // 配置全局错误处理
    configureErrorHandler(app);

    // 注册业务路由
    const routeStats = await RegisterRoutes(app);
    logger.info(`✓ 路由注册完成: 公共接口 ${routeStats.publicCount} 个, 权限接口 ${routeStats.authCount} 个`);

    return app;
};

/**
 * 配置 BullMQ UI
 */
async function configureBullMQUI(app: Elysia) {
    try {
        /**
         * 如果你已经找到了这里，那么恭喜你孩子，我将告诉你解决方案：
         * 去 node_modules\@bull-board\ui\dist\index.ejs 
         * 修改 <base href="<%= basePath %>" />
         * 改成 <base href="你的app.prefix即可<%= basePath %>" />
         */
        const serverAdapter = new ElysiaAdapter('/bullmq');
        createBullBoard({
            queues,
            serverAdapter,
            options: {
                uiBasePath: 'node_modules/@bull-board/ui',
            },
        });
        const bullboardPlugin = await serverAdapter.registerPlugin();
        app.use(bullboardPlugin);
        logger.info('BullMQ 已启用');
    } catch (error) {
        logger.error('BullMQ 配置失败', { error });
    }
};

/**
 * 配置 OpenAPI 文档
 */
async function configureOpenAPI(app: Elysia) {
    try {
        const { openapi } = await import('@elysiajs/openapi');
        app.use(openapi({
            documentation: {
                info: {
                    title: `${config.app.id} API`,
                    version: '1.0.0',
                    description: `${config.app.id} API 文档`,
                },
            },
        }));
        logger.info('OpenAPI 已启用');
    } catch (error) {
        logger.error('OpenAPI 配置失败', { error });
    }
};

/**
 * 配置全局错误处理器
 */
function configureErrorHandler(app: Elysia) {
    app.onError(({ code, error, set }) => {
        // 验证错误
        if (code === 'VALIDATION') {
            const errorMessage = (error as any).message || '验证失败';
            logger.warn('请求验证失败：' + errorMessage);
            if (errorMessage === '请先登陆后访问') {
                set.status = 401;
                return BaseResultData.fail(401, errorMessage);
            };
            return BaseResultData.fail(400, errorMessage);
        }
        // 资源不存在
        else if (code === 'NOT_FOUND' || code == 404) {
            return BaseResultData.fail(404);
        }
        // 守卫等已设置 set.status 并抛出带数字 code 的结果时，交由 Elysia 走默认响应，避免二次包装成 BaseResult
        else if (typeof (code as unknown) === 'number') {
            logger.debug('onError: numeric code, pass through', { code: String(code) });
            return;
        };
        return BaseResultData.fail(500, '服务器内部错误');
    });
};