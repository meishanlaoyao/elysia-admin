import { createApp } from '@/app';
import { InitSeedData } from 'script/seed';
import { logger } from '@/shared/logger';
import config from "@/config";
import { GetCronLockDir, CleanAllLocks } from '@/shared/cron';

/**
 * 应用启动入口
 */
async function bootstrap() {
    try {
        CleanAllLocks();
        const app = await createApp();
        await InitSeedData();
        const { port, id } = config.app;
        app.listen(port);
        logger.logStartup({
            appId: id,
            port,
            prefix: config.app.prefix,
            env: process.env.NODE_ENV || 'development',
            pid: process.pid,
            openApiEnabled: process.env.NODE_ENV !== 'production',
            cronLockPath: GetCronLockDir(),
        });
    } catch (error) {
        logger.error('应用启动失败', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}

bootstrap();