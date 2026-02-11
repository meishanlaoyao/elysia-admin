declare namespace Api {
    namespace MonitorJob {
        interface JobListItem {
            jobId: number;
            jobName: string;
            jobCron: string;
            jobArgs: string;
            status?: boolean;
            createTime?: Date;
            createBy?: number | null;
            updateTime?: null | Date;
            updateBy?: null | number;
            delFlag?: boolean;
            remark?: null | string;
        }

        type JobList = Api.Common.PaginatedResponse<JobListItem>;

        type JobSearchParams = Partial<
            Pick<JobListItem, 'jobName' | 'status'> &
            Api.Common.CommonSearchParams
        >
    }
}