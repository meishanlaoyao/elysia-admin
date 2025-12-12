import { bigint, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

/**
 * 基础字段
 */
export const BaseSchema = {
    createTime: timestamp('create_time').defaultNow(), // 创建时间
    createBy: bigint('create_by', { mode: 'number' }), // 创建人
    updateTime: timestamp('update_time'), // 更新时间
    updateBy: bigint('update_by', { mode: 'number' }), // 更新人
    delFlag: boolean('del_flag').default(false), // 删除标志
    remark: varchar('remark', { length: 255 }), // 备注
};  