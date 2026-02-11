import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { ParseDateFields } from '@/types/dto';
import { RunTransaction } from '@/core/database/transaction';
import { systemStorageSchema } from 'database/schema/system_storage';
import { eq } from 'drizzle-orm';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemStorageSchema.$inferInsert;
        await InsertOne(systemStorageSchema, data);
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
            name,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemStorageSchema)
            .eq('delFlag', false)
            .like('name', name)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(systemStorageSchema, whereCondition, {
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

export async function update(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await RunTransaction(async (tx) => {
            if (data?.status) {
                await tx.update(systemStorageSchema).set({ status: false }).where(eq(systemStorageSchema.delFlag, false));
            };
            await tx.update(systemStorageSchema).set(data).where(eq(systemStorageSchema.storageId, data.storageId));
        });
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemStorageSchema, 'storageId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};