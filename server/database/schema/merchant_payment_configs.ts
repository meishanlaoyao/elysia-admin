import { pgTable, bigserial, varchar, boolean, text, jsonb, bigint } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';
import { businessMerchantSchema } from './business_merchant';

export const merchantPaymentConfigsSchema = pgTable(
    'merchant_payment_configs',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(), // 配置ID
        merchantId: bigint('merchant_id', { mode: 'number' }).notNull().references(() => businessMerchantSchema.id), // 商户ID
        channel: varchar('channel', { length: 20 }).notNull(), // 支付渠道
        appId: varchar('app_id', { length: 100 }), // 应用ID（支付宝APPID / 微信APPID）
        mchId: varchar('mch_id', { length: 100 }), // 商户号（微信商户号 / PayPal商户ID）
        privateKey: text('private_key'), // 商户私钥
        publicKey: text('public_key'), // 支付平台公钥（支付宝公钥）
        config: jsonb('config'), // 扩展配置（api_v3_key、notify_url 等）
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertMerchantPaymentConfigs = createInsertSchema(merchantPaymentConfigsSchema);
export const SelectMerchantPaymentConfigs = createSelectSchema(merchantPaymentConfigsSchema);
