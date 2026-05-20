import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { Get, Keys, Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
export async function findList(ctx: AppContext) {
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

export async function forceLogout(ctx: AppContext) {
    try {
        const ids = ctx.params.ids.split(',').filter(Boolean);
        if (!ids.length) return BaseResultData.ok();
        for (const userId of ids) {
            await Del(CacheEnum.ONLINE_USER + userId);
            const refreshKeys = await Keys(CacheEnum.REFRESH_TOKEN + `${userId}:`);
            if (refreshKeys.length) await Del(refreshKeys);
            await Del(CacheEnum.ADMIN_MENU + userId);
        }
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};