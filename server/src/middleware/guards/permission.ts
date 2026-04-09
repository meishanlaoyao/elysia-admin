import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';

/**
 * 权限校验
 */
export async function PermissionGuard(ctx: Context) {
    const routeInfo = (ctx as any).routeInfo;
    const isAuth = routeInfo?.meta?.isAuth || false;
    if (!isAuth) return;
    const perm = routeInfo?.meta?.isAuth?.permission || null;
    if (!perm) return;
    const userPermissions = (ctx as any).user?.permissions as string[] || [];
    if (!userPermissions.includes(perm)) return BaseResultData.fail(403);
    return;
};