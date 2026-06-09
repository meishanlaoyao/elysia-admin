import type { Elysia } from 'elysia';
import config from '@/config';
import { logger } from '@/shared/logger';

/**
 * 配置 OpenAPI 文档（开发环境）
 */
export async function ConfigureOpenAPI(app: Elysia) {
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