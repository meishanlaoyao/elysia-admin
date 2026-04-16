/**
 * SystemCron Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import { queueManager, buildRateLimit } from '../../core';
import { getProcessorPath } from '../../config/env';

const processorFile = getProcessorPath('system-cron');

queueManager.registerWorker({
    queueName: 'system-cron-queue',
    processor: processorFile,   // 传路径，BullMQ 自动 spawn 子进程
    options: {
        concurrency: 5, // 同时处理 5 个任务 (CPU密集型调小，IO密集型调大)
        removeOnComplete: { count: 0 }, // 处理成功后移除任务
        ...buildRateLimit({ max: 10, duration: 1000 }),
    },
});