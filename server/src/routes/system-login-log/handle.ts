import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/db';
import { systemLoginLogSchema } from '@/schema/system_login_log';


// 插入登陆日志
export async function InsertLoginLog(data: typeof systemLoginLogSchema.$inferInsert) {
    try {
        await InsertOne(systemLoginLogSchema, data);
    } catch (error) {
        console.error('插入登陆日志失败', error);
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
        const whereCondition = CreateQueryBuilder(systemLoginLogSchema)
            .eq('delFlag', false)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemLoginLogSchema, whereCondition, {
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
        await SoftDeleteByKeys(systemLoginLogSchema, 'logId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};