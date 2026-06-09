import type { AppContext } from '@/types/app-context';
import { eq, and } from 'drizzle-orm';
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
import { RunTransaction } from '@/core/database/transaction';
import { Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { WithCache } from '@/core/cache';
import { ParseDateFields } from '@/types/dto';

export async function createType(ctx: AppContext) {
    await InsertOne(systemDictTypeSchema, ctx);
    return BaseResultData.ok();
};

export async function createData(ctx: AppContext) {
    await InsertOne(systemDictDataSchema, ctx);
    return BaseResultData.ok();
};

export async function findAllType() {
    const data = await WithCache(
        CacheEnum.DICT_TYPE,
        async () => {
            const where = CreateQueryBuilder(systemDictTypeSchema).eq('delFlag', false).build();
            return await FindAll(systemDictTypeSchema, where);
        }
    );
    return BaseResultData.ok(data);
};

export async function findAllData(ctx: AppContext) {
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
};

export async function findListType(ctx: AppContext) {
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
};

export async function findListData(ctx: AppContext) {
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
};

export async function findOneType(ctx: AppContext) {
    const id = Number(ctx.params.id);
    const data = await FindOneByKey(systemDictTypeSchema, 'dictId', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
};

export async function updateType(ctx: AppContext) {
    const data = ParseDateFields(ctx.body);
    const dictId = Number(data.dictId);
    const oldType = await FindOneByKey(systemDictTypeSchema, 'dictId', dictId);
    if (!oldType || oldType.delFlag) return BaseResultData.fail(404);
    const oldDictType = oldType.dictType;
    const newDictType = data.dictType;
    const updateBy = ctx?.user?.userId || null;
    await RunTransaction(async (tx) => {
        if (newDictType && oldDictType && newDictType !== oldDictType) {
            await tx.update(systemDictDataSchema)
                .set({
                    dictType: newDictType,
                    updateTime: new Date(),
                    ...(updateBy ? { updateBy } : {}),
                })
                .where(and(
                    eq(systemDictDataSchema.dictType, oldDictType),
                    eq(systemDictDataSchema.delFlag, false),
                ));
        };
        await tx.update(systemDictTypeSchema)
            .set({
                ...data,
                ...(updateBy ? { updateBy } : {}),
                updateTime: new Date(),
            })
            .where(eq(systemDictTypeSchema.dictId, dictId));
    });
    await Del(CacheEnum.DICT_TYPE);
    if (oldDictType) await Del(CacheEnum.DICT_DATA + oldDictType);
    if (newDictType && newDictType !== oldDictType) {
        await Del(CacheEnum.DICT_DATA + newDictType);
    };
    return BaseResultData.ok();
};

export async function updateData(ctx: AppContext) {
    await UpdateByKey(systemDictDataSchema, 'dictCode', ctx);
    return BaseResultData.ok();
};

export async function removeType(ctx: AppContext) {
    await SoftDeleteByKeys(systemDictTypeSchema, 'dictId', ctx);
    return BaseResultData.ok();
};

export async function removeData(ctx: AppContext) {
    await SoftDeleteByKeys(systemDictDataSchema, 'dictCode', ctx);
    return BaseResultData.ok();
};