/** 队列系统核心类型定义 */
import type { Queue, Worker, Job, QueueOptions, WorkerOptions, ConnectionOptions } from 'bullmq';

/** 连接 */
export type RedisConnection = ConnectionOptions;


/** 队列 */
export interface QueueConfig {
    /** 队列唯一名称（会自动加 appId 前缀） */
    name: string;
    description?: string;
    /** 自定义 Redis 连接，不传则使用默认 */
    connection?: RedisConnection;
    options?: Omit<QueueOptions, 'connection'>;
};

/** Worker */
export type JobProcessor = (job: Job) => Promise<any>;

export interface WorkerConfig {
    queueName: string;
    /**
     * processor 函数 或 已编译的 .js 文件绝对路径（沙箱模式）
     * 沙箱模式下每个任务在独立子进程执行，适合 CPU 密集型任务
     */
    processor: JobProcessor | string;
    /** 沙箱模式：使用 Worker Threads 替代 child_process（更轻量） */
    useWorkerThreads?: boolean;
    options?: Omit<WorkerOptions, 'connection'>;
};

/** Job */
export type JobData = Record<string, any>;

export interface JobOptions {
    delay?: number;
    priority?: number;
    attempts?: number;
    backoff?: number | { type: string; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    jobId?: string;
};

/** 限流 */
export interface RateLimitConfig {
    /** 时间窗口内最大任务数 */
    max: number;
    /** 时间窗口（毫秒） */
    duration: number;
};

/** 重试 */
export type RetryStrategy = 'fixed' | 'exponential';

export interface RetryConfig {
    attempts: number;
    strategy: RetryStrategy;
    /** fixed: 固定延迟(ms)；exponential: 初始延迟(ms) */
    delay: number;
};

/** 调度 */
export interface ScheduleConfig {
    /** cron 表达式，例如 '0 * * * *' */
    cron: string;
    /** 任务数据 */
    data?: JobData;
    /** 任务选项 */
    options?: JobOptions;
};

/** Manager */
export interface IQueueManager {
    registerQueue(config: QueueConfig): Queue;
    registerWorker(config: WorkerConfig): Worker;
    getQueue(name: string): Queue | undefined;
    getWorker(name: string): Worker | undefined;
    addJob(queueName: string, data: JobData, options?: JobOptions): Promise<Job>;
    addBulkJobs(queueName: string, jobs: Array<{ data: JobData; options?: JobOptions }>): Promise<Job[]>;
    getAllQueues(): Queue[];
    closeAll(): Promise<void>;
};