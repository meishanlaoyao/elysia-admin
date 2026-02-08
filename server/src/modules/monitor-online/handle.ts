import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { Get, Keys, Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';

export async function findList(ctx: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
        } = ctx.query;
        const num = Number(pageNum);
        const size = Number(pageSize);
        const onlineUserKeys = await Keys(CacheEnum.ONLINE_USER);
        const start = (num - 1) * size;
        const end = start + size;
        const onlineUserKeysSlice = onlineUserKeys.slice(start, end);
        const total = onlineUserKeys.length;
        const list = await Promise.all(onlineUserKeysSlice.map(async (key) => {
            const { roles, permissions, ...rest } = await Get(key);
            return rest;
        }));
        return BaseResultData.ok({
            list,
            total,
        });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function forceLogout(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        if (ids?.length) await Del(ids.map(id => CacheEnum.ONLINE_USER + id));
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};