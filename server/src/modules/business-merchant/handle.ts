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
        const data = ctx.body as typeof businessMerchantSchema.$inferInsert;
        await InsertOne(businessMerchantSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};