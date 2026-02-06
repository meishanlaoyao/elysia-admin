import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
    FindAllWithJoin,
} from '@/core/database/repository';
import { ParseDateFields } from '@/types/dto';
import { systemMenuSchema, systemMenuBtnSchema } from 'database/schema/system_menu';
import { systemRoleMenuSchema } from 'database/schema/system_role';
import { ListToTree } from '@/core/function';
import { WithCache } from '@/core/cache';
import { CacheEnum } from '@/constants/enum';
import { logger } from '@/shared/logger';
import { GetRoleMenuIds } from '@/modules/system-role/handle';

export async function createMenu(ctx: Context) {
    try {
        const data = ctx.body as typeof systemMenuSchema.$inferInsert;
        await InsertOne(systemMenuSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createMenuBtn(ctx: Context) {
    try {
        const data = ctx.body as typeof systemMenuBtnSchema.$inferInsert;
        await InsertOne(systemMenuBtnSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findSimple(ctx: Context) {
    try {
        const { userId } = (ctx as any)?.user;
        const data = await WithCache(CacheEnum.ADMIN_MENU + userId, async () => {
            const menuIds = await GetRoleMenuIds(userId);
            const menuWhere = CreateQueryBuilder(systemMenuSchema).in('menuId', [...menuIds]).build();
            const menuData = await FindAll(systemMenuSchema, menuWhere);
            return handleMenuListToTree(menuData);
        });
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findTree(ctx: Context) {
    try {
        const {
            title,
            path,
        } = ctx.query;
        const builder = CreateQueryBuilder(systemMenuSchema)
            .eq('delFlag', false)
            .like('title', title)
            .like('path', path)
            .join({
                joinSchema: systemMenuBtnSchema,
                fieldName: 'authList',
                foreignKey: 'menuId',
                primaryKey: 'menuId',
                defaultValue: [],
                where: eq(systemMenuBtnSchema.delFlag, false),
                multiple: true
            });
        const data = await FindAllWithJoin(systemMenuSchema, builder);
        const tree = ListToTree(data, {
            idKey: 'menuId',
            parentKey: 'parentId',
            childrenKey: 'children',
            rootValue: 0,
            sortKey: 'sort',
        });
        return BaseResultData.ok(tree);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateMenu(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemMenuSchema, 'menuId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateMenuBtn(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemMenuBtnSchema, 'btnId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenu(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemMenuSchema, 'menuId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenuBtn(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemMenuBtnSchema, 'btnId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 根据角色IDS获取菜单权限
export async function GetMenuPermissionByRoleIds(roleIds: number[]): Promise<string[]> {
    try {
        const roleMenuWhere = CreateQueryBuilder(systemRoleMenuSchema).in('roleId', roleIds).build();
        const roleMenu = await FindAll(systemRoleMenuSchema, roleMenuWhere);
        const menuBtnIds = new Set(roleMenu.map(item => item.menuBtnId).filter(id => id !== null));
        const menuBtnWhere = CreateQueryBuilder(systemMenuBtnSchema).in('btnId', [...menuBtnIds]).build();
        const menuBtns = await FindAll(systemMenuBtnSchema, menuBtnWhere);
        const permission = new Set(menuBtns.map(item => item.permission).filter(per => per !== null));
        if (permission.size) return [...permission];
        return [];
    }
    catch (error) {
        logger.error('根据角色IDS获取菜单权限失败:' + error);
        return [];
    }
};

// 把菜单列表转成后台生成菜单的树
export function handleMenuListToTree(menuList: typeof systemMenuSchema.$inferSelect[]) {
    if (!menuList || menuList.length === 0) return [];
    const menuMap = new Map<number, any>();
    const rootMenus: any[] = [];
    const sortedMenuList = [...menuList].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    sortedMenuList.forEach(menu => {
        const menuNode: any = {
            name: menu.name,
            path: menu.path,
            component: menu.component,
            meta: {
                title: menu.title,
            }
        };
        if (menu.icon) menuNode.meta.icon = menu.icon;
        if (menu.keepAlive !== null && menu.keepAlive !== undefined) menuNode.meta.keepAlive = menu.keepAlive;
        if (menu.fixedTab) menuNode.meta.fixedTab = menu.fixedTab;
        if (menu.isHide) menuNode.meta.isHide = menu.isHide;
        if (menu.isHideTab) menuNode.meta.isHideTab = menu.isHideTab;
        if (menu.isFullPage) menuNode.meta.isFullPage = menu.isFullPage;
        if (menu.showBadge) menuNode.meta.showBadge = menu.showBadge;
        if (menu.showTextBadge) menuNode.meta.showTextBadge = menu.showTextBadge;
        if (menu.link) menuNode.meta.link = menu.link;
        if (menu.isIframe) menuNode.meta.isIframe = menu.isIframe;
        if (menu.activePath) menuNode.meta.activePath = menu.activePath;
        menuMap.set(menu.menuId, menuNode);
        if (menu.parentId === null || menu.parentId === undefined || menu.parentId === 0) {
            rootMenus.push(menuNode);
        } else {
            const parentNode = menuMap.get(menu.parentId);
            if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push(menuNode);
            };
        };
    });
    return rootMenus;
};