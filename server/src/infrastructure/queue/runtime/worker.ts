/**
 * Worker 进程入口
 * 独立打包运行，崩溃不影响主进程
 */
import { queueManager } from '../core';
import { logger } from '@/shared/logger';

// 加载所有业务 Worker
import '../queues/system-cron/worker';
import '../queues/flow-buffer/worker';
import '../queues/trade-order/worker';

logger.success('[Runtime] ✓ 所有 Worker 已启动');

// 优雅关闭
async function shutdown() {
    logger.info('[Runtime] 正在关闭...');
    await queueManager.closeAll();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);