import { COSProvider } from './providers/cos';
import { OSSProvider } from './providers/oss';
import { KodoProvider } from './providers/kodo';
import { RustFSProvider } from './providers/rustfs';
import type { StorageConfig, PresignedUrlOptions, StorageProvider } from './types';
export type StorageProviderType = 'COS' | 'OSS' | 'Kodo' | 'RustFS';

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
     */
    async getPresignedUrl(options: PresignedUrlOptions): Promise<string> {
        return this.provider.getPresignedUrl(options);
    }
};

export * from './types';
export { COSProvider } from './providers/cos';
export { RustFSProvider } from './providers/rustfs';
export { OSSProvider } from './providers/oss';
export { KodoProvider } from './providers/kodo';