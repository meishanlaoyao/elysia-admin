import { Context } from 'elysia';
import config from '@/config';
import { PublicRoutes } from '@/routes';
import { BaseResultData } from '@/common/result';
import { VerifyToken, ParseToken } from '@/utils/jwt';
import { CacheEnum } from '@/common/enum';
import { Get } from '@/client/redis';

let publicRouteSet: Set<string> | null = null;

function getPublicRouteSet() {
    if (!publicRouteSet) {
        publicRouteSet = new Set(PublicRoutes.map(({ route }) => `${route.method.toUpperCase()}:${config.app.prefix}${route.url}`));
    };
    return publicRouteSet;
};

/**
 * 身份验证守卫
 */
export async function AuthGuard(ctx: Context) {
    const routeKey = `${ctx.request.method}:${ctx.route}`;
    if (getPublicRouteSet().has(routeKey)) {
        (ctx as any).isPublic = true;
        return
    };
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