import { Context } from 'elysia';
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
};

/**
 * ip接口限流记录
 */
export async function IpRateLimitRecord(ctx: Context) {
    const limitInfo = (ctx as any).routeInfo?.meta?.ipRateLimit;
    if (!limitInfo) return;
    const ip = GetClientIp(ctx);
};