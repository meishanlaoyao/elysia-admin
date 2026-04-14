/**
 * 开发一个可插拔的队列。
 * - worker 打包成单独的.js文件，作为单独的进程文件，防止 worker 崩溃干崩主线程。
 */
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import SystemCronQueue from './system-cron/queue';
import FlowBufferQueue from './flow-buffer/queue';
import TradeOrderQueue from './trade-order/queue';

export const queues = [
    new BullMQAdapter(SystemCronQueue),
    new BullMQAdapter(FlowBufferQueue),
    new BullMQAdapter(TradeOrderQueue),
];