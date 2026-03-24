import { Context } from 'elysia';
import {
    InsertOne,
    FindOneByKey,
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