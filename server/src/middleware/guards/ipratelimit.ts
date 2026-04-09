import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { GetClientIp } from '@/shared/ip';
import { CacheEnum } from '@/constants/enum';
import { Get, Set } from '@/core/database/redis';

/**
 * ip接口限流守卫
 */
export async function IpRateLimitGuard(ctx: Context) {
    const limitInfo = (ctx as any).routeInfo?.meta?.ipRateLimit;
    if (!limitInfo) return;
    const [time, count] = limitInfo.split(':');
    const routeKey = (ctx as any).routeKey;
    const ip = GetClientIp(ctx);
    const key = CacheEnum.IP_RATE_LIMIT + ip + ':' + routeKey;
    let oldCountStr = await Get(key);
    let oldCount = Number(oldCountStr || 0);
    if (oldCount >= Number(count)) return BaseResultData.fail(429);
    (ctx as any).routeInfo.meta.ipRateLimitInfo = {
        nowCount: oldCount,
        time: Number(time),
        key,
    };
};

/**
 * ip接口限流记录
 */
export async function IpRateLimitRecord(ctx: Context) {
    const limitInfo = (ctx as any).routeInfo?.meta?.ipRateLimit;
    if (!limitInfo) return;
    const response = (ctx as any).response;
    const status = response?.code === 200;
    if (!status) return;
    const { nowCount, time, key } = (ctx as any).routeInfo?.meta?.ipRateLimitInfo;
    if (!nowCount) {
        await Set(key, 1, time);
    } else {
        await Set(key, nowCount + 1)
    };
};