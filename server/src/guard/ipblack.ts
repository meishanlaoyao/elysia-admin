import { Context } from 'elysia';
import { GetClientIp } from '@/utils/ip';
import { BaseResultData } from '@/common/result';
import { GetCacheIpBlackList } from '@/routes/system-ip-black/handle';

/**
 * ip黑名单
 */
export async function IpBlackGuard(ctx: Context) {
    const clientIp = GetClientIp(ctx?.request, ctx?.server);
    const blackList = await GetCacheIpBlackList();
    if (blackList.some(item => item.ipAddress === clientIp)) return BaseResultData.fail(403);
};