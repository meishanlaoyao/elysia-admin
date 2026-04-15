import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import './runtime/app';
import { queueManager } from './core';

export const queues = queueManager.getAllQueues().map((q) => new BullMQAdapter(q));

export { queueManager } from './core';
export { schedule, removeSchedule } from './core/scheduler';
export { buildRetry, RetryPresets } from './core/retry';
export { buildRateLimit, RateLimitPresets } from './core/rate-limit';
export type { JobData, JobOptions } from './core/types';