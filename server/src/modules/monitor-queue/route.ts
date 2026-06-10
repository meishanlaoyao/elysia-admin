import type { IRouteModule } from '@/types/route';
import {
    findQueueList, findJobList, findJobDetail, retryJob, removeJob, cleanQueue,
    pauseQueue, retryAllJobs, promoteJob, promoteAllJobs,
} from './handle';
import {
    JobListDto, JobDetailDto, RetryJobDto, RemoveJobDto, CleanQueueDto,
    PauseQueueDto, QueueBatchDto, PromoteJobDto,
} from './dto';

const MonitorQueueModule: IRouteModule = {
    tags: '队列监控',
    routes: [
        { url: '/monitor/queue/list', method: 'get', summary: '查询队列列表', handle: findQueueList, meta: { isAuth: true, permission: 'monitor:queue:query' } },
        { url: '/monitor/queue/jobs', method: 'get', summary: '查询任务列表', dto: JobListDto, handle: findJobList, meta: { isAuth: true, permission: 'monitor:queue:query' } },
        { url: '/monitor/queue/job', method: 'get', summary: '查询任务详情', dto: JobDetailDto, handle: findJobDetail, meta: { isAuth: true, permission: 'monitor:queue:query' } },
        { url: '/monitor/queue/job/retry', method: 'post', summary: '重试失败任务', dto: RetryJobDto, handle: retryJob, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:retry' } },
        { url: '/monitor/queue/job', method: 'delete', summary: '删除任务', dto: RemoveJobDto, handle: removeJob, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:delete' } },
        { url: '/monitor/queue/clean', method: 'delete', summary: '清空队列任务', dto: CleanQueueDto, handle: cleanQueue, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:clean' } },
        { url: '/monitor/queue/pause', method: 'post', summary: '暂停或恢复队列', dto: PauseQueueDto, handle: pauseQueue, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:pause' } },
        { url: '/monitor/queue/jobs/retry-all', method: 'post', summary: '批量重试失败任务', dto: QueueBatchDto, handle: retryAllJobs, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:retry' } },
        { url: '/monitor/queue/job/promote', method: 'post', summary: '立即执行延迟任务', dto: PromoteJobDto, handle: promoteJob, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:promote' } },
        { url: '/monitor/queue/jobs/promote-all', method: 'post', summary: '批量立即执行延迟任务', dto: QueueBatchDto, handle: promoteAllJobs, meta: { isAuth: true, isLog: true, permission: 'monitor:queue:promote' } },
    ],
};

export default MonitorQueueModule;