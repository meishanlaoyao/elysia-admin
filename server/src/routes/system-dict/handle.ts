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
} from '@/common/db';
import { CacheEnum } from '@/common/enum';
import { WithCache } from '@/utils/cache';

export async function createType(req: Context) {
    try {
        const data = req.body as typeof systemDictTypeSchema.$inferInsert;
        await InsertOne(systemDictTypeSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createData(req: Context) {
    try {
        const data = req.body as typeof systemDictDataSchema.$inferInsert;
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

export async function findAllData(req: Context) {
    try {
        const { dictType } = req.query;
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

export async function findListType(req: Context) {
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
        } = req.query;
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

export async function findListData(req: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            dictLabel,
            dictType,
        } = req.query;
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

export async function findOneType(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await FindOneByKey(systemDictTypeSchema, 'dictId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOneData(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await FindOneByKey(systemDictDataSchema, 'dictCode', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateType(req: Context) {
    try {
        const data = req.body as typeof systemDictTypeSchema.$inferSelect;
        await UpdateByKey(systemDictTypeSchema, 'dictId', data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateData(req: Context) {
    try {
        const data = req.body as typeof systemDictDataSchema.$inferSelect;
        await UpdateByKey(systemDictDataSchema, 'dictCode', data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeType(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDictTypeSchema, 'dictId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeData(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDictDataSchema, 'dictCode', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};