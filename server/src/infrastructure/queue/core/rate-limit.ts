/**
 * 限流控制
 * 生成标准的 BullMQ limiter 配置
 */
import type { RateLimitConfig } from './types';

/**
 * 构建 Worker limiter 选项
 *
 * @example
 * registerWorker({
 *   queueName: 'flow-buffer-queue',
 *   processor,
 *   options: {
 *     ...buildRateLimit({ max: 100, duration: 1000 }),
 *   },
 * });
 */
export function buildRateLimit(config: RateLimitConfig) {
    return {
        limiter: {
            max: config.max,           // 时间窗口内允许处理的最大任务数
            duration: config.duration, // 时间窗口大小（毫秒）
        },
    };
};

/** 预设限流策略 */
export const RateLimitPresets = {
    /** 低频：每秒 5 个 */
    low: buildRateLimit({ max: 5, duration: 1000 }),
    /** 中频：每秒 20 个 */
    medium: buildRateLimit({ max: 20, duration: 1000 }),
    /** 高频：每秒 100 个 */
    high: buildRateLimit({ max: 100, duration: 1000 }),
} as const;