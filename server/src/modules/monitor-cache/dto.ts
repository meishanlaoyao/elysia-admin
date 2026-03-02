import { t } from 'elysia';

export const CacheListDto = {
    query: t.Object({
        cacheType: t.String({ minLength: 1, description: "缓存类型" }),
    })
};

export const CacheKeyDto = {
    query: t.Object({
        cacheType: t.String({ minLength: 1, description: "缓存类型" }),
        cacheKey: t.String({ description: "缓存键" }),
    })
};

export const UpdateCacheDto = {
    body: t.Object({
        cacheType: t.String({ minLength: 1, description: "缓存类型" }),
        cacheKey: t.String({ description: "缓存键" }),
        cacheValue: t.String({ minLength: 1, maxLength: 1024, description: "缓存值", error: '缓存值不符合要求' }),
    })
};