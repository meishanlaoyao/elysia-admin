import { Cron } from 'croner';
import { logger } from './logger';
import { RedisLock } from '@/core/database/redis-lock';
import type { ITask } from '@/types/task';

// 存储所有定时任务实例
const cronJobs = new Map<string, Cron>();

// 存储所有注册的任务函数
const taskRegistry = new Map<string, ITask>();

/**
 * 注册任务
 */
export function RegisterTasks(tasks: ITask[]): void {
    for (const task of tasks) {
        taskRegistry.set(task.taskName, task);
    };
};

/**
 * 获取已注册的任务
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
 * 计算cron表达式的下次执行间隔（秒）
 */
function getNextInterval(cronExpression: string): number {
    try {
        const cron = new Cron(cronExpression);
        const next1 = cron.nextRun();
        const next2 = cron.nextRun(next1);
        if (next1 && next2) {
            const interval = Math.floor((next2.getTime() - next1.getTime()) / 1000);
            return Math.max(interval - 5, 10); // 至少保持10秒，最多到下次执行前5秒
        };
    } catch (error) {
        // 解析失败，使用默认值
    }
    return 55; // 默认55秒（适用于每分钟执行的任务）
};

/**
 * 创建带 Redis 分布式锁的定时任务
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
    const lockTTL = getNextInterval(cronExpression);
    const cronJob = new Cron(cronExpression, options, async () => {
        const lock = new RedisLock(jobName, lockTTL);
        const acquired = await lock.acquire();
        if (!acquired) {
            logger.warn(`任务 [${jobName}] 已被其他实例锁定，跳过执行`);
            return;
        };
        try {
            logger.info(`任务 [${jobName}] 开始执行`);
            await task.taskFunc(...parsedArgs);
            logger.info(`任务 [${jobName}] 执行完成`);
        } catch (error: any) {
            logger.error(`任务 [${jobName}] 执行失败:`, error);
            await lock.release();
        }
    });
    cronJobs.set(jobName, cronJob);
    return cronJob;
};

/**
 * 动态添加定时任务
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
    logger.info(`添加定时任务 [${jobName}]，cron: ${cronExpression}${argsLog}`);
    return CreateCronJob(jobName, cronExpression, taskName, taskArgs);
};

/**
 * 移除定时任务
 */
export function RemoveCronJob(jobName: string): boolean {
    const cronJob = cronJobs.get(jobName);
    if (!cronJob) {
        logger.warn(`任务 [${jobName}] 不存在`);
        return false;
    };
    cronJob.stop();
    cronJobs.delete(jobName);
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
 */
export function GetCronJob(jobName: string): Cron | undefined {
    return cronJobs.get(jobName);
};

/**
 * 优雅关闭：停止所有定时任务
 */
export function StopAllCronJobs(): void {
    logger.info(`正在停止 ${cronJobs.size} 个定时任务...`);
    for (const [jobName, cronJob] of cronJobs.entries()) {
        cronJob.stop();
        logger.info(`已停止定时任务 [${jobName}]`);
    };
    cronJobs.clear();
};