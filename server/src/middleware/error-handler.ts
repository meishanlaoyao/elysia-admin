import type { Elysia } from 'elysia';
import { BaseResultData } from '@/core/result';
import { logger } from '@/shared/logger';
import { getHttpStatus, getPgErrorCode, logServerError } from '@/shared/server-error';

/**
 * 配置全局错误处理器
 */
export function ConfigureErrorHandler(app: Elysia) {
    app.onError(({ code, error, set }) => {
        if (code === 'VALIDATION') {
            const errorMessage = (error as any).message || '验证失败';
            const on = typeof (error as any)?.on === 'string' ? (error as any).on : 'unknown';
            // 不 dump 整段 response/body；详情以 http.log 状态码为准
            const brief = errorMessage.length > 200
                ? errorMessage.slice(0, 200) + '…'
                : errorMessage;
            logger.warn(`请求验证失败 on=${on}: ${brief}`);
            if (errorMessage === '请先登陆后访问') {
                set.status = 401;
                return BaseResultData.fail(401, errorMessage);
            };
            return BaseResultData.fail(400, errorMessage);
        }
        else if (code === 'NOT_FOUND' || code == 404) {
            return BaseResultData.fail(404);
        }
        else if (typeof (code as unknown) === 'number') {
            logger.debug('onError: numeric code, pass through', { code: String(code) });
            return;
        };
        const httpStatus = getHttpStatus(error);
        if (httpStatus !== undefined) {
            set.status = httpStatus;
            const message = error instanceof Error ? error.message : String(error);
            return BaseResultData.fail(httpStatus, message);
        };
        if (getPgErrorCode(error) === '23505') {
            set.status = 409;
            return BaseResultData.fail(409, '数据已存在');
        };
        logServerError('未处理异常', error);
        set.status = 500;
        return BaseResultData.fail(500, '服务器内部错误');
    });
};