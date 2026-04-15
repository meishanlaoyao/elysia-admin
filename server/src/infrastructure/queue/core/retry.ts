/**
 * 重试策略
 * 生成标准的 BullMQ backoff 配置
 */
import type { RetryConfig, JobOptions } from './types';

/**
 * 构建重试选项，合并到 JobOptions 中使用
 *
 * @example
 * addJob('trade-order-queue', data, {
 *   ...buildRetry({ attempts: 3, strategy: 'exponential', delay: 1000 }),
 * });
 */
export function buildRetry(config: RetryConfig): Pick<JobOptions, 'attempts' | 'backoff'> {
    const { attempts, strategy, delay } = config;

    return {
        attempts,
        backoff: strategy === 'exponential'
            ? { type: 'exponential', delay }
            : { type: 'fixed', delay },
    };
};

/** 预设重试策略 */
export const RetryPresets = {
    /** 不重试 */
    none: buildRetry({ attempts: 1, strategy: 'fixed', delay: 0 }),
    /** 固定间隔重试 3 次，每次 2s */
    standard: buildRetry({ attempts: 3, strategy: 'fixed', delay: 2000 }),
    /** 指数退避重试 5 次，初始 1s */
    aggressive: buildRetry({ attempts: 5, strategy: 'exponential', delay: 1000 }),
} as const;