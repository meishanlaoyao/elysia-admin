import { queueManager } from '../../core';

const SystemCronQueue = queueManager.registerQueue({
    name: 'system-cron-queue',
    description: '系统定时调度队列',
});

export default SystemCronQueue;