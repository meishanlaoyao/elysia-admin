import { pgTable, bigserial, varchar, jsonb, bigint, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';
import { businessOrdersSchema } from './business_orders';
import { businessPaymentsSchema } from './business_payments';

export const businessRefundSchema = pgTable(
    'business_refund',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 退款ID
        orderId: bigint('order_id', { mode: 'number' }).notNull().references(() => businessOrdersSchema.id), // 关联订单ID
        paymentId: bigint('payment_id', { mode: 'number' }).notNull().references(() => businessPaymentsSchema.id), // 关联支付记录ID
        refundNo: varchar('refund_no', { length: 64 }).notNull().unique(), // 退款单号
        amount: decimal('amount', { precision: 10, scale: 2, mode: 'number' }).notNull(), // 退款金额
        status: varchar('status', { length: 20 }).default('0'), // 退款状态 （字典：system_refund_status）
        thirdRefundNo: varchar('third_refund_no', { length: 100 }), // 第三方退款单号
        extra: jsonb('extra').default({}), // 扩展字段（回调数据等）
        ...BaseSchema,
    }
);

export const InsertBusinessRefund = createInsertSchema(businessRefundSchema);
export const SelectBusinessRefund = createSelectSchema(businessRefundSchema);