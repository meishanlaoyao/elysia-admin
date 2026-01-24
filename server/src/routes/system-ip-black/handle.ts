import { Context } from 'elysia';
import config from '@/config';
import { BaseResultData } from '@/common/result';
import {
    InsertOneAndRes,
    UpdateByKeyAndRes,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { systemIpBlackSchema } from '@/schema/system_ip_black';
import { IsIpAddress } from '@/common/check';
import { CacheEnum } from '@/common/enum';
import { CacheDelete, CacheInsert, CacheUpdate, WithCache } from '@/common/cache';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemIpBlackSchema.$inferInsert;
        if (data.ipAddress && !IsIpAddress(data.ipAddress)) {
            return BaseResultData.fail(400, 'IP地址格式错误');
        };
        const res = await InsertOneAndRes(systemIpBlackSchema, data);
        config.guard.ipBlacklist && await CacheInsert(CacheEnum.IP_BLACK, res);
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
        const data = ParseDateFields(ctx.body);
        if (data.ipAddress && !IsIpAddress(data.ipAddress)) {
            return BaseResultData.fail(400, 'IP地址格式错误');
        };
        const res = await UpdateByKeyAndRes(systemIpBlackSchema, 'ipBlackId', data, true);
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
        await SoftDeleteByKeys(systemIpBlackSchema, 'ipBlackId', ids);
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