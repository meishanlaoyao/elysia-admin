import { pgTable, bigserial, varchar, boolean, bigint, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { BaseSchema } from '@/common/schema';
import { systemApiSchema } from './system_api';

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
        keepAlive: boolean('keep_alive').default(true), // 是否缓存
        fixedTab: boolean('fixed_tab').default(false), // 是否固定标签页
        activePath: varchar('active_path', { length: 255 }), // 激活路径
        sort: integer('sort').default(0), // 排序
        parentId: bigint('parent_id', { mode: 'number' }), // 父菜单ID
        ...BaseSchema,
    }
);
export const InsertSystemMenu = createInsertSchema(systemMenuSchema);
export const SelectSystemMenu = createSelectSchema(systemMenuSchema);

export const systemMenuApiSchema = pgTable(
    'system_menu_api',
    {
        menuId: bigint('menu_id', { mode: 'number' }).references(() => systemMenuSchema.menuId), // 菜单ID
        apiId: bigint('api_id', { mode: 'number' }).references(() => systemApiSchema.apiId), // APIID
        title: varchar('title', { length: 64 }), // 权限名称
    }
);
export const InsertSystemMenuApi = createInsertSchema(systemMenuApiSchema);
export const SelectSystemMenuApi = createSelectSchema(systemMenuApiSchema);