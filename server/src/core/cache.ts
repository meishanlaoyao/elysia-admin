import { Get, Set, Del } from '@/core/database/redis';
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
    if (cacheData?.length) return cacheData as T;
    const lock = new RedisLock(`cache:${cacheKey}`, lockTtl);
    const acquired = await lock.acquire();
    if (acquired) {
        try {
            const doubleCheckCache = await Get(cacheKey);
            if (doubleCheckCache?.length) return doubleCheckCache as T;
            const data = await dbQueryFn();
            if (data) await Set(cacheKey, data, expire);
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
            if (retryCache?.length) return retryCache as T;
        };
        logger.warn(`获取锁失败且重试超时 [${cacheKey}]，直接查询数据库`);
        return await dbQueryFn();
    }
};

/**
 * 更新缓存-插入新数据
 * @param cacheKey - Redis 缓存的 key
 * @param data - 要插入的数据
 * @returns 是否插入成功
 */
export async function CacheInsert(
    cacheKey: string,
    data: any,
): Promise<boolean> {
    try {
        const oldData = await Get(cacheKey);
        let newData = oldData?.length ? [...oldData, data] : [data];
        return await Set(cacheKey, newData);
    }
    catch (error) {
        logger.error('更新缓存-插入新数据失败' + error);
        return false;
    }
};

/**
 * 更新缓存-删除指定数据
 * @param cacheKey - Redis 缓存的 key
 * @param key - 判断数据的key
 * @param values - 判断数据的value数组
 * @returns 是否删除成功
 */
export async function CacheDelete(
    cacheKey: string,
    key: string,
    values: number[],
): Promise<boolean> {
    try {
        const oldData = await Get(cacheKey);
        if (!oldData?.length) return await Del(cacheKey);
        let newData = oldData.filter((item: any) => !values.includes(item[key]));
        if (newData?.length) return await Set(cacheKey, newData);
        return await Del(cacheKey);
    }
    catch (error) {
        logger.error('更新缓存-删除指定数据失败' + error);
        return false;
    }
};

/**
 * 更新缓存-更新指定数据
 * @param cacheKey - Redis 缓存的 key
 * @param key - 判断数据的key
 * @param data - 要更新的数据
 * @returns 是否更新成功
 */
export async function CacheUpdate(
    cacheKey: string,
    key: string,
    data: any,
): Promise<boolean> {
    try {
        const oldData = await Get(cacheKey);
        if (!oldData?.length) return await Set(cacheKey, [data]);
        let newData = oldData.map((item: any) => {
            if (item[key] === data[key]) return { ...item, ...data };
            return item;
        });
        return await Set(cacheKey, newData);
    }
    catch (error) {
        logger.error('更新缓存-更新指定数据失败' + error);
        return false;
    }
};