import { Elysia } from 'elysia'
import config from '@/config';
import { AuthGuard } from '@/guards/auth';
import { PermissionGuard } from '@/guards/permission';
import { IpBlackGuard } from '@/guards/ipblack';
import { ApiGuard } from '@/guards/api';
import { IpRateLimitGuard, IpRateLimitRecord } from '@/guards/ipratelimit';
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
    };
    if (isPrint && logMessage) logger.info(logMessage);
};

/**
 * 全局中间件   
 * @param ctx  
 */
export function GlobalMiddleware(app: Elysia) {
    app.onBeforeHandle(async (ctx) => {
        if (guard.ipBlacklist) await executeGuard(IpBlackGuard, ctx, '通过了黑名单IP守卫-->');
        if (guard.apiSwitch) await executeGuard(ApiGuard, ctx, '通过了API熔断守卫-->');
        await executeGuard(AnalysisRoute, ctx, '通过了路由分析器-->');
        await executeGuard(AuthGuard, ctx, '通过了认证守卫-->');
        await executeGuard(IpRateLimitGuard, ctx, '通过了ip限流守卫-->');
        await executeGuard(PermissionGuard, ctx, '通过了权限守卫-->');
    });
};

/**
 * 全局响应层
 */
export function GlobalResponseMiddleware(app: Elysia) {
    app.onRequest((ctx) => {
        (ctx as any).startTime = Date.now();
    });
    app.onAfterResponse(async (ctx) => {
        process.env.NODE_ENV !== 'production' && logger.logRequest(ctx);
        await AddOperLog(ctx);
        await IpRateLimitRecord(ctx);
    });
};