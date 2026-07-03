import config from "@/config";
import { CreateApp } from '@/app';
import { logger } from '@/shared/logger';
import { InitSeedData } from 'script/seed.prod';
import { StopAllCronJobs } from '@/infrastructure/cron/cron-scheduler';
import { quitRedis } from '@/core/database/redis';

async function runSeedData() {
    if (process.env.NODE_ENV !== 'production') {
        const { InitSeedDevData } = await import('script/seed.dev');
        await InitSeedDevData();
    };
    await InitSeedData();
};

let shuttingDown = false;
type HttpListenHandle = { stop?: () => void | Promise<unknown> };
let httpServer: HttpListenHandle | undefined;

async function gracefulShutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`收到 ${signal} 信号，正在关闭应用...`);
    StopAllCronJobs();
    try {
        const stop = httpServer?.stop;
        if (stop) await Promise.resolve(stop.call(httpServer));
    } catch (e) {
        logger.warn('HTTP 服务停止时异常: ' + e);
    }
    await quitRedis();
    process.exit(0);
};

process.on('SIGINT', () => { void gracefulShutdown('SIGINT'); });
process.on('SIGTERM', () => { void gracefulShutdown('SIGTERM'); });

/** 应用启动入口 */
async function bootstrap() {
    try {
        const app = await CreateApp();
        await runSeedData();
        const { port, id } = config.app;
        const appPort = process.env.PORT || port;
        const appEnv = process.env.NODE_ENV || 'development';
        const isProduction = appEnv === 'production';
        httpServer = app.listen(appPort) as unknown as HttpListenHandle;
        let appVersion: string | undefined;
        if (!isProduction) {
            try {
                const pkg = await Bun.file(new URL('../package.json', import.meta.url)).json() as { version?: string };
                appVersion = typeof pkg.version === 'string' ? pkg.version : 'unknown';
            } catch {
                appVersion = 'unknown';
            }
        }
        await logger.logStartup({
            appId: id,
            port: appPort,
            prefix: config.app.prefix,
            env: appEnv,
            pid: process.pid,
            ...(appVersion !== undefined ? { appVersion } : {}),
            openApiEnabled: !isProduction,
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

bootstrap();