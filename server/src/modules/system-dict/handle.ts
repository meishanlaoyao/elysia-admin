import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { systemDictDataSchema, systemDictTypeSchema } from '@database/schema/system_dict';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll
} from '@/core/database/repository';
import { CacheEnum } from '@/constants/enum';
import { WithCache } from '@/core/cache';

export async function createType(ctx: AppContext) {
    try {
        await InsertOne(systemDictTypeSchema, ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createData(ctx: AppContext) {
    try {
        await InsertOne(systemDictDataSchema, ctx);
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

export async function findAllData(ctx: AppContext) {
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

export async function findListType(ctx: AppContext) {
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

export async function findListData(ctx: AppContext) {
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

export async function findOneType(ctx: AppContext) {
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

export async function updateType(ctx: AppContext) {
    try {
        await UpdateByKey(systemDictTypeSchema, 'dictId', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateData(ctx: AppContext) {
    try {
        await UpdateByKey(systemDictDataSchema, 'dictCode', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeType(ctx: AppContext) {
    try {
        await SoftDeleteByKeys(systemDictTypeSchema, 'dictId', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeData(ctx: AppContext) {
    try {
        await SoftDeleteByKeys(systemDictDataSchema, 'dictCode', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};