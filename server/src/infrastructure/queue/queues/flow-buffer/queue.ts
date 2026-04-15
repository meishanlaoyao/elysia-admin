import { queueManager } from '../../core';

const FlowBufferQueue = queueManager.registerQueue({
    name: 'flow-buffer-queue',
    description: '流量缓冲队列',
});

export default FlowBufferQueue;