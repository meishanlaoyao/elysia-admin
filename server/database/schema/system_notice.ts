import { pgTable, bigserial, varchar, boolean, integer, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@database/base-schema';

export const systemNoticeSchema = pgTable(
    'system_notice',
    {
        noticeId: bigserial('notice_id', { mode: 'number' }).primaryKey(), // 公告ID
        title: varchar('title', { length: 128 }).notNull(), // 公告标题
        noticeType: varchar('notice_type', { length: 32 }).notNull(), // 通知类型（字典：system_notice_type）
        content: text('content').notNull(), // 公告内容
        status: boolean('status').default(true), // 发布状态
        sort: integer('sort').default(0), // 排序
        ...BaseSchema,
    }
);

export const InsertSystemNotice = createInsertSchema(systemNoticeSchema);
export const SelectSystemNotice = createSelectSchema(systemNoticeSchema);