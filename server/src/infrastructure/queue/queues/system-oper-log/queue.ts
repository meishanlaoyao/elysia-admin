import { queueManager } from '../../core';

const SystemOperLogQueue = queueManager.registerQueue({
    name: 'system-oper-log-queue',
    description: '操作日志异步落库',
});

export default SystemOperLogQueue;