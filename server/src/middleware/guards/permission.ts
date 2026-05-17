import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';

/**
 * 权限校验
 */
export async function PermissionGuard(ctx: AppContext) {
    const routeInfo = ctx?.routeInfo;
    const isAuth = routeInfo?.meta?.isAuth || false;
    if (!isAuth) return;
    const perm = routeInfo?.meta?.permission || null;
    if (!perm) return;
    const userPermissions = ctx?.user?.permissions as string[] || [];
    if (!userPermissions.includes(perm)) return BaseResultData.fail(403);
    return;
};