import { pgTable, varchar, boolean, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from 'database/base-schema';

export const wxmpUserSchema = pgTable(
    'wxmp_user',
    {
        userId: uuid('user_id').primaryKey().defaultRandom(), // 用户ID
        openId: varchar('open_id', { length: 64 }).notNull().unique(), // 微信OpenID
        unionId: varchar('union_id', { length: 64 }), // 微信UnionID
        sessionKey: varchar('session_key', { length: 128 }), // 微信SessionKey
        username: varchar('username', { length: 64 }), // 用户名
        nickname: varchar('nickname', { length: 64 }), // 昵称
        phone: varchar('phone', { length: 20 }), // 手机号
        sex: varchar('sex', { length: 1 }).default('0'), // 性别 0未知 1男 2女
        avatar: varchar('avatar', { length: 255 }), // 头像
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);

export const InsertWxmpUser = createInsertSchema(wxmpUserSchema);
export const SelectWxmpUser = createSelectSchema(wxmpUserSchema);