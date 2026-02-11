import { RegisterTasks } from '@/shared/cron';
import { logger } from '@/shared/logger';
import type { ITask } from '@/core/task';

/**
 * 自动注册所有模块的任务
 * 开发环境：动态扫描
 * 生产环境：使用预生成的文件
 */
export async function RegisterAllTasks() {
    if (process.env.NODE_ENV === 'production') {
        // 生产环境使用预生成的注册表
        try {
            // @ts-expect-error - 此文件在构建时生成
            const { allTasks } = await import('./task-registry.generated') as { allTasks: ITask[][] };
            allTasks.forEach((tasks: ITask[]) => {
                if (Array.isArray(tasks)) {
                    RegisterTasks(tasks);
                }
            });
            logger.info(`✓ 生产环境任务注册完成`);
        } catch (error: any) {
            logger.error('生产环境任务注册失败:', error);
            throw error;
        }
    } else {
        // 开发环境保持动态扫描
        const { readdirSync, statSync } = await import('node:fs');
        const { join } = await import('node:path');
        const modulesPath = join(process.cwd(), 'src', 'modules');

        try {
            const modules = readdirSync(modulesPath);
            for (const moduleName of modules) {
                const modulePath = join(modulesPath, moduleName);
                const stat = statSync(modulePath);
                if (!stat.isDirectory()) continue;

                const taskFilePath = join(modulePath, 'task.ts');
                try {
                    const taskModule = await import(taskFilePath);
                    if (taskModule.default && Array.isArray(taskModule.default)) {
                        RegisterTasks(taskModule.default);
                        logger.info(`✓ 模块 [${moduleName}] 的任务已注册`);
                    }
                } catch (error) {
                    // 如果文件不存在或导入失败，跳过
                    continue;
                }
            }
        } catch (error: any) {
            logger.error('注册任务失败:', error);
            throw error;
        }
    }
};
