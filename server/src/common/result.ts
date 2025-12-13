import { ResCode } from '@/utils/rescode';

/**
 * 基础结果数据
 */
export const BaseResultData = {
    ok: (data: any = null) => ({
        code: 200,
        msg: '操作成功',
        data,
    }),
    fail: (code: number = 500, msg?: any) => {
        let isStr = typeof msg === 'string';
        if (code == 500) {
            console.error("BaseResultData.fail: ", isStr ? msg : JSON.stringify(msg));
        };
        return {
            code,
            msg: isStr ? msg : ResCode[code as keyof typeof ResCode],
            data: null,
        }
    },
};