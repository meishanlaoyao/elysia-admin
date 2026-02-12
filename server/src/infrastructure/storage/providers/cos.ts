import { FormatTime } from '@/shared/time';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from '../types';

/**
 * COS 存储服务提供者
 */
export class COSProvider implements StorageProvider {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    /**
     * 生成 COS 预签名 URL
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        let { key, expires = 60, method = 'get' } = options;
        const time = Date.now();
        key = `${time}_${key}`;
        const timeStr = FormatTime(time, "YYYYMMDD");
        const now = Math.floor(time / 1000);
        const expireTime = now + expires;
        const path = `/${timeStr}/${key}`;
        const signature = await this.generateSignature({ method, path, expireTime, });
        const url = new URL(`https://${this.config.bucket}.${this.config.endpoint}`);
        url.pathname = path;
        url.searchParams.set('q-sign-algorithm', 'sha1');
        url.searchParams.set('q-ak', this.config.accessKey);
        url.searchParams.set('q-sign-time', `${now};${expireTime}`);
        url.searchParams.set('q-key-time', `${now};${expireTime}`);
        url.searchParams.set('q-header-list', '');
        url.searchParams.set('q-url-param-list', '');
        url.searchParams.set('q-signature', signature);
        return url.toString();
    }

    /**
     * 生成签名
     */
    private async generateSignature(params: {
        method: string;
        path: string;
        expireTime: number;
    }): Promise<string> {
        const { method, path, expireTime } = params;
        const now = Math.floor(Date.now() / 1000);
        const keyTime = `${now};${expireTime}`;
        const signKey = await this.hmacSha1(this.config.secretKey, keyTime);
        const httpString = `${method.toLowerCase()}\n${path}\n\n\n`;
        const httpStringSha1 = await this.sha1(httpString);
        const stringToSign = `sha1\n${keyTime}\n${httpStringSha1}\n`;
        const signature = await this.hmacSha1(signKey, stringToSign);
        return signature;
    }

    /**
     * SHA1 哈希
     */
    private async sha1(data: string): Promise<string> {
        const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(data));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * HMAC-SHA1
     */
    private async hmacSha1(key: string, data: string): Promise<string> {
        const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
        return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
};