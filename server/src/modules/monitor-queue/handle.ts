import type { Job } from 'bullmq';
import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import { queueManager } from '@/infrastructure/queue';

const JOB_STATES = ['waiting', 'active', 'delayed', 'failed', 'completed'] as const;
type JobState = (typeof JOB_STATES)[number];

const BATCH_DEFAULT_LIMIT = 500;

function getQueue(queueName: string) {
    return queueManager.getQueue(queueName);
};

function resolveBatchLimit(limit?: number | string) {
    return Math.min(BATCH_DEFAULT_LIMIT, Math.max(1, Number(limit) || BATCH_DEFAULT_LIMIT));
};

async function serializeJob(job: Job) {
    const state = await job.getState();
    const delayMs = Number(job.delay || job.opts?.delay || 0);
    const delayedUntil = job.timestamp && delayMs > 0 ? job.timestamp + delayMs : undefined;
    return {
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        delay: delayMs || job.delay,
        delayedUntil,
        opts: job.opts,
        state,
    };
};

export async function findQueueList() {
    const list = await Promise.all(queueManager.getAllQueueMeta().map(async (meta) => {
        const queue = queueManager.getQueue(meta.name);
        if (!queue) return null;
        const counts = await queue.getJobCounts(
            'waiting', 'active', 'completed', 'failed', 'delayed', 'paused'
        );
        const isPaused = await queue.isPaused();
        return {
            name: meta.name,
            description: meta.description ?? '',
            counts,
            isPaused,
        };
    }));
    return BaseResultData.ok(list.filter(Boolean));
};

export async function findJobList(ctx: AppContext) {
    const { queueName, state, pageNum = 1, pageSize = 20 } = ctx.query as {
        queueName: string;
        state: JobState;
        pageNum?: number | string;
        pageSize?: number | string;
    };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    if (!JOB_STATES.includes(state)) return BaseResultData.fail(400, '任务状态无效');
    const page = Math.max(1, Number(pageNum) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const start = (page - 1) * size;
    const end = start + size - 1;
    const counts = await queue.getJobCounts(state);
    const total = counts[state] ?? 0;
    const jobs = await queue.getJobs([state], start, end);
    const rows = await Promise.all(jobs.filter(Boolean).map((job) => serializeJob(job!)));
    return BaseResultData.ok({ list: rows, total, pageNum: page, pageSize: size });
};

export async function findJobDetail(ctx: AppContext) {
    const { queueName, jobId } = ctx.query as { queueName: string; jobId: string };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const job = await queue.getJob(String(jobId));
    if (!job) return BaseResultData.fail(404, '任务不存在');
    const detail = await serializeJob(job);
    const logs = await queue.getJobLogs(String(jobId));
    return BaseResultData.ok({ ...detail, logs: logs.logs, logCount: logs.count });
};

export async function retryJob(ctx: AppContext) {
    const { queueName, jobId } = ctx.body as { queueName: string; jobId: string };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const job = await queue.getJob(String(jobId));
    if (!job) return BaseResultData.fail(404, '任务不存在');
    const state = await job.getState();
    if (state !== 'failed') return BaseResultData.fail(400, '仅 failed 状态任务可重试');
    await job.retry();
    return BaseResultData.ok();
};

function isSchedulerManagedJob(jobId: string) {
    return jobId.startsWith('repeat:');
};

export async function removeJob(ctx: AppContext) {
    const { queueName, jobId } = ctx.query as { queueName: string; jobId: string };
    const id = String(jobId);
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const job = await queue.getJob(id);
    if (!job) return BaseResultData.fail(404, '任务不存在');
    if (isSchedulerManagedJob(id)) {
        const state = await job.getState();
        if (state !== 'completed' && state !== 'failed') {
            return BaseResultData.fail(400, '调度器任务执行中或等待中，不支持删除');
        }
    }
    await job.remove();
    return BaseResultData.ok();
};

export async function cleanQueue(ctx: AppContext) {
    const { queueName, state, grace = 0 } = ctx.query as {
        queueName: string;
        state: 'completed' | 'failed';
        grace?: number | string;
    };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const deleted = await queue.clean(Number(grace) || 0, 1000, state);
    return BaseResultData.ok({ deleted: deleted.length });
};

export async function pauseQueue(ctx: AppContext) {
    const { queueName, pause } = ctx.body as { queueName: string; pause: boolean };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    if (pause) await queue.pause();
    else await queue.resume();
    return BaseResultData.ok({ isPaused: pause });
};

export async function retryAllJobs(ctx: AppContext) {
    const { queueName, limit } = ctx.body as { queueName: string; limit?: number | string };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const batchLimit = resolveBatchLimit(limit);
    const jobs = await queue.getJobs(['failed'], 0, batchLimit - 1);
    let affected = 0;
    for (const job of jobs) {
        if (!job) continue;
        const state = await job.getState();
        if (state !== 'failed') continue;
        await job.retry();
        affected += 1;
    };
    return BaseResultData.ok({ affected });
};

export async function promoteJob(ctx: AppContext) {
    const { queueName, jobId } = ctx.body as { queueName: string; jobId: string };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const job = await queue.getJob(String(jobId));
    if (!job) return BaseResultData.fail(404, '任务不存在');
    const state = await job.getState();
    if (state !== 'delayed') return BaseResultData.fail(400, '仅 delayed 状态任务可立即执行');
    await job.promote();
    return BaseResultData.ok();
};

export async function promoteAllJobs(ctx: AppContext) {
    const { queueName, limit } = ctx.body as { queueName: string; limit?: number | string };
    const queue = getQueue(queueName);
    if (!queue) return BaseResultData.fail(400, '队列不存在');
    const batchLimit = resolveBatchLimit(limit);
    const jobs = await queue.getJobs(['delayed'], 0, batchLimit - 1);
    let affected = 0;
    for (const job of jobs) {
        if (!job) continue;
        const state = await job.getState();
        if (state !== 'delayed') continue;
        await job.promote();
        affected += 1;
    };
    return BaseResultData.ok({ affected });
};