export interface StorageConfig {
    /** 存储区域，如 'ap-shanghai' */
    region: string;
    /** 存储服务端地址，如 'cos.ap-shanghai.myqcloud.com' */
    endpoint: string;
    /** 存储桶名称 */
    bucket: string;
    /** 访问密钥 ID */
    accessKey: string;
    /** 访问密钥 */
    secretKey: string;
};

export interface PresignedUrlOptions {
    /** 对象键(文件路径)，如 'images/avatar.jpg' */
    key: string;
    /** 链接有效期(秒)，默认 1分钟 */
    expires?: number;
    /** HTTP 方法，get: 访问/读取文件(私有桶必需) | put: 上传文件 */
    method?: 'get' | 'put';
};

/** 存储服务提供者接口 */
export interface StorageProvider {
    /**
     * 生成预签名 URL
     */
    getPresignedUrl(options: PresignedUrlOptions): Promise<string>;
};