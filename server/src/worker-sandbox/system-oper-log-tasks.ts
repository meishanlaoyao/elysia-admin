/**
 * 沙箱 Worker（system-oper-log）任务注册：组合层，可依赖 modules。
 */
import { create } from '@/modules/system-oper-log/handle';
import type { TaskFn } from '@/infrastructure/queue/core/processor-utils';

export function registerSystemOperLogSandboxTasks(
    register: (name: string, fn: TaskFn) => void
): void {
    register('操作日志落库', create as TaskFn);
};