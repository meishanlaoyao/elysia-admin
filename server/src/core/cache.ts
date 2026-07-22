import { Get, Set } from '@/core/database/redis';
import config from '@/config';
import { logger } from '@/shared/logger';
import { RedisLock } from '@/core/database/redis-lock';

/**
 * 通用缓存包装函数（带分布式锁防止缓存击穿）
 * 先从 Redis 查询，如果没有则使用分布式锁执行数据库查询函数，并将结果缓存到 Redis
 * 
 * @param cacheKey - Redis 缓存的 key
 * @param dbQueryFn - 数据库查询函数（当缓存不存在时执行）
 * @param expire - 可选的过期时间（单位：秒）
 * @param lockTtl - 分布式锁的过期时间（单位：秒），默认 10 秒
 * @param retryTimes - 获取锁失败后的重试次数，默认 3 次
 * @param retryDelay - 重试间隔（单位：毫秒），默认 100ms
 * @returns 查询结果
 * 
 * @example
 * ```typescript
 * const data = await WithCache(
 *   CacheEnum.DICT_TYPE,
 *   async () => {
 *     const where = CreateQueryBuilder(systemDictTypeSchema).eq('delFlag', false).build();
 *     return await FindAll(systemDictTypeSchema, where);
 *   }
 * );
 * ```
 */
export async function WithCache<T>(
    cacheKey: string,
    dbQueryFn: () => Promise<T>,
    expire: number = config.app.baseCacheTime,
    lockTtl: number = 10,
    retryTimes: number = 3,
    retryDelay: number = 100
): Promise<T> {
    const cacheData = await Get(cacheKey);
    if (cacheData != null) return cacheData as T;
    const lock = new RedisLock(`cache:${cacheKey}`, lockTtl);
    const acquired = await lock.acquire();
    if (acquired) {
        try {
            const doubleCheckCache = await Get(cacheKey);
            if (doubleCheckCache != null) return doubleCheckCache as T;
            const data = await dbQueryFn();
            if (data !== undefined && data !== null) await Set(cacheKey, data, expire);
            return data;
        } catch (error) {
            logger.error(`缓存查询失败 [${cacheKey}]:` + error);
            throw error;
        } finally {
            await lock.release();
        }
    } else {
        for (let i = 0; i < retryTimes; i++) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            const retryCache = await Get(cacheKey);
            if (retryCache != null) return retryCache as T;
        };
        logger.warn(`获取锁失败且重试超时 [${cacheKey}]，直接查询数据库`);
        return await dbQueryFn();
    }
};