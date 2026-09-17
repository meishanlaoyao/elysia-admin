/**
 * 主进程队列初始化入口
 * 须在业务 Redis/PG 就绪之后调用；只注册队列（不启动 Worker）
 */
import { ConnectQueueRedis, queueManager } from '../core';

/**
 * 显式连接队列 Redis 并注册主进程全部 Queue
 */
export async function InitAppQueues(): Promise<void> {
    await ConnectQueueRedis();
    await import('../queues/system-cron/queue');
    await import('../queues/flow-buffer/queue');
    await import('../queues/trade-order/queue');
    await import('../queues/system-oper-log/queue');
}

export { queueManager };