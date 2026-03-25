import { Context } from 'elysia';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { BaseResultData } from '@/core/result';
import { businessMerchantSchema } from 'database/schema/business_merchant';

export async function create(ctx: Context) {
    try {
        await InsertOne(businessMerchantSchema, ctx);
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
        const whereCondition = CreateQueryBuilder(businessMerchantSchema)
            .eq('delFlag', false)
            .like('name', name)
            .dateRange('createTime', startTime, endTime)
            .build();
        const res = await FindPage(businessMerchantSchema, whereCondition, {
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
        await UpdateByKey(businessMerchantSchema, 'id', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        await SoftDeleteByKeys(businessMerchantSchema, 'id', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};