import { Elysia } from 'elysia'
import config from '@/config';
import { AuthGuard } from '@/guards/auth';
import { PermissionGuard } from '@/guards/permission';
import { IpBlackGuard } from '@/guards/ipblack';
import { ApiGuard } from '@/guards/api';
import { AnalysisRoute } from './analysis';
import { AddOperLog } from '@/modules/system-oper-log/handle';
import { logger } from '@/shared/logger';

const { guard } = config;
const isPrint = false; // 是否打印日志

/**
 * 执行守卫并处理错误
 */
async function executeGuard(guardFn: Function, ctx: any, logMessage?: string) {
    const result = await guardFn(ctx);
    if (result) {
        ctx.set.status = result.code;
        throw result;
    }
    if (isPrint && logMessage) logger.info(logMessage);
};

/**
 * 全局中间件   
 * @param ctx  
 */
export function GlobalMiddleware(app: Elysia) {
    app.onBeforeHandle(async (ctx) => {
        if (guard.ipBlacklist) await executeGuard(IpBlackGuard, ctx, '通过了黑名单IP拦截器-->');
        if (guard.apiSwitch) await executeGuard(ApiGuard, ctx, '通过了API拦截器-->');
        await executeGuard(AnalysisRoute, ctx, '通过了路由分析拦截器-->');
        await executeGuard(AuthGuard, ctx, '通过了认证拦截器-->');
        await executeGuard(PermissionGuard, ctx, '通过了权限拦截器-->');
    });
};

/**
 * 全局响应层
 */
export function GlobalResponseMiddleware(app: Elysia) {
    app.onRequest((ctx) => {
        (ctx as any).startTime = Date.now();
    });
    app.onAfterResponse((ctx) => {
        process.env.NODE_ENV !== 'production' && logger.logRequest(ctx);
        AddOperLog(ctx);
    });
};