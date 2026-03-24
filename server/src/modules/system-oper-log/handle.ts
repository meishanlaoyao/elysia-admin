import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { SYSTEM_API_METHOD } from '@/constants/dict';
import { systemOperLogSchema } from '@database/schema/system_oper_log';
import { SanitizeObject } from '@/core/function';
import { logger } from '@/shared/logger';
import { SensitiveFields } from '@/constants/base';

export async function create(data: typeof systemOperLogSchema.$inferInsert) {
    try {
        await InsertOne(systemOperLogSchema, null, data);
    } catch (error) {
        logger.error('插入操作日志失败' + error);
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
        await SoftDeleteByKeys(systemOperLogSchema, 'logId', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 插入操作日志
export async function AddOperLog(ctx: Context) {
    const routeInfo = (ctx as any).routeInfo;
    const userInfo = (ctx as any).user;
    const isLog = routeInfo?.meta?.isLog || false;
    if (!isLog) return;
    let operParam: any = {};
    if (ctx?.params && Object.keys(ctx?.params).length) operParam = { params: ctx?.params };
    if (ctx?.query && Object.keys(ctx?.query).length) operParam = { ...operParam, query: ctx?.query };
    if (ctx?.body) operParam = { ...operParam, body: ctx?.body };
    operParam = JSON.stringify(SanitizeObject(operParam, SensitiveFields));
    if (operParam.length > 1024) operParam = operParam.slice(0, 1024);
    const response = (ctx as any).response;
    const status = response?.code === 200;
    let jsonResult = JSON.stringify(SanitizeObject(response, SensitiveFields)) || '';
    if (jsonResult.length > 1024) jsonResult = jsonResult.slice(0, 1024);
    const costTime = Date.now() - (ctx as any).startTime;
    const data = {
        title: routeInfo?.tags,
        action: routeInfo?.summary,
        requestMethod: SYSTEM_API_METHOD[ctx.request.method],
        operatorType: userInfo?.userType,
        userId: userInfo?.userId,
        operUrl: ctx?.route,
        operIp: userInfo?.ipaddr,
        operLocation: userInfo?.loginLocation,
        status,
        costTime,
        operParam,
        jsonResult,
    };
    create(data);
};