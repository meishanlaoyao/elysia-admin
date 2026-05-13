import { ResCode } from '@/shared/rescode';
import { logger } from '@/shared/logger';

/**
 * 基础结果数据
 */
export const BaseResultData = {
    ok: (data: any = null, msg: string = '操作成功') => ({
        code: 200,
        msg,
        data,
    }),
    fail: (code: number = 500, msg?: any) => {
        const isStr = typeof msg === 'string';
        if (code === 500) {
            const detail = isStr ? msg : msg == null ? String(msg) : msg instanceof Error ? `${msg.name}: ${msg.message}` : (() => {
                try {
                    return JSON.stringify(msg, Object.getOwnPropertyNames(Object(msg)));
                } catch {
                    return String(msg);
                }
            })();
            logger.error('服务端错误: ' + detail);
        };
        return {
            code,
            msg: isStr ? msg : (msg?.message || ResCode[code as keyof typeof ResCode]),
            data: null,
        };
    },
};