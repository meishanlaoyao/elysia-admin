/**
 * TradeOrder Processor（沙箱模式）
 * 每个任务在独立子进程中执行
 */
import type { SandboxedJob } from 'bullmq';

export default async function processor(job: SandboxedJob) {
    const { orderId, action, orderData } = job.data;
    console.log(`[TradeOrder] 订单: ${orderId}, 操作: ${action}`);
    switch (action) {
        case 'create':
            await new Promise((r) => setTimeout(r, 1000));
            return { orderId: `ORD-${Date.now()}`, status: 'created' };
        case 'pay':
            await new Promise((r) => setTimeout(r, 1500));
            return { orderId, status: 'paid', paidAt: new Date().toISOString() };
        case 'cancel':
            await new Promise((r) => setTimeout(r, 800));
            return { orderId, status: 'cancelled' };
        case 'refund':
            await new Promise((r) => setTimeout(r, 2000));
            return { orderId, status: 'refunded' };
        default:
            throw new Error(`未知的订单操作: ${action}`);
    };
};