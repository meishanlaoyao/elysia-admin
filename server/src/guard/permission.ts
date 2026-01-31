import { Context } from 'elysia';
import config from '@/config';
import { AuthRoutes } from '@/routes'
import { BaseResultData } from '@/common/result';

const prefix = config.app.prefix;

/**
 * 权限校验
 */
export async function PermissionGuard(ctx: Context) {
    if ((ctx as any).isPublic) return;
    const route = AuthRoutes.find(({ route }) => prefix + route.url === ctx.route && route.method.toUpperCase() === ctx.request.method);
    if (!route) return BaseResultData.fail(404);
    const perm = route.route.meta?.permission || null;
    if (!perm) return;
    const userPermissions = (ctx as any).user?.permissions as string[] || [];
    if (!userPermissions.includes(perm)) return BaseResultData.fail(403);
    return;
};
