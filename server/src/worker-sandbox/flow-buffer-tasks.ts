/**
 * 沙箱 Worker（flow-buffer）任务注册：组合层，可依赖 modules。
 */
import { OrderTimeoutHandle } from '@/modules/business-orders/handle';
import type { TaskFn } from '@/infrastructure/queue/core/processor-utils';

export function registerFlowBufferSandboxTasks(
    register: (name: string, fn: TaskFn) => void
): void {
    register('订单超时处理', OrderTimeoutHandle as TaskFn);
};