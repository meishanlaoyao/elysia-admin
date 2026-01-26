import { Context } from 'elysia';
import config from '@/config';
import { PublicRoutes } from '@/routes';
import { BaseResultData } from '@/common/result';
import { VerifyToken, ParseToken } from '@/utils/jwt';
import { CacheEnum } from '@/common/enum';
import { Get } from '@/client/redis';

/**
 * 身份验证
 */
export async function AuthGuard(ctx: Context) {
    try {
        const isPublic = PublicRoutes.some(({ route }) => config.app.prefix + route.url === ctx.route && route.method.toUpperCase() === ctx.request.method);
        if (isPublic) return null;
        const auth = ctx.headers['authorization'] || null;
        if (!auth) return BaseResultData.fail(401);
        const token = auth.split(' ')[1] || null;
        if (!token) return BaseResultData.fail(401);
        const isVerify = await VerifyToken('accessToken', token);
        if (!isVerify) return BaseResultData.fail(401);
        const payload = await ParseToken(token);
        const userId = payload?.userId || null;
        if (!userId) return BaseResultData.fail(401);
        const user = await Get(CacheEnum.ONLINE_USER + userId);
        if (!user) return BaseResultData.fail(401);
        (ctx as any).user = user;
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};