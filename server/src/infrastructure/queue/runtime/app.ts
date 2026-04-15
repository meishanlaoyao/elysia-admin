/**
 * 主进程队列初始化入口
 * 在主进程中调用，只注册队列（不启动 Worker）
 */
import { queueManager } from '../core';

// 注册所有队列
import '../queues/system-cron/queue';
import '../queues/flow-buffer/queue';
import '../queues/trade-order/queue';

export { queueManager };