/**
 * FlowBuffer Processor（沙箱模式）
 * 每个任务在独立子进程中执行
 */
import { createTaskRegistry } from '@/infrastructure/queue/core/processor-utils';
import type { SandboxedJob } from 'bullmq';

const { register, get } = createTaskRegistry();

// 注册所有业务 task
import { OrderTimeoutHandle } from '@/modules/business-orders/handle';
register('订单超时处理', OrderTimeoutHandle);

export default async function processor(job: SandboxedJob) {
    const taskFn = get(job.name);
    if (!taskFn) throw new Error(`[FlowBuffer] 未找到任务: ${job.name}`);
    await taskFn(job.data);
    return { success: true, processedAt: new Date().toISOString() };
};