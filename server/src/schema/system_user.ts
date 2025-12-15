import { pgTable, bigserial, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemUserSchema = pgTable(
    'system_user',
    {
        userId: bigserial('user_id', { mode: 'number' }).primaryKey(), // 用户ID
        username: varchar('username', { length: 64 }).notNull().unique(), // 用户名
        password: varchar('password', { length: 255 }).notNull(), // 密码
        nickname: varchar('nickname', { length: 64 }), // 昵称
        email: varchar('email', { length: 64 }), // 邮箱
        phone: varchar('phone', { length: 11 }), // 手机号
        sex: varchar('sex', { length: 1 }).default('0'), // 性别 0未知 1男 2女
        avatar: varchar('avatar', { length: 255 }), // 头像
        status: boolean('status').default(true), // 状态 true正常 false停用
        ...BaseSchema,
    }
);
export const InsertSystemUser = createInsertSchema(systemUserSchema);
export const SelectSystemUser = createSelectSchema(systemUserSchema);