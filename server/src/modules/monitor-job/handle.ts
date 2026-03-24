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
import { AddCronJob, RemoveCronJob, GetCronJob } from '@/shared/cron';
import { inArray } from 'drizzle-orm';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof monitorJobSchema.$inferInsert;
        if (data.status && data.jobName && data.jobCron) AddCronJob(data.jobName, data.jobCron, data.jobName, data.jobArgs || undefined);
        await InsertOne(monitorJobSchema, ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
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
            sortRule
        });
        return BaseResultData.ok(res);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ctx.body as typeof monitorJobSchema.$inferSelect;
        const jobId = data.jobId;
        const oldJob = await FindOneByKey(monitorJobSchema, 'jobId', jobId);
        if (oldJob && data.jobName) {
            const oldJobName = String(oldJob.jobName);
            const newJobName = String(data.jobName);
            const isRunning = GetCronJob(oldJobName);
            if (oldJobName !== newJobName && isRunning) RemoveCronJob(oldJobName);
            if (data.status !== false) {
                if (data.jobCron) AddCronJob(newJobName, String(data.jobCron), newJobName, data.jobArgs || '');
            } else {
                if (isRunning) RemoveCronJob(oldJobName);
            };
        };
        await UpdateByKey(monitorJobSchema, 'jobId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remote(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        const jobs = await FindAll(monitorJobSchema, inArray(monitorJobSchema.jobId, ids));
        if (jobs?.length) {
            for (const job of jobs) {
                const jobName = String(job.jobName);
                if (GetCronJob(jobName)) RemoveCronJob(jobName);
            };
        };
        await SoftDeleteByKeys(monitorJobSchema, 'jobId', ctx);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};