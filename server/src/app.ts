import { Elysia } from "elysia";
import config from "@/config";
import { queues } from '@/queue';
import { cors } from '@elysiajs/cors';
import { logger } from '@/shared/logger';
import { RegisterRoutes } from '@/modules';
import { BaseResultData } from '@/core/result';
import { staticPlugin } from '@elysiajs/static';
import { BunAdapter } from 'elysia/adapter/bun';
import { createBullBoard } from '@bull-board/api';
import { ElysiaAdapter } from '@bull-board/elysia';
import { GlobalMiddleware, GlobalResponseMiddleware } from "@/middleware";

/**
 * 创建并配置 Elysia 应用实例
 */
export async function createApp() {
    const { prefix, maxRequestBodySize, timeout } = config.app;
    const app = new Elysia({
        prefix: prefix as any,
        normalize: true,
        adapter: BunAdapter,
        aot: true,
        nativeStaticResponse: true,
        serve: {
            maxRequestBodySize,
            idleTimeout: timeout,
        }
    });

    // 配置 CORS
    app.use(cors());

    // 配置静态文件服务
    app.use(await staticPlugin());

    // 开发环境：启用 OpenAPI 文档
    if (process.env.NODE_ENV !== 'production') await configureOpenAPI(app);

    // 配置 BullMQ UI
    await configureBullMQUI(app);

    // 注册全局中间件
    GlobalMiddleware(app as Elysia);
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
        logger.info('OpenAPI 文档已启用');
    } catch (error) {
        logger.error('OpenAPI 配置失败', { error });
    }
};

/**
 * 配置全局错误处理器
 */
function configureErrorHandler(app: Elysia) {
    app.onError(({ code, error, set }) => {
        console.log(code, error)
        // 验证错误
        if (code === 'VALIDATION') {
            const errorMessage = (error as any).message || '验证失败';
            logger.warn('请求验证失败' + errorMessage);
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
        // 可能是自定义错误
        else if (typeof (code as any) === 'number') return;
        return BaseResultData.fail(500, '服务器内部错误');
    });
};