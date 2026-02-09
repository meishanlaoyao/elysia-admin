import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { ParseDateFields } from '@/types/dto';
import { monitorJobSchema } from 'database/schema/monitor_job';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof monitorJobSchema.$inferInsert;
        await InsertOne(monitorJobSchema, data);
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
        const whereCondition = CreateQueryBuilder(monitorJobSchema)
            .eq('delFlag', false)
            .like('jobName', jobName)
            .eq('jobCron', jobCron)
            .eq('status', status)
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
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(monitorJobSchema, 'jobId', data, true);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remote(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(monitorJobSchema, 'jobId', ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};