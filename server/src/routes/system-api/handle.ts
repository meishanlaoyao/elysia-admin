import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { systemApiSchema } from '@/schema/system_api';
import { CacheEnum } from '@/common/enum';
import { Del, Set } from '@/client/redis';
import { SYSTEM_API_METHOD } from '@/common/dict';

export async function create(req: Context) {
    try {
        const data = req.body as typeof systemApiSchema.$inferInsert;
        await InsertOne(systemApiSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(req: Context) {
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
        } = req.query;
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

export async function findOne(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await FindOneByKey(systemApiSchema, 'apiId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(req: Context) {
    try {
        const data = ParseDateFields(req.body);
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

export async function remove(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemApiSchema, 'apiId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};