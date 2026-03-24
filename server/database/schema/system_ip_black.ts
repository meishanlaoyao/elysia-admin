import { pgTable, bigserial, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';

export const systemIpBlackSchema = pgTable(
    'system_ip_black',
    {
        ipBlackId: bigserial('ip_black_id', { mode: 'number' }).primaryKey(), // IP黑名单ID
        ipAddress: varchar('ip_address', { length: 64 }).notNull().unique(), // IP地址
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertSystemIpBlack = createInsertSchema(systemIpBlackSchema);
export const SelectSystemIpBlack = createSelectSchema(systemIpBlackSchema);