import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { Get, Keys, Set, Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';

export async function findTypeList() {
        const keys = Object.keys(CacheEnum) || [];
        return BaseResultData.ok(keys);
};

export async function findCacheList(ctx: AppContext) {
        const { cacheType } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const keys = await Keys(cache) || [];
        const filterKeys = keys.map(key => {
                let arr = key.split(':');
                arr.splice(0, 2);
                return arr.join(':');
        });
        return BaseResultData.ok(filterKeys);
};

export async function findKey(ctx: AppContext) {
        const { cacheType, cacheKey } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        const data = await Get(key) || null;
        return BaseResultData.ok(data);
};

export async function updateKey(ctx: AppContext) {
        const { cacheType, cacheKey, cacheValue } = ctx.body as any;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        await Set(key, cacheValue);
        return BaseResultData.ok();
};

export async function removeType(ctx: AppContext) {
        const { cacheType } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const keys = await Keys(cache) || [];
        await Del(keys);
        return BaseResultData.ok();
};

export async function removeKey(ctx: AppContext) {
        const { cacheType, cacheKey } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        await Del(key);
        return BaseResultData.ok();
};