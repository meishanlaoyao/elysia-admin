/**
 * 从应用配置读取队列所需的环境变量
 * 统一在这里取值，避免各处硬编码
 */
import appConfig from '@/config';

export interface QueueEnvConfig {
    appId: string;
    appEnv: string;
    redis: {
        host: string;
        port: number;
        username: string;
        password: string;
        db: number;
    };
};

export function getQueueEnvConfig(): QueueEnvConfig {
    return {
        appId: appConfig.app.id,
        appEnv: process.env.NODE_ENV || 'development',
        redis: {
            host: appConfig.redis.host,
            port: appConfig.redis.port,
            username: appConfig.redis.username,
            password: appConfig.redis.password,
            db: appConfig.redis.db,
        },
    };
};