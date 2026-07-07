import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { systemLoginLogSchema } from '@database/schema/system_login_log';
import { logServerError } from '@/shared/server-error';


// 插入登陆日志
export async function create(data: typeof systemLoginLogSchema.$inferInsert) {
    try {
        await InsertOne(systemLoginLogSchema, null, data);
    } catch (error) {
        logServerError('插入登陆日志失败', error);
    }
};

export async function findList(ctx: AppContext) {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn = "createTime",
        sortRule = "desc",
        startTime,
        endTime,
        loginName,
        ipaddr,
        loginType,
        status,
    } = ctx.query;
    const whereCondition = CreateQueryBuilder(systemLoginLogSchema)
        .eq('delFlag', false)
        .like('loginName', loginName)
        .like('ipaddr', ipaddr)
        .eq('loginType', loginType)
        .eq('status', status)
        .dateRange('createTime', startTime, endTime)
        .build();
    const res = await FindPage(systemLoginLogSchema, whereCondition, {
        pageNum,
        pageSize,
        orderByColumn,
        sortRule
    });
    return BaseResultData.ok(res);
};

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(systemLoginLogSchema, 'logId', ctx);
    return BaseResultData.ok();
};

/**
 * 添加登陆日志
 */
export async function AddLoginLog(ctx: AppContext) {
    try {
        const clientInfo = ctx.clientInfo;
        if (!clientInfo) return;
        const user = (ctx as any)?.user || {};
        const res = (ctx as any)?.response || {};
        create({
            ...clientInfo,
            loginType: 'admin', message: res?.msg,
            status: res.code === 200,
            createBy: user.userId,
            loginName: user.username || '',
        });
    }
    catch (error) {
        logServerError('添加登陆日志失败', error);
    }
};