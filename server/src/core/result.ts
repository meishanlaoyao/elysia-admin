import { ResCode } from '@/shared/rescode';

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
        let isStr = typeof msg === 'string';
        if (code === 500) {
            console.error("服务端错误: ", isStr ? msg : JSON.stringify(msg));
        };
        return {
            code,
            msg: isStr ? msg : ResCode[code as keyof typeof ResCode],
            data: null,
        }
    },
};