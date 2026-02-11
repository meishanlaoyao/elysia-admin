import { t } from 'elysia';
import { CrudDto } from '@/types/dto';
import { InsertMonitorJob, SelectMonitorJob } from 'database/schema/monitor_job';

export const CreateDto = CrudDto.create(
    InsertMonitorJob,
    SelectMonitorJob,
    ['jobName', 'jobCron', 'status']
);

export const UpdateDto = CrudDto.update(SelectMonitorJob, 'jobId');

export const ListDto = CrudDto.list(SelectMonitorJob, {
    jobName: t.Optional(t.String({ description: "任务名称" })),
    status: t.Optional(t.String({ description: "状态" })),
});