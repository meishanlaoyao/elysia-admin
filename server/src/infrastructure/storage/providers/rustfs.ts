import { FormatTime } from '@/shared/time';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from '../types';

/**
 * RustFS 存储服务提供者 (兼容 AWS S3)
 */
export class RustFSProvider implements StorageProvider {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
    }

    /**
     * 生成 RustFS 预签名 URL
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        let { key, expires = 60, method = 'GET' } = options;
        const time = Date.now();
        key = `${time}_${key}`;
        const timeStr = FormatTime(time, "YYYYMMDD");
        const objectKey = `${timeStr}/${key}`;
        const now = new Date();
        const amzDate = this.getAmzDate(now);
        const dateStamp = this.getDateStamp(now);
        let endpoint = this.config.endpoint;
        if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) endpoint = `http://${endpoint}`;
        const url = new URL(`${endpoint}/${this.config.bucket}/${objectKey}`);
        const credential = `${this.config.accessKey}/${dateStamp}/${this.config.region}/s3/aws4_request`;
        url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
        url.searchParams.set('X-Amz-Credential', credential);
        url.searchParams.set('X-Amz-Date', amzDate);
        url.searchParams.set('X-Amz-Expires', expires.toString());
        url.searchParams.set('X-Amz-SignedHeaders', 'host');
        const signature = await this.generateSignature({ method: method.toUpperCase(), url, amzDate, dateStamp, expires, });
        url.searchParams.set('X-Amz-Signature', signature);
        return url.toString();
    }

    /**
     * 生成 AWS Signature V4
     */
    private async generateSignature(params: {
        method: string;
        url: URL;
        amzDate: string;
        dateStamp: string;
        expires: number;
    }): Promise<string> {
        const { method, url, amzDate, dateStamp } = params;
        const canonicalUri = url.pathname;
        const canonicalQueryString = this.getCanonicalQueryString(url);
        const canonicalHeaders = `host:${url.host}\n`;
        const signedHeaders = 'host';
        const payloadHash = 'UNSIGNED-PAYLOAD';
        const canonicalRequest = [method, canonicalUri, canonicalQueryString, canonicalHeaders, signedHeaders, payloadHash].join('\n');
        const algorithm = 'AWS4-HMAC-SHA256';
        const credentialScope = `${dateStamp}/${this.config.region}/s3/aws4_request`;
        const canonicalRequestHash = await this.sha256(canonicalRequest);
        const stringToSign = [algorithm, amzDate, credentialScope, canonicalRequestHash].join('\n');
        const signingKey = await this.getSignatureKey(dateStamp);
        const signature = await this.hmacSha256(signingKey, stringToSign);
        return signature;
    }

    /**
     * 获取签名密钥
     */
    private async getSignatureKey(dateStamp: string): Promise<ArrayBuffer> {
        const kDate = await this.hmacSha256Raw(`AWS4${this.config.secretKey}`, dateStamp);
        const kRegion = await this.hmacSha256Raw(kDate, this.config.region);
        const kService = await this.hmacSha256Raw(kRegion, 's3');
        const kSigning = await this.hmacSha256Raw(kService, 'aws4_request');
        return kSigning;
    }

    /**
     * 获取规范化查询字符串
     */
    private getCanonicalQueryString(url: URL): string {
        const params = Array.from(url.searchParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        return params;
    }

    /**
     * SHA256 哈希（返回十六进制字符串）
     */
    private async sha256(data: string): Promise<string> {
        const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * HMAC-SHA256（返回十六进制字符串）
     */
    private async hmacSha256(key: ArrayBuffer | string, data: string): Promise<string> {
        const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key;
        const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
        return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * HMAC-SHA256（返回原始 ArrayBuffer）
     */
    private async hmacSha256Raw(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
        const keyData = typeof key === 'string' ? new TextEncoder().encode(key) : key;
        const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
    }

    /**
     * 获取 AMZ 日期格式 (YYYYMMDDTHHMMSSZ)
     */
    private getAmzDate(date: Date): string {
        return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    }

    /**
     * 获取日期戳格式 (YYYYMMDD)
     */
    private getDateStamp(date: Date): string {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
    }
};