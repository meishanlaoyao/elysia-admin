import { pgTable, bigserial, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemApiSchema = pgTable(
    'system_api',
    {
        apiId: bigserial('api_id', { mode: 'number' }).primaryKey(), // API ID
        apiName: varchar('api_name', { length: 64 }).notNull(), // API名称
        apiPath: varchar('api_path', { length: 255 }).notNull(), // API路径
        apiMethod: varchar('api_method', { length: 10 }).notNull(), // API方法
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertSystemApi = createInsertSchema(systemApiSchema);
export const SelectSystemApi = createSelectSchema(systemApiSchema);