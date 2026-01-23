import { pgTable, bigserial, varchar, boolean, bigint } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemLoginLogSchema = pgTable(
    'system_login_log',
    {
        logId: bigserial('log_id', { mode: 'number' }).primaryKey(), // 登录日志 ID
        userId: bigint('user_id', { mode: 'number' }), // 用户 ID
        loginType: varchar('login_type', { length: 32 }), // 登录类型 admin / user
        clientType: varchar('client_type', { length: 32 }), // 客户端类型
        clientPlatform: varchar('client_platform', { length: 32 }), // 客户端平台
        ipaddr: varchar('ipaddr', { length: 128 }), // IP 地址
        loginLocation: varchar('login_location', { length: 256 }), // 登录地点
        userAgent: varchar('user_agent', { length: 512 }), // 用户代理
        os: varchar('os', { length: 64 }), // 操作系统
        message: varchar('message', { length: 255 }), // 提示消息
        status: boolean('status'), // 登录状态
        ...BaseSchema,
    }
);

export const InsertSystemLoginLog = createInsertSchema(systemLoginLogSchema);
export const SelectSystemLoginLog = createSelectSchema(systemLoginLogSchema);