import { pgTable, bigserial, varchar, boolean, bigint, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';

export const systemMenuSchema = pgTable(
    'system_menu',
    {
        menuId: bigserial('menu_id', { mode: 'number' }).primaryKey(), // 菜单ID
        path: varchar('path', { length: 255 }), // 路径
        name: varchar('name', { length: 64 }), // 名称
        component: varchar('component', { length: 255 }), // 组件路径
        title: varchar('title', { length: 64 }), // 路由标题
        icon: varchar('icon', { length: 64 }), // 图标
        showBadge: boolean('show_badge').default(false), // 是否显示徽章
        showTextBadge: varchar('show_text_badge', { length: 64 }), // 文本徽章
        isHide: boolean('is_hide').default(false), // 是否隐藏
        isHideTab: boolean('is_hide_tab').default(false), // 是否在标签页中隐藏
        link: varchar('link', { length: 255 }), // 外部链接
        isIframe: boolean('is_iframe').default(false), // 是否为iframe
        isFullPage: boolean('is_full_page').default(false), // 是否为全屏页面
        keepAlive: boolean('keep_alive').default(true), // 是否缓存
        fixedTab: boolean('fixed_tab').default(false), // 是否固定标签页
        activePath: varchar('active_path', { length: 255 }), // 激活路径
        sort: integer('sort').default(0), // 排序
        status: boolean('status').default(true), // 状态
        parentId: bigint('parent_id', { mode: 'number' }), // 父菜单ID
        ...BaseSchema,
    }
);
export const InsertSystemMenu = createInsertSchema(systemMenuSchema);
export const SelectSystemMenu = createSelectSchema(systemMenuSchema);

export const systemMenuBtnSchema = pgTable(
    'system_menu_btn',
    {
        btnId: bigserial('btn_id', { mode: 'number' }).primaryKey(), // 按钮ID
        menuId: bigint('menu_id', { mode: 'number' }).references(() => systemMenuSchema.menuId), // 菜单ID
        title: varchar('title', { length: 64 }), // 权限名称
        sort: integer('sort').default(0), // 排序
        status: boolean('status').default(true), // 状态
        permission: varchar('permission', { length: 64 }), // 权限标识
        ...BaseSchema,
    }
);
export const InsertSystemMenuBtn = createInsertSchema(systemMenuBtnSchema);
export const SelectSystemMenuBtn = createSelectSchema(systemMenuBtnSchema);