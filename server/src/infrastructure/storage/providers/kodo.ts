import { FormatTime } from '@/shared/time';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from '../types';

/**
 * 七牛云 Kodo 存储服务提供者
 */
export class KodoProvider implements StorageProvider {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    /**
     * 生成 Kodo 预签名 URL
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        let { key, expires = 60, method = 'GET' } = options;
        const time = Date.now();
        key = `${time}_${key}`;
        const timeStr = FormatTime(time, "YYYYMMDD");
        const objectKey = `${timeStr}/${key}`;
        const deadline = Math.floor(Date.now() / 1000) + expires;
        const baseUrl = `${this.config.endpoint}/${objectKey}`;
        const token = await this.generateToken(baseUrl, deadline);
        const url = new URL(baseUrl);
        url.searchParams.set('e', deadline.toString());
        url.searchParams.set('token', token);
        return url.toString();
    }

    /**
     * 生成七牛云签名 Token
     */
    private async generateToken(url: string, deadline: number): Promise<string> {
        const urlObj = new URL(url);
        const path = urlObj.pathname + urlObj.search;
        const stringToSign = `${path}\n`;
        const sign = await this.hmacSha1(this.config.secretKey, stringToSign);
        const token = `${this.config.accessKey}:${sign}`;
        return token;
    }

    /**
     * HMAC-SHA1 并 URL Safe Base64 编码
     */
    private async hmacSha1(key: string, data: string): Promise<string> {
        const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
        let base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        return base64;
    }
};