import { t } from 'elysia';

const jobState = t.Union([
    t.Literal('waiting'),
    t.Literal('active'),
    t.Literal('delayed'),
    t.Literal('failed'),
    t.Literal('completed'),
]);

export const JobListDto = {
    query: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        state: jobState,
        pageNum: t.Optional(t.Numeric({ minimum: 1, description: '页码' })),
        pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 100, description: '每页条数' })),
    }),
};

export const JobDetailDto = {
    query: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        jobId: t.String({ minLength: 1, description: '任务 ID' }),
    }),
};

export const RetryJobDto = {
    body: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        jobId: t.String({ minLength: 1, description: '任务 ID' }),
    }),
};

export const RemoveJobDto = {
    query: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        jobId: t.String({ minLength: 1, description: '任务 ID' }),
    }),
};

export const CleanQueueDto = {
    query: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        state: t.Union([t.Literal('completed'), t.Literal('failed')]),
        grace: t.Optional(t.Numeric({ minimum: 0, description: '保留毫秒数，0 表示全部清理' })),
    }),
};

export const PauseQueueDto = {
    body: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        pause: t.Boolean({ description: 'true 暂停，false 恢复' }),
    }),
};

export const QueueBatchDto = {
    body: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 500, description: '最大处理条数，默认 500' })),
    }),
};

export const PromoteJobDto = {
    body: t.Object({
        queueName: t.String({ minLength: 1, description: '队列名称' }),
        jobId: t.String({ minLength: 1, description: '任务 ID' }),
    }),
};