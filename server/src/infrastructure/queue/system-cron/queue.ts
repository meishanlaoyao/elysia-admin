/**
 * 系统调度队列
 */
import Redis from "ioredis";
import config from "@/config";
import { Queue } from "bullmq";

const { id } = config.app;
const SystemCronQueue = new Queue(
    `${id}-system-cron-queue`,
    {
        connection: new Redis({
            host: 'localhost',
            port: 6379,
            username: '',
            password: '',
            db: 0,
            maxRetriesPerRequest: null
        })
    },
);

export default SystemCronQueue;