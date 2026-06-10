/** BullMQ Job Scheduler 实例 ID（cron repeat 任务） */
export function isSchedulerManagedJob(jobId?: string | number | null): boolean {
    return String(jobId ?? '').startsWith('repeat:')
}

/** 是否可单条删除：普通任务均可；调度器任务仅 completed / failed 可删 */
export function canRemoveQueueJob(
    jobId?: string | number | null,
    state?: string | null,
): boolean {
    if (!jobId) return false
    if (!isSchedulerManagedJob(jobId)) return true
    return state === 'completed' || state === 'failed'
}