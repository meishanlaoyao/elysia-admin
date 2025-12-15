import { Get, Set } from '@/client/redis';
import config from '@/config';

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
    if (cacheData !== null) return cacheData as T;
    const data = await dbQueryFn();
    if (data) await Set(cacheKey, data, expire);
    return data;
};