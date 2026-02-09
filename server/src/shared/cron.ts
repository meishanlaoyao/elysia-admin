import { Cron } from 'croner';
import { existsSync, openSync, closeSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from './logger';

// 存储所有定时任务实例
const cronJobs = new Map<string, Cron>();

/**
 * 获取任务锁路径
 * @param jobName 任务名称
 * @returns 任务锁路径
 */
function getLockPath(jobName: string) {
    return join(process.cwd(), 'job', `cron_${jobName}.lock`);
}

/**
 * 尝试获取任务锁
 * @param jobName 任务名称
 * @returns 是否成功获取锁
 */
function tryAcquireLock(jobName: string): boolean {
    const lockPath = getLockPath(jobName);
    const lockDir = join(process.cwd(), 'job');
    try {
        if (!existsSync(lockDir)) mkdirSync(lockDir, { recursive: true });
        if (existsSync(lockPath)) return false;
        const fd = openSync(lockPath, 'w');
        closeSync(fd);
        return true;
    } catch (error: any) {
        logger.error(`获取任务锁失败 [${jobName}]:`, error);
        return false;
    }
}

/**
 * 释放任务锁
 * @param jobName 任务名称
 */
function releaseLock(jobName: string): void {
    const lockPath = getLockPath(jobName);
    try {
        if (existsSync(lockPath)) unlinkSync(lockPath);
    } catch (error: any) {
        logger.error(`释放任务锁失败 [${jobName}]:`, error);
    }
}

/**
 * 解析任务路径并执行
 * 格式: monitor-job.task.jobDemo('乔治')
 * @param taskPath 任务路径字符串
 */
async function parseAndExecuteTask(taskPath: string): Promise<void> {
    try {
        // 解析函数调用: functionName(args)
        const match = taskPath.match(/^(.+?)\.([^.]+)\.([^(]+)\((.*)\)$/);
        if (!match) {
            throw new Error(`任务路径格式错误: ${taskPath}`);
        }

        const [, moduleName, fileName, functionName, argsStr] = match;

        // 构建模块路径
        const modulePath = join(process.cwd(), 'src', 'modules', moduleName, `${fileName}.ts`);

        // 动态导入模块
        const module = await import(modulePath);
        const taskFunction = module[functionName];

        if (typeof taskFunction !== 'function') {
            throw new Error(`函数 ${functionName} 不存在于 ${modulePath}`);
        }

        // 解析参数
        let args: any[] = [];
        if (argsStr.trim()) {
            // 简单的参数解析，支持字符串和数字
            args = argsStr.split(',').map(arg => {
                arg = arg.trim();
                // 字符串参数（单引号或双引号）
                if ((arg.startsWith("'") && arg.endsWith("'")) ||
                    (arg.startsWith('"') && arg.endsWith('"'))) {
                    return arg.slice(1, -1);
                }
                // 数字参数
                if (!isNaN(Number(arg))) {
                    return Number(arg);
                }
                // 布尔值
                if (arg === 'true') return true;
                if (arg === 'false') return false;
                // null/undefined
                if (arg === 'null') return null;
                if (arg === 'undefined') return undefined;
                return arg;
            });
        }

        // 执行任务函数
        await taskFunction(...args);
    } catch (error: any) {
        logger.error(`解析或执行任务失败 [${taskPath}]:`, error);
        throw error;
    }
}

/**
 * 创建带单机防重的定时任务
 * @param jobName 任务名称（用于标识和防重）
 * @param cronExpression cron 表达式
 * @param task 任务函数或任务路径字符串
 * @param options croner 选项
 * @returns Cron 实例
 */
export function CreateCronJob(
    jobName: string,
    cronExpression: string,
    task: (() => void | Promise<void>) | string,
    options?: any
) {
    const cronJob = new Cron(cronExpression, options, async () => {
        if (!tryAcquireLock(jobName)) {
            logger.warn(`任务 [${jobName}] 正在执行中，跳过本次调度`);
            return;
        }
        try {
            logger.info(`任务 [${jobName}] 开始执行`);

            // 如果是字符串，解析并执行
            if (typeof task === 'string') {
                await parseAndExecuteTask(task);
            } else {
                await task();
            }

            logger.info(`任务 [${jobName}] 执行完成`);
        } catch (error: any) {
            logger.error(`任务 [${jobName}] 执行失败:`, error);
        } finally {
            releaseLock(jobName);
        }
    });

    // 存储任务实例
    cronJobs.set(jobName, cronJob);
    return cronJob;
}

/**
 * 动态添加定时任务
 * @param jobName 任务名称
 * @param cronExpression cron 表达式
 * @param taskPath 任务路径字符串
 * @returns Cron 实例
 */
export function AddCronJob(
    jobName: string,
    cronExpression: string,
    taskPath: string
): Cron {
    // 如果任务已存在，先停止
    if (cronJobs.has(jobName)) {
        logger.warn(`任务 [${jobName}] 已存在，将先停止旧任务`);
        RemoveCronJob(jobName);
    }

    logger.info(`添加定时任务 [${jobName}]，cron: ${cronExpression}，任务: ${taskPath}`);
    return CreateCronJob(jobName, cronExpression, taskPath);
}

/**
 * 移除定时任务
 * @param jobName 任务名称
 */
export function RemoveCronJob(jobName: string): boolean {
    const cronJob = cronJobs.get(jobName);
    if (!cronJob) {
        logger.warn(`任务 [${jobName}] 不存在`);
        return false;
    }

    cronJob.stop();
    cronJobs.delete(jobName);

    // 清理锁文件
    releaseLock(jobName);

    logger.info(`已移除定时任务 [${jobName}]`);
    return true;
}

/**
 * 获取所有定时任务
 */
export function GetAllCronJobs(): Map<string, Cron> {
    return cronJobs;
}

/**
 * 获取指定定时任务
 * @param jobName 任务名称
 */
export function GetCronJob(jobName: string): Cron | undefined {
    return cronJobs.get(jobName);
}