import { createApp } from '@/app';
import { InitSeedData } from 'script/seed';
import { logger } from '@/shared/logger';
import { StopAllCronJobs } from '@/shared/cron';
import config from "@/config";

/**
 * 应用启动入口
 */
async function bootstrap() {
    try {
        const app = await createApp();
        await InitSeedData();
        const { port, id } = config.app;
        const appPort = process.env.PORT || port;
        const appEnv = process.env.NODE_ENV || 'development';
        app.listen(appPort);
        logger.logStartup({
            appId: id,
            port: appPort,
            prefix: config.app.prefix,
            env: appEnv,
            pid: process.pid,
            openApiEnabled: appEnv !== 'production',
            bunVersion: process.versions.bun || 'N/A',
        });
    } catch (error) {
        logger.error('应用启动失败', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
};

// 优雅关闭
process.on('SIGINT', () => {
    logger.info('收到 SIGINT 信号，正在关闭应用...');
    StopAllCronJobs();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('收到 SIGTERM 信号，正在关闭应用...');
    StopAllCronJobs();
    process.exit(0);
});

bootstrap();