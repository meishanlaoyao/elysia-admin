import { pgTable, bigserial, varchar, jsonb, bigint, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';
import { businessOrdersSchema } from './business_orders';

export const businessPaymentsSchema = pgTable(
    'business_payments',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 支付记录ID
        orderId: bigint('order_id', { mode: 'number' }).notNull().references(() => businessOrdersSchema.id), // 关联订单ID
        ...BaseSchema,
    }
);

export const InsertBusinessPayments = createInsertSchema(businessPaymentsSchema);
export const SelectBusinessPayments = createSelectSchema(businessPaymentsSchema);