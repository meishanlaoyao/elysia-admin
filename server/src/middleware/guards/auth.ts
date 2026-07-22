import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { VerifyToken } from '@/shared/jwt';
import { CacheEnum } from '@/constants/enum';
import { Get } from '@/core/database/redis';
import { GetOnlineUserL1, SetOnlineUserL1 } from '@/shared/online-user-l1';
import { GetOrLoadUserPermissions } from '@/modules/system-role/handle';

/**
 * 身份验证守卫
 */
export async function AuthGuard(ctx: AppContext) {
    const routeInfo = ctx?.routeInfo;
    const isAuth = routeInfo?.meta?.isAuth || false;
    if (!isAuth) return;
    const auth = ctx.headers['authorization'];
    if (!auth) return BaseResultData.fail(401);
    const token = auth.split(' ')[1];
    if (!token) return BaseResultData.fail(401);
    const payload = await VerifyToken('accessToken', token);
    if (!payload?.userId) return BaseResultData.fail(401);
    let user = GetOnlineUserL1(payload.userId);
    if (!user) {
        user = await Get(CacheEnum.ONLINE_USER + payload.userId);
        if (!user) return BaseResultData.fail(401);
        user.permissions = await GetOrLoadUserPermissions(payload.userId);
        SetOnlineUserL1(payload.userId, user);
    };
    ctx.user = user;
};