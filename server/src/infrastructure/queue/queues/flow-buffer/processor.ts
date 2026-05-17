/**
 * FlowBuffer Processor（沙箱模式）
 * 每个任务在独立子进程中执行
 */
import type { SandboxedJob } from 'bullmq';
import { createTaskRegistry } from '@/infrastructure/queue/core/processor-utils';
import { registerFlowBufferSandboxTasks } from '@/worker-sandbox/flow-buffer-tasks';

const { register, get } = createTaskRegistry();
registerFlowBufferSandboxTasks(register);

export default async function processor(job: SandboxedJob) {
    const taskFn = get(job.name);
    if (!taskFn) throw new Error(`[FlowBuffer] 未找到任务: ${job.name}`);
    await taskFn(job.data);
    return { success: true, processedAt: new Date().toISOString() };
};