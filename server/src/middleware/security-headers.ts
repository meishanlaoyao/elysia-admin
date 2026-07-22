import type { Elysia } from 'elysia';
import config from '@/config';

/**
 * 全局安全响应头（onRequest 早写入，成功/错误路径均生效）
 */
export function SecurityHeadersMiddleware(app: Elysia) {
    app.onRequest((ctx) => {
        const h = ctx.set.headers;
        h['X-Content-Type-Options'] = 'nosniff';
        h['X-Frame-Options'] = 'DENY';
        h['Content-Security-Policy'] = "frame-ancestors 'none'";
        h['Referrer-Policy'] = 'no-referrer';
        if (config.app.hsts) {
            h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        }
    });
};