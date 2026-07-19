/**
 * Worker 进程入口
 * 独立打包运行，崩溃不影响主进程
 */
import { queueManager } from '../core';
import { appendFatalLog, flushLogs, logger } from '@/shared/logger';

// 加载所有业务 Worker
import '../queues/system-cron/worker';
import '../queues/flow-buffer/worker';
import '../queues/trade-order/worker';

logger.success('[Runtime] ✓ 所有 Worker 已启动');

// 优雅关闭
async function shutdown() {
    logger.info('[Runtime] 正在关闭...');
    await queueManager.closeAll();
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

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => fatalAndExit('uncaughtException', err));
process.on('unhandledRejection', (reason) => fatalAndExit('unhandledRejection', reason));