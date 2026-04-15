import { logger } from '@/shared/logger';
import { queueManager, schedule } from '@/infrastructure/queue';
import { FindAll } from '@/core/database/repository';
import { monitorJobSchema } from 'database/schema/monitor_job';
import { eq } from 'drizzle-orm';

/**
 * 启动时从数据库恢复所有启用的定时任务到 BullMQ repeat 队列
 *
 * 原来用 croner 在进程内跑，现在改为 BullMQ repeat job，
 * 由 Worker 进程的 system-cron-queue 消费执行。
 */
export async function RegisterAllTasks() {
    const queue = queueManager.getQueue('system-cron-queue');
    if (!queue) {
        logger.error('RegisterAllTasks: system-cron-queue 未注册，跳过任务恢复');
        return;
    };
    try {
        // 查询所有启用且未删除的定时任务
        const jobs = await FindAll(
            monitorJobSchema,
            eq(monitorJobSchema.delFlag, false)
        );
        if (!jobs?.length) {
            logger.info('✓ 无需恢复定时任务');
            return;
        };
        let count = 0;
        for (const job of jobs) {
            if (!job.status || !job.jobName || !job.jobCron) continue;
            await schedule(queue, String(job.jobName), {
                cron: String(job.jobCron),
                data: {
                    taskName: String(job.jobName),
                    jobArgs: job.jobArgs ?? '',
                },
            });
            count++;
        };
        logger.info(`✓ 定时任务恢复完成，共 ${count} 个`);
    } catch (error: any) {
        logger.error('定时任务恢复失败:', error);
        throw error;
    }
};