/**
 * FlowBuffer Processor（沙箱模式）
 * 每个任务在独立子进程中执行
 */
import type { SandboxedJob } from 'bullmq';

export default async function processor(job: SandboxedJob) {
    const { action, data } = job.data;
    console.log(`[FlowBuffer] 处理: ${action}`, data);
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, action, processedAt: new Date().toISOString() };
};