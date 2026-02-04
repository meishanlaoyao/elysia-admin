import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { VerifyToken, ParseToken } from '@/utils/jwt';
import { CacheEnum } from '@/common/enum';
import { Get } from '@/client/redis';

/**
 * 身份验证守卫
 */
export async function AuthGuard(ctx: Context) {
    const routeInfo = (ctx as any).routeInfo;
    const isAuth = routeInfo?.meta?.isAuth || false;
    if (!isAuth) return;
    const auth = ctx.headers['authorization'];
    if (!auth) return BaseResultData.fail(401);
    const token = auth.split(' ')[1];
    if (!token) return BaseResultData.fail(401);
    const isVerify = await VerifyToken('accessToken', token);
    if (!isVerify) return BaseResultData.fail(401);
    const payload = await ParseToken(token);
    if (!payload?.userId) return BaseResultData.fail(401);
    const user = await Get(CacheEnum.ONLINE_USER + payload.userId);
    if (!user) return BaseResultData.fail(401);
    (ctx as any).user = user;
};