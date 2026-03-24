import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import config from '@/config';
import { BaseResultData } from '@/core/result';
import {
    UpdateByKeyAndRes,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
} from '@/core/database/repository';
import { RunTransaction } from '@/core/database/transaction';
import { logger } from '@/shared/logger';
import { systemIpBlackSchema } from '@database/schema/system_ip_black';
import { IsIpAddress } from '@/core/check';
import { CacheEnum } from '@/constants/enum';
import { CacheDelete, CacheInsert, CacheUpdate, WithCache } from '@/core/cache';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemIpBlackSchema.$inferInsert;
        if (data.ipAddress && !IsIpAddress(data.ipAddress)) return BaseResultData.fail(400, 'IP地址格式错误');
        await InsertIpBlack(data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findAll(ctx: Context) {
    try {
        const {
            ipAddress,
            status,
        } = ctx.query;
        let bStatus = undefined;
        if (status) {
            bStatus = status === 'true' ? true : false;
        };
        const where = CreateQueryBuilder(systemIpBlackSchema)
            .eq('delFlag', false)
            .like('ipAddress', ipAddress)
            .eq('status', bStatus)
            .build();
        const data = await FindAll(systemIpBlackSchema, where);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ctx.body as typeof systemIpBlackSchema.$inferInsert;
        if (data.ipAddress && !IsIpAddress(data.ipAddress)) return BaseResultData.fail(400, 'IP地址格式错误');
        const res = await UpdateByKeyAndRes(systemIpBlackSchema, 'ipBlackId', ctx, data);
        config.guard.ipBlacklist && await CacheUpdate(CacheEnum.IP_BLACK, 'ipBlackId', res);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemIpBlackSchema, 'ipBlackId', ctx);
        config.guard.ipBlacklist && await CacheDelete(CacheEnum.IP_BLACK, 'ipBlackId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 获取缓存黑名单ip，已启用的数据
export async function GetCacheIpBlackList() {
    const data = await WithCache(
        CacheEnum.IP_BLACK,
        async () => {
            const where = CreateQueryBuilder(systemIpBlackSchema).eq('delFlag', false).build();
            return await FindAll(systemIpBlackSchema, where);
        }
    );
    return data?.filter(item => item.status) || [];
};

// 插入数据
export async function InsertIpBlack(data: typeof systemIpBlackSchema.$inferInsert) {
    try {
        await RunTransaction(async (tx) => {
            const ipList = await tx.select().from(systemIpBlackSchema).where(eq(systemIpBlackSchema.ipAddress, data.ipAddress));
            const ipInfo = ipList[0] || null;
            if (ipInfo) {
                const res = await tx.update(systemIpBlackSchema).set({
                    status: true,
                    remark: data.remark,
                    updateTime: new Date()
                }).where(eq(systemIpBlackSchema.ipBlackId, ipInfo.ipBlackId)).returning();
                if (config.guard.ipBlacklist) await CacheUpdate(CacheEnum.IP_BLACK, 'ipBlackId', res[0]);
                return;
            };
            const res = await tx.insert(systemIpBlackSchema).values(data).returning();
            if (data.status) {
                config.guard.ipBlacklist && await CacheInsert(CacheEnum.IP_BLACK, res);
            };
        });
    }
    catch (error) {
        logger.error('插入IP黑名单失败' + error);
    }
};