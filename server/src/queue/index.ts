/**
 * 开发一个可插拔的队列。
 * - worker 打包成单独的.js文件，作为单独的进程文件，防止 worker 崩溃干崩主线程。
 */
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import SystemCronQueue from './system-cron';

export const queues = [
    new BullMQAdapter(SystemCronQueue),
];