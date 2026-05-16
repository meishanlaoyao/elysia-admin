/**
 * 沙箱 Worker（system-cron-queue）任务注册：组合层，可依赖 modules。
 * infrastructure 内的 processor 只应 import 本目录，不直接 import modules。
 */
import { jobDemo } from '@/modules/monitor-job/task';
import type { TaskFn } from '@/infrastructure/queue/core/processor-utils';


export function registerSystemCronSandboxTasks(
    register: (name: string, fn: TaskFn) => void
): void {
    register('测试任务', jobDemo);
};