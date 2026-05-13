import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { GetClientIp } from '@/shared/ip';
import { CacheEnum } from '@/constants/enum';
import { redis } from '@/core/database/redis';

/**
 * ip接口限流守卫（Redis INCR + EXPIRE，原子计数）
 */
export async function IpRateLimitGuard(ctx: Context) {
    const limitInfo = (ctx as any).routeInfo?.meta?.ipRateLimit;
    if (!limitInfo) return;
    const [time, count] = limitInfo.split(':');
    const windowSec = Number(time);
    const maxCount = Number(count);
    if (!Number.isFinite(windowSec) || windowSec <= 0 || !Number.isFinite(maxCount) || maxCount <= 0) return;
    const routeKey = (ctx as any).routeKey;
    const ip = GetClientIp(ctx);
    const key = CacheEnum.IP_RATE_LIMIT + ip + ':' + routeKey;
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, windowSec);
    if (n > maxCount) return BaseResultData.fail(429);
};

/**
 * ip接口限流记录（计数已在守卫中原子完成，此处保留钩子以兼容中间件链）
 */
export async function IpRateLimitRecord(_ctx: Context) {
    return;
};