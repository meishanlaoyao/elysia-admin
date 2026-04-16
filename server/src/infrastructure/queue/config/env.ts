/**
 * 从应用配置读取队列所需的环境变量
 * 统一在这里取值，避免各处硬编码
 */
import { resolve } from 'node:path';
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

/**
 * 获取 processor 文件的绝对路径
 */
export function getProcessorPath(name: string): string {
    const appEnv = process.env.NODE_ENV || 'development';
    const dir = appEnv === 'production'
        ? resolve(process.cwd(), 'processors')
        : resolve(process.cwd(), 'dist', 'processors');
    return resolve(dir, `${name}.js`);
};
