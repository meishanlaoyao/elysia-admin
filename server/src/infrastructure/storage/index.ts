import { FormatTime } from '@/shared/time';
import { GenerateUUID } from '@/shared/uuid';
import { COSProvider } from './providers/cos';
import { OSSProvider } from './providers/oss';
import { KodoProvider } from './providers/kodo';
import { RustFSProvider } from './providers/rustfs';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from './types';
export type StorageProviderType = 'COS' | 'OSS' | 'Kodo' | 'RustFS';

/**
 * 根据原始文件名生成短对象键：日期目录 + 18 位短 UUID + 扩展名
 * @param fileName 原始文件名（仅用于提取扩展名）
 * @returns 形如 `20260808/0197f2c8a1b34d5e9f.png`
 */
export function BuildObjectKey(fileName: string): string {
    const dateDir = FormatTime(Date.now(), 'YYYYMMDD');
    const shortId = GenerateUUID().slice(0, 18);
    const dotIndex = fileName.lastIndexOf('.');
    const ext = dotIndex > 0 ? fileName.slice(dotIndex).toLowerCase() : '';
    return `${dateDir}/${shortId}${ext}`;
};

/**
 * 存储服务工厂
 */
export class StorageFactory {
    /**
     * 创建存储提供者实例
     */
    static createProvider(type: StorageProviderType, config: StorageConfig): StorageProvider {
        switch (type) {
            case 'COS':
                return new COSProvider(config);
            case 'OSS':
                return new OSSProvider(config);
            case 'Kodo':
                return new KodoProvider(config);
            case 'RustFS':
                return new RustFSProvider(config);
            default:
                throw new Error(`Unsupported storage provider: ${type}`);
        };
    };
};

/**
 * 存储服务类
 */
export class StorageService {
    private provider: StorageProvider;

    constructor(type: StorageProviderType, config: StorageConfig) {
        this.provider = StorageFactory.createProvider(type, config);
    }

    /**
     * 获取预签名 URL
     * put：用短 UUID 重建对象键；get：透传原 key（读取已存在对象）
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        const method = options.method ?? 'get';
        const key = method === 'put' ? BuildObjectKey(options.key) : options.key;
        return this.provider.getPresignedUrl({ ...options, key, method });
    }
};

export * from './types';
export { COSProvider } from './providers/cos';
export { RustFSProvider } from './providers/rustfs';
export { OSSProvider } from './providers/oss';
export { KodoProvider } from './providers/kodo';