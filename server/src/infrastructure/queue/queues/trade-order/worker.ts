/**
 * TradeOrder Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import path from 'path';
import { queueManager, RateLimitPresets } from '../../core';

const processorFile = path.resolve(
    process.cwd(),
    'dist/processors/trade-order.js'
);

queueManager.registerWorker({
    queueName: 'trade-order-queue',
    processor: processorFile,
    options: {
        concurrency: 3,
        ...RateLimitPresets.medium,
    },
});
