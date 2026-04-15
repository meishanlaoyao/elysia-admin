/**
 * core 层统一导出
 */
export { queueManager, getRedisConnection } from './manager';
export { createQueue } from './queue';
export { createWorker } from './worker';
export { schedule, removeSchedule } from './scheduler';
export { buildRateLimit, RateLimitPresets } from './rate-limit';
export { buildRetry, RetryPresets } from './retry';
export { createTaskRegistry, parseArgs } from './processor-utils';
export type { TaskFn } from './processor-utils';
export type {
    QueueConfig,
    WorkerConfig,
    JobData,
    JobOptions,
    RateLimitConfig,
    RetryConfig,
    ScheduleConfig,
    IQueueManager,
} from './types';