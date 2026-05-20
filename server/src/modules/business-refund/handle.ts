import type { AppContext } from '@/types/app-context';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/shared/logger';
import {
    CreateQueryBuilder,
    FindPage,
    FindOneByKey,
} from '@/core/database/repository';
import { GenerateUUID } from '@/shared/uuid';
import { BaseResultData } from '@/core/result';
import { RunTransaction } from '@/core/database/transaction';
import { businessRefundSchema } from '@database/schema/business_refund';
import { businessOrdersSchema } from '@database/schema/business_orders';
import { businessPaymentsSchema } from '@database/schema/business_payments';

/**
 * 状态字典说明：
 * 
 * 订单状态 (system_orders_status):
 * - 0: 待支付
 * - 1: 已支付
 * - 2: 已取消
 * - 3: 已过期
 * - 4: 已退款
 * 
 * 退款状态 (system_refund_status):
 * - 0: 退款中
 * - 1: 成功
 * - 2: 失败
 * 
 * 支付状态 (system_pay_status):
 * - 0: 待支付
 * - 1: 成功
 * - 2: 失败
 * - 3: 已关闭
 */

export async function create(ctx: AppContext) {
    try {
        const userId = ctx?.user?.userId;
        const { orderId, paymentId, amount, reason } = ctx.body as any;
        // 1. 查询订单信息
        const order = await FindOneByKey(businessOrdersSchema, 'id', orderId);
        if (!order) return BaseResultData.fail(400, '订单不存在');
        // 2. 验证订单所属用户
        if (order.userId !== userId) return BaseResultData.fail(403, '无权操作此订单');
        // 3. 验证订单状态（只有已支付的订单才能退款）
        if (order.status !== '1') return BaseResultData.fail(400, '订单状态不支持退款');
        // 4. 查询支付记录
        const payment = await FindOneByKey(businessPaymentsSchema, 'id', paymentId);
        if (!payment) return BaseResultData.fail(400, '支付记录不存在');
        // 5. 验证支付记录与订单的关联
        if (payment.orderId !== orderId) return BaseResultData.fail(400, '支付记录与订单不匹配');
        // 6. 验证支付状态（只有支付成功的才能退款）
        if (payment.status !== '1') return BaseResultData.fail(400, '支付状态不支持退款');
        // 7. 验证退款金额
        if (amount <= 0 || amount > Number(payment.amount)) return BaseResultData.fail(400, '退款金额不合法');
        // 8. 检查是否已存在退款申请
        const existingRefund = await CreateQueryBuilder(businessRefundSchema)
            .eq('orderId', orderId)
            .eq('paymentId', paymentId)
            .eq('delFlag', false)
            .build();
        const [existing] = await FindPage(businessRefundSchema, existingRefund, {
            pageNum: 1,
            pageSize: 1
        }).then(res => res.list);
        if (existing && (existing.status === '0' || existing.status === '1')) return BaseResultData.fail(400, '退款申请已存在，请勿重复提交');
        // 9. 生成退款单号
        let refundNo = GenerateUUID();
        if (refundNo.length > 64) refundNo = refundNo.substring(0, 64);
        // 10. 创建退款记录
        const refundData: any = {
            orderId,
            paymentId,
            refundNo,
            amount: Number(amount).toFixed(2),
            status: '0', // 0-退款中
            extra: {
                reason: reason || '',
                orderNo: order.orderNo,
                paymentNo: payment.paymentNo,
                applyTime: new Date(),
            },
            createBy: userId,
        };
        await RunTransaction(async (tx) => {
            await tx.insert(businessRefundSchema).values(refundData);
            // 更新订单状态为已退款
            await tx.update(businessOrdersSchema).set({
                status: '4', // 4-已退款
                updateBy: userId,
                updateTime: new Date(),
            }).where(eq(businessOrdersSchema.id, orderId));
        });
        logger.info(`用户 ${userId} 创建退款申请，退款单号：${refundNo}`);
        return BaseResultData.ok(refundNo);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: AppContext) {
    try {
        const updateBy = ctx?.user?.userId || null;
        const { id, status, remark } = ctx.body as any;
        // 查询退款记录
        const refund = await FindOneByKey(businessRefundSchema, 'id', id);
        if (!refund) return BaseResultData.fail(404, '退款记录不存在');
        // 只有退款中状态才能修改
        if (refund.status !== '0') return BaseResultData.fail(400, '当前退款状态不允许修改');
        await RunTransaction(async (tx) => {
            const extra = typeof refund.extra === 'object' ? refund.extra : {};
            await tx.update(businessRefundSchema).set({
                status,
                remark,
                updateBy,
                updateTime: new Date(),
                extra: {
                    ...extra,
                    processTime: new Date(),
                    processBy: updateBy,
                },
            }).where(eq(businessRefundSchema.id, id));
            if (status === '1') {
                // 1-成功，退款成功后订单保持已退款状态
                await tx.update(businessOrdersSchema).set({
                    status: '4', // 4-已退款
                    updateBy,
                    updateTime: new Date(),
                }).where(eq(businessOrdersSchema.id, refund.orderId));
                // TODO: 这里需要调用第三方支付平台的退款接口
                // 实际项目中需要根据支付平台调用相应的退款API
                logger.info(`退款成功，退款单号：${refund.refundNo}，需要调用第三方退款接口`);
            } else if (status === '2') {
                // 2-失败，退款失败后恢复订单状态为已支付
                await tx.update(businessOrdersSchema).set({
                    status: '1', // 1-已支付
                    updateBy,
                    updateTime: new Date(),
                }).where(eq(businessOrdersSchema.id, refund.orderId));
                logger.info(`退款失败，退款单号：${refund.refundNo}`);
            };
        });
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

/**
 * 处理第三方退款回调
 * 这个函数由支付回调时调用，更新退款状态
 */
export async function handleRefundCallback(data: {
    refundNo: string;
    thirdRefundNo: string;
    status: string;
    extra?: any;
}) {
    try {
        const { refundNo, thirdRefundNo, status, extra } = data;
        await RunTransaction(async (tx) => {
            const refundList = await tx.select().from(businessRefundSchema).where(
                and(
                    eq(businessRefundSchema.refundNo, refundNo),
                    eq(businessRefundSchema.delFlag, false)
                )
            );
            const refund = refundList[0] || null;
            if (!refund) throw new Error('退款记录不存在');
            const refundExtra = typeof refund.extra === 'object' ? refund.extra : {};
            await tx.update(businessRefundSchema).set({
                status,
                thirdRefundNo,
                extra: {
                    ...refundExtra,
                    ...extra,
                    callbackTime: new Date(),
                },
                updateTime: new Date(),
            }).where(eq(businessRefundSchema.id, refund.id));
            if (status === '1') {
                await tx.update(businessOrdersSchema).set({
                    status: '4', // 4-已退款
                    updateTime: new Date(),
                }).where(eq(businessOrdersSchema.id, refund.orderId));
            }
        });
        logger.info(`退款回调处理成功，退款单号：${refundNo}，第三方退款单号：${thirdRefundNo}`);
    } catch (error) {
        logger.error('处理退款回调失败：' + error);
        throw error;
    }
};