import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/pg/db';
import { systemOperLogSchema } from '@/schema/system_oper_log';

export async function create(data: typeof systemOperLogSchema.$inferInsert) {
    try {
        await InsertOne(systemOperLogSchema, data);
    } catch (error) {
        console.error('插入操作日志失败', error);
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
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemOperLogSchema)
            .eq('delFlag', false)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemOperLogSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });
        return BaseResultData.ok(res);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemOperLogSchema, 'logId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 插入操作日志
export async function AddOperLog(ctx: Context) {
    const routeInfo = (ctx as any).routeInfo;
    const isLog = routeInfo?.meta?.isLog || false;
    if (!isLog) return;

    console.log(ctx);
};