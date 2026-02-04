import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { systemDictDataSchema, systemDictTypeSchema } from '@/schema/system_dict';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll
} from '@/common/pg/db';
import { CacheEnum } from '@/common/enum';
import { WithCache } from '@/common/cache';
import { ParseDateFields } from '@/common/dto';

export async function createType(ctx: Context) {
    try {
        const data = ctx.body as typeof systemDictTypeSchema.$inferInsert;
        await InsertOne(systemDictTypeSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createData(ctx: Context) {
    try {
        const data = ctx.body as typeof systemDictDataSchema.$inferInsert;
        await InsertOne(systemDictDataSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findAllType() {
    try {
        const data = await WithCache(
            CacheEnum.DICT_TYPE,
            async () => {
                const where = CreateQueryBuilder(systemDictTypeSchema).eq('delFlag', false).build();
                return await FindAll(systemDictTypeSchema, where);
            }
        );
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findAllData(ctx: Context) {
    try {
        const { dictType } = ctx.query;
        const data = await WithCache(
            CacheEnum.DICT_DATA + dictType,
            async () => {
                const where = CreateQueryBuilder(systemDictDataSchema)
                    .eq('delFlag', false)
                    .eq('dictType', dictType)
                    .build();
                return await FindAll(systemDictDataSchema, where);
            }
        );
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findListType(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            dictName,
            dictType,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemDictTypeSchema)
            .eq('delFlag', false)
            .like('dictName', dictName)
            .like('dictType', dictType)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemDictTypeSchema, whereCondition, {
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

export async function findListData(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "dictSort",
            sortRule = "asc",
            startTime,
            endTime,
            dictLabel,
            dictType,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemDictDataSchema)
            .eq('delFlag', false)
            .like('dictLabel', dictLabel)
            .like('dictType', dictType)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemDictDataSchema, whereCondition, {
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

export async function findOneType(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(systemDictTypeSchema, 'dictId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateType(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemDictTypeSchema, 'dictId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateData(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemDictDataSchema, 'dictCode', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeType(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDictTypeSchema, 'dictId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeData(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDictDataSchema, 'dictCode', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};