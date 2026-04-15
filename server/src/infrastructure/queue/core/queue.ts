/**
 * Queue 抽象层
 * 封装 BullMQ Queue 的创建逻辑
 */
import { Queue } from 'bullmq';
import type { QueueConfig } from './types';
import { getRedisConnection } from './manager';

/**
 * 创建一个 BullMQ Queue 实例
 * 队列名会自动加上 appId 前缀，避免多应用冲突
 */
export function createQueue(config: QueueConfig, appId: string): Queue {
    const { name, connection, options } = config;
    const conn = connection ? getRedisConnection(connection) : getRedisConnection();
    return new Queue(`${appId}-${name}`, {
        connection: conn,
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 200,
        },
        ...options,
    });
};