import type { Elysia } from 'elysia';
import { logger } from '@/shared/logger';

/**
 * 配置 BullMQ UI
 */
export async function ConfigureBullMQUI(app: Elysia) {
    try {
        /**
         * 如果你已经找到了这里，那么恭喜你孩子，我将告诉你解决方案：
         * 去 node_modules\@bull-board\ui\dist\index.ejs
         * 修改 <base href="<%= basePath %>" />
         * 改成 <base href="你的app.prefix即可<%= basePath %>" />
         */
        const { queues } = await import('@/infrastructure/queue');
        const { createBullBoard } = await import('@bull-board/api');
        const { ElysiaAdapter } = await import('@bull-board/elysia');
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