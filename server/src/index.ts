import config from "@/config";
import { CreateApp } from '@/app';
import { EnsurePg } from '@/core/database/pg';
import { InitSeedData } from 'script/seed.prod';
import { ConnectRedis, quitRedis } from '@/core/database/redis';
import { InitAppQueues, queueManager } from '@/infrastructure/queue';
import { appendFatalLog, flushLogs, logger } from '@/shared/logger';
import { StopAllCronJobs } from '@/infrastructure/cron/cron-scheduler';
import { ApplyDnsResultOrder, ProbeOutboundDualStack } from '@/shared/dual-stack-probe';

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
    try {
        await queueManager.closeAll();
    } catch (e) {
        logger.warn('队列关闭时异常: ' + e);
    }
    await quitRedis();
    flushLogs();
    process.exit(0);
};

function fatalAndExit(label: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    appendFatalLog(`${label}: ${message}${stack ? `\n${stack}` : ''}`);
    logger.error(label, { error: message, stack });
    flushLogs();
    process.exit(1);
};

process.on('SIGINT', () => { void gracefulShutdown('SIGINT'); });
process.on('SIGTERM', () => { void gracefulShutdown('SIGTERM'); });
process.on('uncaughtException', (err) => fatalAndExit('uncaughtException', err));
process.on('unhandledRejection', (reason) => fatalAndExit('unhandledRejection', reason));

/**
 * 生产环境公网双栈探测；开发跳过。SKIP_NETWORK_PROBE=1 可跳过。
 */
async function runNetworkProbeIfNeeded(appEnv: string): Promise<void> {
    if (appEnv !== 'production') return;
    if (process.env.SKIP_NETWORK_PROBE === '1') {
        logger.warn('已跳过网络双栈探测（SKIP_NETWORK_PROBE=1）');
        ApplyDnsResultOrder('ipv4_only');
        return;
    };
    const result = await ProbeOutboundDualStack();
    if (!result.ok) {
        throw new Error(result.message);
    };
    ApplyDnsResultOrder(result.mode);
    logger.info(result.message);
};

/** 应用启动入口：探测 → Redis/PG → 队列 → CreateApp/seed → listen */
async function bootstrap() {
    try {
        const appEnv = process.env.NODE_ENV || 'development';
        const isProduction = appEnv === 'production';
        await runNetworkProbeIfNeeded(appEnv);
        await Promise.all([EnsurePg(), ConnectRedis()]);
        await InitAppQueues();
        const app = await CreateApp();
        await runSeedData();
        const { port, id } = config.app;
        const appPort = process.env.PORT || port;
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
        fatalAndExit('应用启动失败', error);
    }
};

bootstrap();
