import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindOneByKey,
    FindAll,
} from '@/core/database/repository';
import { monitorJobSchema } from 'database/schema/monitor_job';
import { inArray } from 'drizzle-orm';
import { queueManager, schedule, removeSchedule } from '@/infrastructure/queue';

/**
 * 获取 system-cron-queue 实例
 */
function getCronQueue() {
    const queue = queueManager.getQueue('system-cron-queue');
    if (!queue) throw new Error('system-cron-queue 未注册');
    return queue;
}

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof monitorJobSchema.$inferInsert;
        if (data.status && data.jobName && data.jobCron) {
            await schedule(getCronQueue(), data.jobName, {
                cron: data.jobCron,
                data: {
                    taskName: data.jobName,
                    jobArgs: data.jobArgs ?? '',
                },
            });
        }
        await InsertOne(monitorJobSchema, ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = 'createTime',
            sortRule = 'desc',
            startTime,
            endTime,
            jobName,
            jobCron,
            status,
        } = ctx.query;
        let newStatus = undefined;
        if (status !== undefined) newStatus = status === 'true' ? true : false;
        const whereCondition = CreateQueryBuilder(monitorJobSchema)
            .eq('delFlag', false)
            .like('jobName', jobName)
            .eq('jobCron', jobCron)
            .eq('status', newStatus)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(monitorJobSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule,
        });
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function update(ctx: Context) {
    try {
        const data = ctx.body as typeof monitorJobSchema.$inferSelect;
        const jobId = data.jobId;
        const oldJob = await FindOneByKey(monitorJobSchema, 'jobId', jobId);
        const queue = getCronQueue();

        if (oldJob && data.jobName) {
            const oldJobName = String(oldJob.jobName);
            const oldJobCron = String(oldJob.jobCron);
            const newJobName = String(data.jobName);

            // 先移除旧的 repeatable job
            await removeSchedule(queue, oldJobName, oldJobCron);

            // 如果新状态是启用，重新注册
            if (data.status !== false && data.jobCron) {
                await schedule(queue, newJobName, {
                    cron: String(data.jobCron),
                    data: {
                        taskName: newJobName,
                        jobArgs: data.jobArgs ?? '',
                    },
                });
            }
        }

        await UpdateByKey(monitorJobSchema, 'jobId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}

export async function remote(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        const jobs = await FindAll(monitorJobSchema, inArray(monitorJobSchema.jobId, ids));
        const queue = getCronQueue();

        if (jobs?.length) {
            for (const job of jobs) {
                await removeSchedule(queue, String(job.jobName), String(job.jobCron));
            }
        }

        await SoftDeleteByKeys(monitorJobSchema, 'jobId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
