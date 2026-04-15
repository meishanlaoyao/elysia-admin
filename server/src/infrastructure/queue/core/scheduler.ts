/**
 * 调度器
 * 基于 BullMQ repeat 实现 cron 定时任务投递
 */
import type { Queue } from 'bullmq';
import { logger } from '@/shared/logger';
import type { ScheduleConfig } from './types';

/**
 * 为指定队列添加 cron 定时任务
 *
 * @example
 * schedule(myQueue, 'cleanup', {
 *   cron: '0 2 * * *',
 *   data: { type: 'log' },
 * });
 */
export async function schedule(
    queue: Queue,
    jobName: string,
    config: ScheduleConfig
): Promise<void> {
    const { cron, data = {}, options = {} } = config;
    await queue.add(jobName, data, {
        ...options,
        repeat: { pattern: cron },
    });
    logger.info(`✓ [Scheduler] "${jobName}" 已注册 cron: ${cron}`);
};

/**
 * 移除队列中的 cron 任务
 */
export async function removeSchedule(
    queue: Queue,
    jobName: string,
    cron: string
): Promise<void> {
    await queue.removeRepeatable(jobName, { pattern: cron });
    logger.info(`[Scheduler] "${jobName}" cron 已移除`);
};