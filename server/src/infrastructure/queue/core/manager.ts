/**
 * 队列管理器
 * 单例，统一管理队列注册、Worker 注册、任务投递
 */
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@/shared/logger';
import type {
    QueueConfig,
    WorkerConfig,
    JobData,
    JobOptions,
    IQueueManager,
    RedisConnection,
} from './types';
import { createQueue } from './queue';
import { createWorker } from './worker';
import { getQueueEnvConfig } from '../config/env';

// 全局默认 Redis 连接（单例复用）
let _defaultConnection: Redis | null = null;

export function getRedisConnection(custom?: RedisConnection): Redis {
    if (custom) {
        return new Redis({ ...(custom as any), maxRetriesPerRequest: null });
    }
    if (!_defaultConnection) {
        const cfg = getQueueEnvConfig();
        _defaultConnection = new Redis({
            host: cfg.redis.host,
            port: cfg.redis.port,
            username: cfg.redis.username,
            password: cfg.redis.password,
            db: cfg.redis.db,
            maxRetriesPerRequest: null,
        });
    }
    return _defaultConnection;
};

class QueueManager implements IQueueManager {
    private queues: Map<string, Queue> = new Map();
    private workers: Map<string, Worker> = new Map();
    private appId: string;

    constructor() {
        this.appId = getQueueEnvConfig().appId;
    }

    /** 注册队列 */
    registerQueue(config: QueueConfig): Queue {
        if (this.queues.has(config.name)) return this.queues.get(config.name)!;
        const queue = createQueue(config, this.appId);
        this.queues.set(config.name, queue);
        logger.info(`✓ Queue "${config.name}" 注册成功`);
        return queue;
    }

    /** 注册 Worker */
    registerWorker(config: WorkerConfig): Worker {
        if (this.workers.has(config.queueName)) return this.workers.get(config.queueName)!;
        const worker = createWorker(config, this.appId);
        this.workers.set(config.queueName, worker);
        logger.info(`✓ Worker "${config.queueName}" 注册成功`);
        return worker;
    }

    getQueue(name: string): Queue | undefined {
        return this.queues.get(name);
    }

    getWorker(name: string): Worker | undefined {
        return this.workers.get(name);
    }

    /** 投递单个任务 */
    async addJob(queueName: string, data: JobData, options?: JobOptions): Promise<any> {
        const queue = this.getQueue(queueName);
        if (!queue) throw new Error(`队列 "${queueName}" 未注册`);
        return queue.add(queueName, data, options);
    }

    /** 批量投递任务 */
    async addBulkJobs(
        queueName: string,
        jobs: Array<{ data: JobData; options?: JobOptions }>
    ): Promise<any[]> {
        const queue = this.getQueue(queueName);
        if (!queue) throw new Error(`队列 "${queueName}" 未注册`);
        return queue.addBulk(jobs.map((j) => ({ name: queueName, data: j.data, opts: j.options })));
    }

    /** 获取所有队列（供 Bull Board 使用） */
    getAllQueues(): Queue[] {
        return Array.from(this.queues.values());
    }

    /** 优雅关闭所有 Worker 和队列 */
    async closeAll(): Promise<void> {
        for (const [name, worker] of this.workers) {
            await worker.close();
            logger.info(`[QueueManager] Worker "${name}" 已关闭`);
        }
        for (const [name, queue] of this.queues) {
            await queue.close();
            logger.info(`[QueueManager] Queue "${name}" 已关闭`);
        }
        if (_defaultConnection) {
            await _defaultConnection.quit();
            _defaultConnection = null;
        }
    }
};

export const queueManager = new QueueManager();
export default queueManager;