import { pgTable, bigserial, varchar, boolean, } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';

export const businessMerchantSchema = pgTable(
    'business_merchant',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 商户ID
        name: varchar('name', { length: 100 }).notNull(), // 商户名称
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertBusinessMerchant = createInsertSchema(businessMerchantSchema);
export const SelectBusinessMerchant = createSelectSchema(businessMerchantSchema);