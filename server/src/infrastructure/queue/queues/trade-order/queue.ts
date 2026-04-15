import { queueManager } from '../../core';

const TradeOrderQueue = queueManager.registerQueue({
    name: 'trade-order-queue',
    description: '核心交易订单队列',
});

export default TradeOrderQueue;