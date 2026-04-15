/**
 * SystemCron Processor（沙箱模式）
 */
import type { SandboxedJob } from 'bullmq';
import { createTaskRegistry, parseArgs } from '../../core/processor-utils';

const { register, get } = createTaskRegistry();

// 注册所有业务 task
import { jobDemo } from '@/modules/monitor-job/task';
register('测试任务', jobDemo);

export default async function processor(job: SandboxedJob) {
    const { taskName, jobArgs } = job.data;
    const taskFn = get(taskName);
    if (!taskFn) throw new Error(`[SystemCron] 未找到任务: ${taskName}`);
    const args = parseArgs(jobArgs);
    await taskFn(...args);
    return { success: true, taskName };
};