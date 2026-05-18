import type { AppContext } from '@/types/app-context';
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
import { systemMenuSchema, systemMenuBtnSchema } from '@database/schema/system_menu';
import { systemRoleMenuSchema } from '@database/schema/system_role';
import { ListToTree } from '@/core/function';
import { WithCache } from '@/core/cache';
import { CacheEnum } from '@/constants/enum';
import { logger } from '@/shared/logger';
import { Keys, Del, Set as RedisSet } from '@/core/database/redis';
import { GetRoleMenuIdsAndBtnIds } from '@/modules/system-role/handle';

export async function createMenu(ctx: AppContext) {
    try {
        await InsertOne(systemMenuSchema, ctx);
        await invalidateAdminMenuCache();
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function createMenuBtn(ctx: AppContext) {
    try {
        await InsertOne(systemMenuBtnSchema, ctx);
        await invalidateAdminMenuCache();
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findSimple(ctx: AppContext) {
    try {
        const { userId } = (ctx as any)?.user;
        const data = await WithCache(CacheEnum.ADMIN_MENU + userId, async () => loadUserMenuTree(userId));
        return BaseResultData.ok(data);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findTree(ctx: AppContext) {
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

export async function updateMenu(ctx: AppContext) {
    try {
        await UpdateByKey(systemMenuSchema, 'menuId', ctx);
        await invalidateAdminMenuCache();
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateMenuBtn(ctx: AppContext) {
    try {
        await UpdateByKey(systemMenuBtnSchema, 'btnId', ctx);
        await invalidateAdminMenuCache();
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenu(ctx: AppContext) {
    try {
        await SoftDeleteByKeys(systemMenuSchema, 'menuId', ctx);
        await invalidateAdminMenuCache();
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function removeMenuBtn(ctx: AppContext) {
    try {
        await SoftDeleteByKeys(systemMenuBtnSchema, 'btnId', ctx);
        await invalidateAdminMenuCache();
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
        if (menuBtnIds.size === 0) return [];
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
export function handleMenuListToTree(
    menuList: typeof systemMenuSchema.$inferSelect[],
    menuBtnList?: typeof systemMenuBtnSchema.$inferSelect[]
) {
    if (!menuList || menuList.length === 0) return [];
    const menuBtnMap = new Map<number, Array<{ title: string; authMark: string }>>();
    if (menuBtnList && menuBtnList.length > 0) {
        for (const btn of menuBtnList) {
            if (btn.menuId) {
                const authList = menuBtnMap.get(btn.menuId);
                if (authList) {
                    authList.push({
                        title: btn.title || '',
                        authMark: btn.permission || ''
                    });
                } else {
                    menuBtnMap.set(btn.menuId, [{
                        title: btn.title || '',
                        authMark: btn.permission || ''
                    }]);
                }
            }
        }
    };
    const menuMap = new Map<number, any>();
    menuList.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    for (const menu of menuList) {
        const menuNode: any = {
            name: menu.name,
            path: menu.path,
            component: menu.component,
            meta: { title: menu.title, }
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
        const authList = menuBtnMap.get(menu.menuId);
        if (authList) menuNode.meta.authList = authList;
        menuNode.children = [];
        menuMap.set(menu.menuId, menuNode);
    };
    const rootMenus: any[] = [];
    for (const menu of menuList) {
        const menuNode = menuMap.get(menu.menuId);
        if (menu.parentId === null || menu.parentId === undefined || menu.parentId === 0) {
            rootMenus.push(menuNode);
        } else {
            const parentNode = menuMap.get(menu.parentId);
            if (parentNode) parentNode.children.push(menuNode);
        };
    };
    for (const node of menuMap.values()) {
        if (node.children && node.children.length === 0) {
            delete node.children;
        }
    };
    return rootMenus;
};

// 刷新缓存菜单树
export async function RefreshRoutes(userId: number) {
    try {
        const data = await loadUserMenuTree(userId);
        await RedisSet(CacheEnum.ADMIN_MENU + userId, data);
    } catch (error) {
        logger.error('刷新缓存菜单树失败:' + error);
        throw error;
    }
};

/** 加载用户可见菜单树（未删除且已启用） */
async function loadUserMenuTree(userId: number) {
    const { menuBtnIds, menuIds } = await GetRoleMenuIdsAndBtnIds(userId);
    if (!menuIds.length) return [];
    const menuWhere = CreateQueryBuilder(systemMenuSchema)
        .in('menuId', [...menuIds])
        .eq('delFlag', false)
        .eq('status', true)
        .build();
    const menuData = await FindAll(systemMenuSchema, menuWhere, {
        orderByColumn: 'sort',
        sortRule: 'desc',
    });
    const menuBtnBuilder = CreateQueryBuilder(systemMenuBtnSchema)
        .eq('delFlag', false)
        .eq('status', true);
    if (menuBtnIds.length) menuBtnBuilder.in('btnId', [...menuBtnIds]);
    const menuBtnData = menuBtnIds.length
        ? await FindAll(systemMenuBtnSchema, menuBtnBuilder.build())
        : [];
    return handleMenuListToTree(menuData, menuBtnData);
};

/** 清除所有用户的侧边栏菜单缓存 */
export async function invalidateAdminMenuCache() {
    const keys = await Keys(CacheEnum.ADMIN_MENU + '*') || [];
    if (keys.length) await Del(keys);
};