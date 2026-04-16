/**
 * FlowBuffer Worker 注册
 * processor 以沙箱模式运行（独立子进程）
 */
import { queueManager, RateLimitPresets } from '../../core';
import { getProcessorPath } from '../../config/env';

const processorFile = getProcessorPath('flow-buffer');

queueManager.registerWorker({
    queueName: 'flow-buffer-queue',
    processor: processorFile,
    options: {
        concurrency: 10,
        ...RateLimitPresets.high,
    },
});