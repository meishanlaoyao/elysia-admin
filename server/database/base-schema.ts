import { timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

/**
 * 基础字段
 */
export const BaseSchema = {
    createTime: timestamp('create_time', { withTimezone: true }).defaultNow(), // 创建时间
    createBy: varchar('create_by', { length: 36 }), // 创建人ID（UUID）
    updateTime: timestamp('update_time', { withTimezone: true }), // 更新时间
    updateBy: varchar('update_by', { length: 36 }), // 更新人ID（UUID）
    delFlag: boolean('del_flag').default(false), // 删除标志
    remark: varchar('remark', { length: 255 }), // 备注
};