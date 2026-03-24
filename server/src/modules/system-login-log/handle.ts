import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { systemLoginLogSchema } from '@database/schema/system_login_log';
import { logger } from '@/shared/logger';


// 插入登陆日志
export async function create(data: typeof systemLoginLogSchema.$inferInsert) {
    try {
        await InsertOne(systemLoginLogSchema, data);
    } catch (error) {
        logger.error('插入登陆日志失败' + error);
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

/**
 * 添加登陆日志
 */
export async function AddLoginLog(ctx: Context) {
    try {
        const clientInfo = (ctx as any).clientInfo;
        if (!clientInfo) return;
        const userId = (ctx.headers as any)?.userId || null;
        const res = (ctx as any)?.response || {};
        create({ ...clientInfo, loginType: 'admin', message: res?.msg, status: res.code === 200, createBy: userId });
    }
    catch (error) {
        logger.error('添加登陆日志失败:' + error);
    }
};