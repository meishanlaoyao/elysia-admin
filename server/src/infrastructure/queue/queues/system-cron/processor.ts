/**
 * SystemCron Processor（沙箱模式）
 */
import type { SandboxedJob } from 'bullmq';
import { registerSystemCronSandboxTasks } from '@/worker-sandbox/system-cron-tasks';
import { createTaskRegistry, parseArgs } from '@/infrastructure/queue/core/processor-utils';


const { register, get } = createTaskRegistry();
registerSystemCronSandboxTasks(register);

export default async function processor(job: SandboxedJob) {
    const { taskName, jobArgs } = job.data;
    const taskFn = get(taskName);
    if (!taskFn) throw new Error(`[SystemCron] 未找到任务: ${taskName}`);
    const args = parseArgs(jobArgs);
    await taskFn(...args);
    return { success: true, taskName };
};