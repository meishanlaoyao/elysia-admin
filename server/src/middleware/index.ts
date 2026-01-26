import { Elysia } from 'elysia'
import config from '@/config';
import { AuthGuard } from '@/guard/auth';
import { PermissionGuard } from '@/guard/permission';
import { IpBlackGuard } from '@/guard/ipblack';
import { ApiGuard } from '@/guard/api';

const { guard } = config;
const isPrint = false; // 是否打印日志

/**
 * 全局中间件   
 * @param ctx  
 */
export function GlobalMiddleware(app: Elysia) {
    if (guard.ipBlacklist) {
        app.derive(async (ctx) => {
            const res = await IpBlackGuard(ctx)
            if (res) {
                ctx.set.status = res.code;
                throw res;
            };
            isPrint && console.log('通过了黑名单IP拦截器-->');
        });
    };
    if (guard.apiSwitch) {
        app.derive(async (ctx) => {
            const res = await ApiGuard(ctx)
            if (res) {
                ctx.set.status = res.code;
                throw res;
            };
            isPrint && console.log('通过了API拦截器-->');
        })
    };
    app.derive(async (ctx) => {
        const res = await AuthGuard(ctx);
        if (res) {
            ctx.set.status = res.code;
            throw res;
        };
        isPrint && console.log('通过了认证拦截器-->');
    });
    app.derive(async (ctx) => {
        await PermissionGuard(ctx);
        isPrint && console.log('通过了权限拦截器-->');
    });
};