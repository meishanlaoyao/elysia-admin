import { pgTable, bigserial, varchar, jsonb, bigint, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';
import { businessMerchantSchema } from './business_merchant';

export const businessOrdersSchema = pgTable(
    'business_orders',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 订单ID
        orderNo: varchar('order_no', { length: 64 }).notNull().unique(), // 订单号
        userId: bigint('user_id', { mode: 'number' }).notNull(), // 下单用户ID
        title: varchar('title', { length: 200 }).notNull(), // 订单标题
        description: varchar('description', { length: 500 }), // 订单描述
        amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // 订单总金额
        currency: varchar('currency', { length: 10 }).default('CNY'), // 货币类型
        status: varchar('status', { length: 20 }).default('0'), // 订单状态 （0待支付 1已支付 2已取消 3已退款）
        expireAt: timestamp('expire_at'), // 订单过期时间
        paymentMethod: varchar('payment_method', { length: 20 }).references(() => businessMerchantSchema.channel), // 支付方式
        extra: jsonb('extra'), // 扩展字段（用于保存业务附加信息）
        ...BaseSchema,
    }
);

export const InsertBusinessOrders = createInsertSchema(businessOrdersSchema);
export const SelectBusinessOrders = createSelectSchema(businessOrdersSchema);