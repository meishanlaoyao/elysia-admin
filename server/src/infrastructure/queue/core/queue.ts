/**
 * Queue 抽象层
 * 封装 BullMQ Queue 的创建逻辑
 */
import { Queue } from 'bullmq';
import type { QueueConfig } from './types';
import { getRedisConnection } from './manager';

/**
 * 创建一个 BullMQ Queue 实例
 * Redis 键前缀使用 appId，队列名保持短名，避免多应用冲突
 */
export function createQueue(config: QueueConfig, appId: string): Queue {
    const { name, connection, options } = config;
    const conn = connection ? getRedisConnection(connection) : getRedisConnection();
    return new Queue(name, {
        connection: conn,
        prefix: appId,
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 200,
        },
        ...options,
    });
};