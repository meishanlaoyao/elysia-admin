/**
 * TradeOrder Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import { queueManager, RateLimitPresets } from '../../core';
import { getProcessorPath } from '../../config/env';

const processorFile = getProcessorPath('trade-order');

queueManager.registerWorker({
    queueName: 'trade-order-queue',
    processor: processorFile,
    options: {
        concurrency: 3,
        ...RateLimitPresets.medium,
    },
});