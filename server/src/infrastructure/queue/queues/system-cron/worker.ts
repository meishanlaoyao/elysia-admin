/**
 * SystemCron Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import path from 'path';
import { queueManager, buildRateLimit } from '../../core';

// 指向编译后的 processor JS 文件
// 开发时：dist/processors/system-cron.js
// 生产时：同路径
const processorFile = path.resolve(
    process.cwd(),
    'dist/processors/system-cron.js'
);

queueManager.registerWorker({
    queueName: 'system-cron-queue',
    processor: processorFile,   // 传路径，BullMQ 自动 spawn 子进程
    options: {
        concurrency: 5, // 同时处理 5 个任务 (CPU密集型调小，IO密集型调大)
        removeOnComplete: { count: 0 }, // 处理成功后移除任务
        ...buildRateLimit({ max: 10, duration: 1000 }),
    },
});