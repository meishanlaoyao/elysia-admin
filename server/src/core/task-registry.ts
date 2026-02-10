import { RegisterTasks } from '@/shared/cron';
import { logger } from '@/shared/logger';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 自动注册所有模块的任务
 */
export async function RegisterAllTasks() {
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
                };
            } catch (error) {
                // 如果文件不存在或导入失败，跳过
                continue;
            }
        };
    } catch (error: any) {
        logger.error('注册任务失败:', error);
        throw error;
    }
};