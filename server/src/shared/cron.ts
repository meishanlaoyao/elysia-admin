import { Cron } from 'croner';
import config from '@/config';
import { existsSync, openSync, closeSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logger } from './logger';
import type { ITask } from '@/core/task';

// 存储所有定时任务实例
const cronJobs = new Map<string, Cron>();

// 存储所有注册的任务函数
const taskRegistry = new Map<string, ITask>();

/**
 * 获取任务锁路径
 * 使用系统临时目录 + 项目ID，避免多项目冲突
 * @param jobName 任务名称
 * @returns 任务锁路径
 */
function getLockPath(jobName: string) {
    const appId = config.app.id.replace(/[^a-zA-Z0-9-_]/g, '_'); // 清理非法字符
    return join(tmpdir(), `${appId}_cron_${jobName}.lock`);
};

/**
 * 获取任务锁目录
 * @returns 任务锁目录路径
 */
export function GetCronLockDir(): string {
    return tmpdir();
};

/**
 * 清理所有任务锁文件（用于启动时清理僵尸锁）
 */
export function CleanAllLocks(): void {
    try {
        const fs = require('node:fs');
        const lockDir = tmpdir();
        const appId = config.app.id.replace(/[^a-zA-Z0-9-_]/g, '_');
        const lockPrefix = `${appId}_cron_`;
        const files = fs.readdirSync(lockDir);
        let cleanedCount = 0;
        for (const file of files) {
            if (file.startsWith(lockPrefix) && file.endsWith('.lock')) {
                const lockPath = join(lockDir, file);
                try {
                    unlinkSync(lockPath);
                    cleanedCount++;
                } catch (error: any) {
                    logger.warn(`清理锁文件失败: ${file}`, error);
                }
            };
        };
        if (cleanedCount > 0) logger.info(`已清理 ${cleanedCount} 个僵尸锁文件`);
    } catch (error: any) {
        logger.error('清理锁文件失败:', error);
    }
};

/**
 * 尝试获取任务锁
 * @param jobName 任务名称
 * @returns 是否成功获取锁
 */
function tryAcquireLock(jobName: string): boolean {
    const lockPath = getLockPath(jobName);
    try {
        if (existsSync(lockPath)) {
            const fs = require('node:fs');
            const stats = fs.statSync(lockPath);
            const lockAge = Date.now() - stats.mtimeMs;
            if (lockAge > 5 * 60 * 1000) {
                logger.warn(`检测到僵尸锁文件 [${jobName}]，已存在 ${Math.floor(lockAge / 1000)} 秒，将清理`);
                try {
                    unlinkSync(lockPath);
                } catch (error: any) {
                    logger.error(`清理僵尸锁失败 [${jobName}]:`, error);
                    return false;
                }
            } else {
                return false;
            };
        };
        const fd = openSync(lockPath, 'w');
        closeSync(fd);
        return true;
    } catch (error: any) {
        logger.error(`获取任务锁失败 [${jobName}]，锁文件: ${lockPath}`, error);
        return false;
    }
};

/**
 * 释放任务锁
 * @param jobName 任务名称
 */
function releaseLock(jobName: string): void {
    const lockPath = getLockPath(jobName);
    try {
        if (existsSync(lockPath)) unlinkSync(lockPath);
    } catch (error: any) {
        logger.error(`释放任务锁失败 [${jobName}]，锁文件: ${lockPath}`, error);
    }
};

/**
 * 注册任务
 * @param tasks 任务数组
 */
export function RegisterTasks(tasks: ITask[]): void {
    for (const task of tasks) {
        taskRegistry.set(task.taskName, task);
    };
};

/**
 * 获取已注册的任务
 * @param taskName 任务名称
 */
export function GetTask(taskName: string): ITask | undefined {
    return taskRegistry.get(taskName);
};

/**
 * 获取所有已注册的任务
 */
export function GetAllTasks(): Map<string, ITask> {
    return taskRegistry;
};

/**
 * 解析任务参数
 * @param jobArgs 任务参数（JSON字符串或数组）
 * @returns 解析后的参数数组
 */
function parseJobArgs(jobArgs?: string | any[]): any[] {
    if (!jobArgs) return [];
    if (Array.isArray(jobArgs)) return jobArgs;
    if (typeof jobArgs === 'string') {
        try {
            const parsed = JSON.parse(jobArgs);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error: any) {
            logger.error(`参数解析失败:`, error);
            return [];
        }
    };
    return [];
};

/**
 * 创建带单机防重的定时任务
 * @param jobName 任务名称（用于标识和防重）
 * @param cronExpression cron 表达式
 * @param taskName 任务名称（从注册表中查找）
 * @param taskArgs 任务参数（JSON字符串或数组）
 * @param options croner 选项
 * @returns Cron 实例
 */
export function CreateCronJob(
    jobName: string,
    cronExpression: string,
    taskName: string,
    taskArgs?: string | any[],
    options?: any
) {
    const task = taskRegistry.get(taskName);
    if (!task) throw new Error(`任务 [${taskName}] 未注册`);
    const parsedArgs = parseJobArgs(taskArgs);
    const cronJob = new Cron(cronExpression, options, async () => {
        if (!tryAcquireLock(jobName)) {
            logger.warn(`任务 [${jobName}] 正在执行中，跳过本次调度`);
            return;
        };
        try {
            logger.info(`任务 [${jobName}] 开始执行`);
            await task.taskFunc(...parsedArgs);
            logger.info(`任务 [${jobName}] 执行完成`);
        } catch (error: any) {
            logger.error(`任务 [${jobName}] 执行失败:`, error);
        } finally {
            releaseLock(jobName);
        }
    });
    cronJobs.set(jobName, cronJob);
    return cronJob;
};

/**
 * 动态添加定时任务
 * @param jobName 任务名称
 * @param cronExpression cron 表达式
 * @param taskName 任务名称（从注册表中查找）
 * @param taskArgs 任务参数（JSON字符串或数组）
 * @returns Cron 实例
 */
export function AddCronJob(
    jobName: string,
    cronExpression: string,
    taskName: string,
    taskArgs?: string | any[]
): Cron {
    if (cronJobs.has(jobName)) {
        logger.warn(`任务 [${jobName}] 已存在，将先停止旧任务`);
        RemoveCronJob(jobName);
    };
    const parsedArgs = parseJobArgs(taskArgs);
    const argsLog = parsedArgs.length ? `，参数: ${JSON.stringify(parsedArgs)}` : '';
    logger.info(`添加定时任务 [${jobName}]，cron: ${cronExpression}，任务: ${taskName}${argsLog}`);
    return CreateCronJob(jobName, cronExpression, taskName, taskArgs);
};

/**
 * 移除定时任务
 * @param jobName 任务名称
 */
export function RemoveCronJob(jobName: string): boolean {
    const cronJob = cronJobs.get(jobName);
    if (!cronJob) {
        logger.warn(`任务 [${jobName}] 不存在`);
        return false;
    };
    cronJob.stop();
    cronJobs.delete(jobName);
    releaseLock(jobName);
    logger.info(`已移除定时任务 [${jobName}]`);
    return true;
};

/**
 * 获取所有定时任务
 */
export function GetAllCronJobs(): Map<string, Cron> {
    return cronJobs;
};

/**
 * 获取指定定时任务
 * @param jobName 任务名称
 */
export function GetCronJob(jobName: string): Cron | undefined {
    return cronJobs.get(jobName);
};