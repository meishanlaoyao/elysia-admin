/**
 * Worker 抽象层
 *
 * 支持两种模式：
 * 1. 函数模式：processor 是函数，所有任务共享当前进程事件循环（I/O 密集型适用）
 * 2. 沙箱模式：processor 是已编译的 .js 文件路径，BullMQ 用 child_process.spawn
 *    为每个任务启动独立子进程（CPU 密集型适用，不会 stall jobs）
 */
import { Worker } from 'bullmq';
import { resolve } from 'node:path';
import type { WorkerConfig } from './types';
import { getRedisConnection } from './manager';
import { getQueueEnvConfig } from '../config/env';

export function createWorker(config: WorkerConfig, appId: string): Worker {
    const { queueName, processor, useWorkerThreads, options } = config;
    const isSandboxed = typeof processor === 'string';
    if (isSandboxed) {
        const appEnv = getQueueEnvConfig().appEnv;
        const yamlDir = appEnv === 'production'
            ? resolve(process.cwd(), 'dist')
            : resolve(process.cwd(), 'src', 'config');
        const configPath = resolve(yamlDir, `${appEnv}.yaml`);
        process.env.CONFIG_PATH = configPath;
    };
    const worker = new Worker(
        `${appId}-${queueName}`,
        processor as any,
        {
            connection: getRedisConnection(),
            useWorkerThreads: useWorkerThreads ?? false,
            ...options,
        }
    );
    worker.on('completed', () => { });
    worker.on('failed', () => { });
    worker.on('error', () => { });
    return worker;
};