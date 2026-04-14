/**
 * 核心交易队列
 */
import Redis from "ioredis";
import config from "@/config";
import { Queue } from "bullmq";

const { id } = config.app;
const TradeOrderQueue = new Queue(
    `${id}-trade-order-queue`,
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

export default TradeOrderQueue;