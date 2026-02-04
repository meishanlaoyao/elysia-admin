import { Elysia } from 'elysia'
import config from '@/config';
import { AuthGuard } from '@/guard/auth';
import { PermissionGuard } from '@/guard/permission';
import { IpBlackGuard } from '@/guard/ipblack';
import { ApiGuard } from '@/guard/api';
import { AnalysisRoute } from './analysis';
import { AddOperLog } from '@/routes/system-oper-log/handle';

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
    if (isPrint && logMessage) console.log(logMessage);
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
    app.onAfterResponse((ctx) => {
        AddOperLog(ctx);
    });
};