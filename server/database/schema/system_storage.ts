import { pgTable, bigserial, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';

export const systemStorageSchema = pgTable(
    'system_storage',
    {
        storageId: bigserial('storage_id', { mode: 'number' }).primaryKey(), // 存储ID
        name: varchar('name', { length: 64 }).unique().notNull(), // 存储名称
        region: varchar('region', { length: 64 }), // 区域
        endpoint: varchar('endpoint', { length: 255 }), // 存储端点
        bucket: varchar('bucket', { length: 128 }), // 存储桶
        accessKey: varchar('access_key', { length: 128 }), // 访问密钥
        secretKey: varchar('secret_key', { length: 128 }), // 密钥
        status: boolean('status').default(false), // 状态
        ...BaseSchema,
    }
);

export const InsertSystemStorage = createInsertSchema(systemStorageSchema);
export const SelectSystemStorage = createSelectSchema(systemStorageSchema);