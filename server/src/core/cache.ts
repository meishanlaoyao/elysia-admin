import { Get, Set, Del } from '@/core/database/redis';
import config from '@/config';
import { logger } from '@/shared/logger';

/**
 * 通用缓存包装函数
 * 先从 Redis 查询，如果没有则执行数据库查询函数，并将结果缓存到 Redis
 * 
 * @param cacheKey - Redis 缓存的 key
 * @param dbQueryFn - 数据库查询函数（当缓存不存在时执行）
 * @param expire - 可选的过期时间（单位：秒）
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
    expire: number = config.app.baseCacheTime
): Promise<T> {
    const cacheData = await Get(cacheKey);
    if (cacheData?.length) return cacheData as T;
    const data = await dbQueryFn();
    if (data) await Set(cacheKey, data, expire);
    return data;
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