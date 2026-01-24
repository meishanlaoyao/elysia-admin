import { Context } from 'elysia'

/**
 * 身份验证
 */
export async function AuthGuard(ctx: Context) {
    const auth = ctx.headers['authorization'] || null;
};