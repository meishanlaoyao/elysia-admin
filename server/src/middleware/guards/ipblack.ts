import type { AppContext } from '@/types/app-context';
import { GetClientIp } from '@/shared/ip';
import { BaseResultData } from '@/core/result';
import { GetCacheIpBlackList } from '@/modules/system-ip-black/handle';

/**
 * ip黑名单
 */
export async function IpBlackGuard(ctx: AppContext) {
    const clientIp = GetClientIp(ctx);
    ctx.ip = clientIp;
    const blackList = await GetCacheIpBlackList();
    if (blackList.some(item => item.ipAddress === clientIp)) return BaseResultData.fail(403);
};