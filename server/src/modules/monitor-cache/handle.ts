import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { Get, Keys, Set, Del } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';

export async function findTypeList() {
    try {
        const keys = Object.keys(CacheEnum) || [];
        return BaseResultData.ok(keys);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findCacheList(ctx: Context) {
    try {
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
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findKey(ctx: Context) {
    try {
        const { cacheType, cacheKey } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        const data = await Get(key) || null;
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateKey(ctx: Context) {
    try {
        const { cacheType, cacheKey, cacheValue } = ctx.body as any;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        await Set(key, cacheValue);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeType(ctx: Context) {
    try {
        const { cacheType } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const keys = await Keys(cache) || [];
        await Del(keys);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeKey(ctx: Context) {
    try {
        const { cacheType, cacheKey } = ctx.query;
        const cache = CacheEnum[cacheType as keyof typeof CacheEnum];
        if (!cache) return BaseResultData.fail(400, '参数错误');
        const key = `${cache}${cacheKey}`;
        await Del(key);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};