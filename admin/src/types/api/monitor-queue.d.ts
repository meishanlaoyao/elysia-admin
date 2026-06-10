declare namespace Api {
    namespace MonitorQueue {
        type JobState = 'waiting' | 'active' | 'delayed' | 'failed' | 'completed';

        interface QueueCounts {
            waiting?: number;
            active?: number;
            completed?: number;
            failed?: number;
            delayed?: number;
            paused?: number;
        }

        interface QueueListItem {
            name: string;
            description?: string;
            counts: QueueCounts;
            isPaused: boolean;
        }

        interface JobListItem {
            id?: string;
            name?: string;
            data?: Record<string, unknown>;
            progress?: number | object;
            attemptsMade?: number;
            failedReason?: string;
            stacktrace?: string[];
            timestamp?: number;
            processedOn?: number;
            finishedOn?: number;
            delay?: number;
            delayedUntil?: number;
            state?: string;
        }

        type JobList = {
            list: JobListItem[];
            total: number;
            pageNum: number;
            pageSize: number;
        };

        interface JobListParams {
            queueName: string;
            state: JobState;
            pageNum?: number;
            pageSize?: number;
        }

        interface JobDetailParams {
            queueName: string;
            jobId: string;
        }

        interface JobDetail extends JobListItem {
            logs?: string[];
            logCount?: number;
            opts?: Record<string, unknown>;
        }

        interface RetryJobDto {
            queueName: string;
            jobId: string;
        }

        interface CleanQueueParams {
            queueName: string;
            state: 'completed' | 'failed';
            grace?: number;
        }

        interface CleanQueueResult {
            deleted: number;
        }

        interface PauseQueueDto {
            queueName: string;
            pause: boolean;
        }

        interface QueueBatchDto {
            queueName: string;
            limit?: number;
        }

        interface PromoteJobDto {
            queueName: string;
            jobId: string;
        }

        interface BatchOpsResult {
            affected: number;
        }

        interface PauseQueueResult {
            isPaused: boolean;
        }
    }
}
