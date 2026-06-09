import type { AppContext } from '@/types/app-context';
import { eq } from 'drizzle-orm';
import {
        InsertOne,
        UpdateByKey,
        SoftDeleteByKeys,
        CreateQueryBuilder,
        FindOneByKey,
        FindPageWithJoin
} from '@/core/database/repository';
import { BaseResultData } from '@/core/result';
import { businessMerchantSchema, businessMerchantConfigsSchema } from 'database/schema/business_merchant';

export async function create(ctx: AppContext) {
        await InsertOne(businessMerchantSchema, ctx);
        return BaseResultData.ok();
};

export async function createConfig(ctx: AppContext) {
        await InsertOne(businessMerchantConfigsSchema, ctx);
        return BaseResultData.ok();
};

export async function findOneConfig(ctx: AppContext) {
        const id = ctx.params.id;
        const res = await FindOneByKey(businessMerchantConfigsSchema, 'id', id);
        return BaseResultData.ok(res);
};

export async function findList(ctx: AppContext) {
        const {
                pageNum = 1,
                pageSize = 10,
                orderByColumn = "createTime",
                sortRule = "desc",
                startTime,
                endTime,
                name,
                status,
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(businessMerchantSchema)
                .eq('delFlag', false)
                .like('name', name)
                .eq('status', status)
                .dateRange('createTime', startTime, endTime)
                .join({
                        joinSchema: businessMerchantConfigsSchema,
                        fieldName: 'configList',
                        foreignKey: 'id',
                        primaryKey: 'merchantId',
                        defaultValue: [],
                        where: eq(businessMerchantConfigsSchema.delFlag, false),
                        multiple: true
                });
        const res = await FindPageWithJoin(businessMerchantSchema, whereCondition, {
                pageNum,
                pageSize,
                orderByColumn,
                sortRule
        });
        res.list = res.list.map(c1 => {
                if (c1?.configList?.length) {
                        c1.configList = c1?.configList?.map((c2: any) => ({ id: c2.id, channel: c2.channel, }))
                };
                return c1;
        });
        return BaseResultData.ok(res);
};

export async function update(ctx: AppContext) {
        await UpdateByKey(businessMerchantSchema, 'id', ctx);
        return BaseResultData.ok();
};

export async function updateConfig(ctx: AppContext) {
        await UpdateByKey(businessMerchantConfigsSchema, 'id', ctx);
        return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
        await SoftDeleteByKeys(businessMerchantSchema, 'id', ctx);
        return BaseResultData.ok();
};

export async function removeConfig(ctx: AppContext) {
        await SoftDeleteByKeys(businessMerchantConfigsSchema, 'id', ctx);
        return BaseResultData.ok();
};