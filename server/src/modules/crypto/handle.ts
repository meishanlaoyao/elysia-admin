import config from '@/config';
import { BaseResultData } from '@/core/result';

/**
 * 获取请求加解密开关与 RSA 公钥（公开接口，明文返回）
 * @returns { mode, routes, publicKey }；mode 为 off 时 routes 为空数组、publicKey 为空字符串
 */
export async function getPublicKey() {
    const { mode, routes, publicKey } = config.crypto;
    const on = mode !== 'off';
    return BaseResultData.ok({
        mode,
        routes: on ? routes.map((r) => ({ method: Array.isArray(r.method) ? r.method : [r.method], url: r.url })) : [],
        publicKey: on ? publicKey.replace(/\\n/g, '\n') : '',
    });
};