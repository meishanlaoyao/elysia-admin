/**
 * FlowBuffer Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import path from 'path';
import { queueManager, RateLimitPresets } from '../../core';

const processorFile = path.resolve(process.cwd(), 'dist/processors/flow-buffer.js');

queueManager.registerWorker({
    queueName: 'flow-buffer-queue',
    processor: processorFile,
    options: {
        concurrency: 10,
        ...RateLimitPresets.high,
    },
});