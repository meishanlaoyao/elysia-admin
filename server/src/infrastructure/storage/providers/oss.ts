import { FormatTime } from '@/shared/time';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from '../types';

/**
 * 阿里云 OSS 存储服务提供者
 */
export class OSSProvider implements StorageProvider {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    /**
     * 生成 OSS 预签名 URL
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        let { key, expires = 60, method = 'GET' } = options;
        const time = Date.now();
        key = `${time}_${key}`;
        const timeStr = FormatTime(time, "YYYYMMDD");
        const objectKey = `${timeStr}/${key}`;
        const expireTime = Math.floor(Date.now() / 1000) + expires;
        const url = new URL(`https://${this.config.bucket}.${this.config.endpoint}`);
        url.pathname = `/${objectKey}`;
        url.searchParams.set('OSSAccessKeyId', this.config.accessKey);
        url.searchParams.set('Expires', expireTime.toString());
        const signature = await this.generateSignature({ method: method.toUpperCase(), bucket: this.config.bucket, objectKey, expireTime, });
        url.searchParams.set('Signature', signature);
        return url.toString();
    }

    /**
     * 生成签名
     */
    private async generateSignature(params: {
        method: string;
        bucket: string;
        objectKey: string;
        expireTime: number;
    }): Promise<string> {
        const { method, bucket, objectKey, expireTime } = params;
        const stringToSign = `${method}\n\n\n${expireTime}\n/${bucket}/${objectKey}`;
        const signature = await this.hmacSha1(this.config.secretKey, stringToSign);
        return signature;
    }

    /**
     * HMAC-SHA1 并 Base64 编码
     */
    private async hmacSha1(key: string, data: string): Promise<string> {
        const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
        const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
        return base64;
    }
};