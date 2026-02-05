import { Context } from 'elysia';
import { Get } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { BaseResultData } from '@/core/result';

/**
 * 判断api是否可用
 * @param method 
 * @param route 
 */
async function isUse(method: string, route: string) {
    const cacheKey = `${CacheEnum.FALLBACK_API}${method}:${route}`;
    const val = await Get(cacheKey);
    return val === '1' ? false : true;
};

/**
 * api开关
 */
export async function ApiGuard(ctx: Context) {
    const val = await isUse(ctx.request.method, ctx.route);
    if (!val) return BaseResultData.fail(503);
};