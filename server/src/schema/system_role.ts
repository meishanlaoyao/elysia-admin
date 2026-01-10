import { pgTable, bigserial, varchar, boolean, bigint, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';
import { systemMenuSchema, systemMenuBtnSchema } from './system_menu';

export const systemRoleSchema = pgTable(
    'system_role',
    {
        roleId: bigserial('role_id', { mode: 'number' }).primaryKey(), // 角色ID
        roleName: varchar('role_name', { length: 64 }).notNull(), // 角色名称
        roleCode: varchar('role_code', { length: 64 }).notNull(), // 角色编码
        sort: integer('sort').default(0), // 排序
        status: boolean('status').default(true), // 状态
        ...BaseSchema,
    }
);
export const InsertSystemRole = createInsertSchema(systemRoleSchema);
export const SelectSystemRole = createSelectSchema(systemRoleSchema);

export const systemRoleMenuSchema = pgTable(
    'system_role_menu',
    {
        roleId: bigint('role_id', { mode: 'number' }).references(() => systemRoleSchema.roleId), // 角色ID
        menuId: bigint('menu_id', { mode: 'number' }).references(() => systemMenuSchema.menuId), // 菜单ID
        menuBtnId: bigint('menu_btn_id', { mode: 'number' }).references(() => systemMenuBtnSchema.btnId), // 按钮ID
    }
);
export const InsertSystemRoleMenu = createInsertSchema(systemRoleMenuSchema);
export const SelectSystemRoleMenu = createSelectSchema(systemRoleMenuSchema);