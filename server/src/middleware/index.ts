import { Elysia } from 'elysia'
import { AuthGuard } from '@/guard/auth';
import { PermissionGuard } from '@/guard/permission';
import { BlackGuard } from '@/guard/black';
import { ApiGuard } from '@/guard/api';

/**
 * 全局中间件   
 * @param ctx  
 */
export function GlobalMiddleware(app: Elysia) {
    app.derive(async (ctx) => {
        BlackGuard(ctx);
        ApiGuard(ctx);
        AuthGuard(ctx);
        PermissionGuard(ctx);
        return {}
    });
};