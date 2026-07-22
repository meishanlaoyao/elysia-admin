import type { AppContext } from '@/types/app-context';
import { eq } from 'drizzle-orm';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll,
} from '@/core/database/repository';
import { logServerError } from '@/shared/server-error';
import { WithCache } from '@/core/cache';
import { CacheEnum } from '@/constants/enum';
import { RunTransaction } from '@/core/database/transaction';
import { Get, Set as RedisSet, Del } from '@/core/database/redis';
import { DeleteOnlineUserL1 } from '@/shared/online-user-l1';
import { systemUserRoleSchema } from '@database/schema/system_user';
import { GetMenuPermissionByRoleIds } from '@/modules/system-menu/handle';
import { systemRoleSchema, systemRoleMenuSchema } from '@database/schema/system_role';

export async function create(ctx: AppContext) {
    await InsertOne(systemRoleSchema, ctx);
    return BaseResultData.ok();
};

export async function findList(ctx: AppContext) {
    const {
        pageNum = 1,
        pageSize = 10,
        orderByColumn = "sort",
        sortRule = "asc",
        startTime,
        endTime,
        roleName,
        roleCode,
        status,
    } = ctx.query;
    let Zstatus = undefined;
    if (status) {
        Zstatus = status === 'false' ? false : true;
    }
    const whereCondition = CreateQueryBuilder(systemRoleSchema)
        .eq('delFlag', false)
        .eq('status', Zstatus)
        .like('roleName', roleName)
        .like('roleCode', roleCode)
        .dateRange('createTime', startTime, endTime)
        .build();
    const res = await FindPage(systemRoleSchema, whereCondition, {
        pageNum,
        pageSize,
        orderByColumn,
        sortRule
    });
    return BaseResultData.ok(res);
};

export async function findOptions() {
    const data = await WithCache(
        CacheEnum.BASE_OPTIONS + 'systemRole',
        async () => {
            const where = CreateQueryBuilder(systemRoleSchema).eq('delFlag', false).build();
            return await FindAll(systemRoleSchema, where);
        }
    );
    return BaseResultData.ok(data);
};

export async function findOnePermission(ctx: AppContext) {
    const id = Number(ctx.params.id);
    const where = CreateQueryBuilder(systemRoleMenuSchema)
        .eq('roleId', id)
        .build();
    const data = await FindAll(systemRoleMenuSchema, where);
    return BaseResultData.ok(data);
};

export async function findOne(ctx: AppContext) {
    const id = Number(ctx.params.id);
    const data = await FindOneByKey(systemRoleSchema, 'roleId', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
};

export async function update(ctx: AppContext) {
    await UpdateByKey(systemRoleSchema, 'roleId', ctx);
    return BaseResultData.ok();
};

export async function updatePermission(ctx: AppContext) {
    const { roleId, permissions } = ctx.body as {
        roleId: number;
        permissions: Array<{ menuId: number; menuBtnId?: number }>
    };
    await RunTransaction(async (tx) => {
        // 删除该角色的所有权限关联（硬删除）
        await tx.delete(systemRoleMenuSchema).where(eq(systemRoleMenuSchema.roleId, roleId));
        // 批量插入新的权限关联
        if (permissions && permissions.length > 0) {
            const createBy = ctx?.user?.userId || null;
            const insertData = permissions.map(perm => ({
                roleId,
                menuId: perm.menuId,
                menuBtnId: perm.menuBtnId || null,
                ...(createBy ? { createBy } : {})
            }));
            await tx.insert(systemRoleMenuSchema).values(insertData);
        }
    });
    await updateUserPermission(roleId);
    return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(systemRoleSchema, 'roleId', ctx);
    return BaseResultData.ok();
};

// 获取用户角色IDs
export async function GetUserRoleIds(userId: string): Promise<number[]> {
    if (!userId) return [];
    try {
        const userRoleWhere = CreateQueryBuilder(systemUserRoleSchema).eq('userId', userId).build();
        const userRoleData = await FindAll(systemUserRoleSchema, userRoleWhere);
        const roleIds = userRoleData.map(item => item.roleId).filter(Boolean) as number[];
        return roleIds;
    } catch (error) {
        logServerError('获取用户角色IDs失败', error);
        return [];
    }
};

// 获取用户角色和权限
export async function GetUserRoleAndPermission(userId: string): Promise<{
    roles: string[];
    permissions: string[];
}> {
    const backData = {
        roles: [] as string[],
        permissions: [] as string[],
    };
    if (!userId) return backData;
    try {
        const roleIds = await GetUserRoleIds(userId);
        if (!roleIds?.length) return backData;
        const roleWhere = CreateQueryBuilder(systemRoleSchema).in('roleId', roleIds).build();
        const roleData = await FindAll(systemRoleSchema, roleWhere);
        backData.roles = roleData.map(item => item.roleCode);
        backData.permissions = await GetMenuPermissionByRoleIds(roleIds);
        return backData;
    } catch (error) {
        logServerError('获取用户角色和权限失败', error);
        return backData;
    }
};

/** 按需加载用户权限码（USER_PERM 缓存） */
export async function GetOrLoadUserPermissions(userId: string): Promise<string[]> {
    if (!userId) return [];
    const cached = await Get(CacheEnum.USER_PERM + userId);
    if (Array.isArray(cached)) return cached;
    const { permissions } = await GetUserRoleAndPermission(userId);
    await RedisSet(CacheEnum.USER_PERM + userId, permissions);
    return permissions;
};

/** 失效用户权限与菜单缓存（本机 L1 一并清理） */
export async function InvalidateUserPermissionCache(userId: string): Promise<void> {
    if (!userId) return;
    await Del(CacheEnum.USER_PERM + userId);
    await Del(CacheEnum.ADMIN_MENU + userId);
    DeleteOnlineUserL1(userId);
};

// 获取角色菜单Ids和按钮Ids
export async function GetRoleMenuIdsAndBtnIds(userId: string) {
    try {
        const roleIds = await GetUserRoleIds(userId);
        if (roleIds.length === 0) return { menuIds: [], menuBtnIds: [] };
        const roleMenuWhere = CreateQueryBuilder(systemRoleMenuSchema).in('roleId', roleIds).build();
        const roleMenuData = await FindAll(systemRoleMenuSchema, roleMenuWhere);
        const menuIds = new Set(
            roleMenuData
                .filter(item => item.menuId != null && item.menuBtnId == null)
                .map(item => item.menuId as number)
        );
        const menuBtnIds = new Set(
            roleMenuData
                .filter(item => item.menuBtnId != null)
                .map(item => item.menuBtnId as number)
        );
        return {
            menuIds: [...menuIds],
            menuBtnIds: [...menuBtnIds],
        };
    } catch (error) {
        logServerError('获取角色菜单Ids失败', error);
        return {
            menuIds: [],
            menuBtnIds: [],
        };
    }
};

/** 角色权限变更后：仅失效绑定该角色的用户权限缓存 */
async function updateUserPermission(roleId: number) {
    try {
        const where = CreateQueryBuilder(systemUserRoleSchema).eq('roleId', roleId).build();
        const rows = await FindAll(systemUserRoleSchema, where);
        for (const row of rows) {
            if (!row.userId) continue;
            await InvalidateUserPermissionCache(row.userId);
        }
    } catch (error) {
        logServerError('失效角色关联用户权限缓存失败', error);
        throw error;
    }
};
