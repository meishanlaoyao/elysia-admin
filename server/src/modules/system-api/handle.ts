import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { ParseDateFields } from '@/types/dto';
import { systemApiSchema } from '@database/schema/system_api';
import { CacheEnum } from '@/constants/enum';
import { Del, Set } from '@/core/database/redis';
import { SYSTEM_API_METHOD } from '@/constants/dict';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemApiSchema.$inferInsert;
        await InsertOne(systemApiSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
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
            apiName,
            apiPath,
            apiMethod,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemApiSchema)
            .eq('delFlag', false)
            .like('apiName', apiName)
            .like('apiPath', apiPath)
            .eq('apiMethod', apiMethod)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemApiSchema, whereCondition, {
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

export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(systemApiSchema, 'apiId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemApiSchema, 'apiId', data, true);
        const reverseMethodMap = Object.fromEntries(Object.entries(SYSTEM_API_METHOD).map(([key, value]) => [value, key]));
        if (data.status) {
            const key = `${CacheEnum.FALLBACK_API}${reverseMethodMap[data.apiMethod]}:${data.apiPath}`;
            await Del(key);
        } else {
            const key = `${CacheEnum.FALLBACK_API}${reverseMethodMap[data.apiMethod]}:${data.apiPath}`;
            await Set(key, '1');
        };
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemApiSchema, 'apiId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};