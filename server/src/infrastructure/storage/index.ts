import { COSProvider } from './providers/cos';
import type { StorageConfig, PresignedUrlOptions } from './types';

export class StorageService {
    private provider: COSProvider;

    constructor(config: StorageConfig) {
        this.provider = new COSProvider(config);
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