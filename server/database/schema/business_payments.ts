import { pgTable, bigserial, varchar, jsonb, bigint, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';
import { businessOrdersSchema } from './business_orders';
import { businessMerchantSchema } from './business_merchant';

export const businessPaymentsSchema = pgTable(
    'business_payments',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 支付记录ID
        orderId: bigint('order_id', { mode: 'number' }).notNull().references(() => businessOrdersSchema.id), // 关联订单ID
        orderNo: varchar('order_no', { length: 64 }).notNull().unique().references(() => businessOrdersSchema.orderNo), // 关联订单号
        merchantConfigId: bigint('merchant_config_id', { mode: 'number' }).notNull().references(() => businessMerchantSchema.id), // 关联商户配置ID
        paymentNo: varchar('payment_no', { length: 64 }).notNull().unique(), // 支付订单号
        channel: varchar('channel', { length: 20 }), // 支付渠道
        platform: varchar('platform', { length: 20 }).notNull(), // 支付平台 (字典：system_pay_platform)
        paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 支付方式 （字典：system_pay_method）
        amount: decimal('amount', { precision: 10, scale: 2, mode: 'number' }).default(0), // 实付金额
        status: varchar('status', { length: 20 }).default('0'), // 支付状态 （字典：system_pay_status）
        thirdTradeNo: varchar('third_trade_no', { length: 100 }), // 第三方交易号
        extra: jsonb('extra').default({}), // 扩展字段（回调数据等）
        ...BaseSchema,
    }
);

export const InsertBusinessPayments = createInsertSchema(businessPaymentsSchema);
export const SelectBusinessPayments = createSelectSchema(businessPaymentsSchema);