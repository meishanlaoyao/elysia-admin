import type { AppContext } from '@/types/app-context';
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
import { logServerError } from '@/shared/server-error';
import { systemIpBlackSchema } from '@database/schema/system_ip_black';
import { IsIpAddress } from '@/core/check';
import { CacheEnum } from '@/constants/enum';
import { WithCache } from '@/core/cache';
import { Del } from '@/core/database/redis';

async function invalidateIpBlackCache() {
    if (config.guard.ipBlacklist) await Del(CacheEnum.IP_BLACK);
};

export async function create(ctx: AppContext) {
    const data = ctx.body as typeof systemIpBlackSchema.$inferInsert;
    if (data.ipAddress && !IsIpAddress(data.ipAddress)) return BaseResultData.fail(400, 'IP地址格式错误');
    await InsertIpBlack(data);
    return BaseResultData.ok();
};

export async function findAll(ctx: AppContext) {
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
};

export async function update(ctx: AppContext) {
    const data = ctx.body as typeof systemIpBlackSchema.$inferInsert;
    if (data.ipAddress && !IsIpAddress(data.ipAddress)) return BaseResultData.fail(400, 'IP地址格式错误');
    await UpdateByKeyAndRes(systemIpBlackSchema, 'ipBlackId', ctx, data);
    await invalidateIpBlackCache();
    return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(systemIpBlackSchema, 'ipBlackId', ctx);
    await invalidateIpBlackCache();
    return BaseResultData.ok();
};

// 获取缓存黑名单ip，已启用的数据
export async function GetCacheIpBlackList() {
    const data = await WithCache(
        CacheEnum.IP_BLACK,
        async () => {
            const where = CreateQueryBuilder(systemIpBlackSchema)
                .eq('delFlag', false)
                .eq('status', true)
                .build();
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
                await tx.update(systemIpBlackSchema).set({
                    status: true,
                    remark: data.remark,
                    updateTime: new Date()
                }).where(eq(systemIpBlackSchema.ipBlackId, ipInfo.ipBlackId)).returning();
                await invalidateIpBlackCache();
                return;
            };
            await tx.insert(systemIpBlackSchema).values(data).returning();
            await invalidateIpBlackCache();
        });
    }
    catch (error) {
        logServerError('插入IP黑名单失败', error);
    }
};
