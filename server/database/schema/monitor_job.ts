import { pgTable, bigserial, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from 'database/base-schema';

export const monitorJobSchema = pgTable(
    'monitor_job',
    {
        jobId: bigserial('job_id', { mode: 'number' }).primaryKey(), // 定时任务ID
        jobName: varchar('job_name', { length: 64 }).notNull().unique(), // 定时任务名称
        jobCron: varchar('job_cron', { length: 64 }).notNull(), // 定时任务CRON表达式
        jobArgs: varchar('job_args', { length: 256 }), // 定时任务参数
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertMonitorJob = createInsertSchema(monitorJobSchema);
export const SelectMonitorJob = createSelectSchema(monitorJobSchema);