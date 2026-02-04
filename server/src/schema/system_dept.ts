import { pgTable, bigserial, varchar, boolean, bigint, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/pg/schema';

export const systemDeptSchema = pgTable(
    'system_dept',
    {
        deptId: bigserial('dept_id', { mode: 'number' }).primaryKey(), // 部门ID
        deptName: varchar('dept_name', { length: 64 }).notNull(), // 部门名称
        status: boolean('status').default(true), // 状态
        parentId: bigint('parent_id', { mode: 'number' }), // 父部门ID
        sort: integer('sort').default(0), // 排序
        ...BaseSchema,
    }
);

export const InsertSystemDept = createInsertSchema(systemDeptSchema);
export const SelectSystemDept = createSelectSchema(systemDeptSchema);