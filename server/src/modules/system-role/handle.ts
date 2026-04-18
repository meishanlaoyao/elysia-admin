import { Context } from 'elysia';
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
import { logger } from '@/shared/logger';
import { WithCache } from '@/core/cache';
import { CacheEnum } from '@/constants/enum';
import { RunTransaction } from '@/core/database/transaction';
import { RefreshRoutes } from '@/modules/system-menu/handle';
import { Keys, Get, Set as RedisSet } from '@/core/database/redis';
import { systemUserRoleSchema } from '@database/schema/system_user';
import { GetMenuPermissionByRoleIds } from '@/modules/system-menu/handle';
import { systemRoleSchema, systemRoleMenuSchema } from '@database/schema/system_role';

export async function create(ctx: Context) {
    try {
        await InsertOne(systemRoleSchema, ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(ctx: Context) {
    try {
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
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOptions() {
    try {
        const data = await WithCache(
            CacheEnum.BASE_OPTIONS + 'systemRole',
            async () => {
                const where = CreateQueryBuilder(systemRoleSchema).eq('delFlag', false).build();
                return await FindAll(systemRoleSchema, where);
            }
        );
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOnePermission(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const where = CreateQueryBuilder(systemRoleMenuSchema)
            .eq('roleId', id)
            .build();
        const data = await FindAll(systemRoleMenuSchema, where);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(systemRoleSchema, 'roleId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        await UpdateByKey(systemRoleSchema, 'roleId', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updatePermission(ctx: Context) {
    try {
        const { roleId, permissions } = ctx.body as {
            roleId: number;
            permissions: Array<{ menuId: number; menuBtnId?: number }>
        };
        await RunTransaction(async (tx) => {
            // 删除该角色的所有权限关联（硬删除）
            await tx.delete(systemRoleMenuSchema).where(eq(systemRoleMenuSchema.roleId, roleId));
            // 批量插入新的权限关联
            if (permissions && permissions.length > 0) {
                const createBy = (ctx as any)?.user?.userId || null;
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
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        await SoftDeleteByKeys(systemRoleSchema, 'roleId', ctx);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 获取用户角色IDs
export async function GetUserRoleIds(userId: number): Promise<number[]> {
    if (!userId) return [];
    try {
        const userRoleWhere = CreateQueryBuilder(systemUserRoleSchema).eq('userId', userId).build();
        const userRoleData = await FindAll(systemUserRoleSchema, userRoleWhere);
        const roleIds = userRoleData.map(item => item.roleId).filter(Boolean) as number[];
        return roleIds;
    } catch (error) {
        logger.error('获取用户角色IDs失败:' + error);
        return [];
    }
};

// 获取用户角色和权限
export async function GetUserRoleAndPermission(userId: number): Promise<{
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
        logger.error('获取用户角色和权限失败:' + error);
        return backData;
    }
};

// 获取角色菜单Ids和按钮Ids
export async function GetRoleMenuIdsAndBtnIds(userId: number) {
    try {
        const roleIds = await GetUserRoleIds(userId);
        const roleMenuWhere = CreateQueryBuilder(systemRoleMenuSchema).in('roleId', roleIds).build();
        const roleMenuData = await FindAll(systemRoleMenuSchema, roleMenuWhere);
        const menuIds = new Set(roleMenuData.map(item => item.menuId).filter(Boolean) as number[]);
        const menuBtnIds = new Set(roleMenuData.map(item => item.menuBtnId).filter(Boolean) as number[]);
        return {
            menuIds: [...menuIds],
            menuBtnIds: [...menuBtnIds],
        };
    } catch (error) {
        logger.error('获取角色菜单Ids失败:' + error);
        return {
            menuIds: [],
            menuBtnIds: [],
        };
    }
};

// 批量更新在线用户的权限
async function updateUserPermission(roleId: number) {
    try {
        const userKeys = await Keys(CacheEnum.ONLINE_USER + '*') || [];
        if (!userKeys?.length) return;
        const roleInfo = await FindOneByKey(systemRoleSchema, 'roleId', roleId);
        if (!roleInfo) return;
        userKeys.forEach(async (key) => {
            const userInfo = await Get(key);
            if (!userInfo) return;
            if (!userInfo?.roles?.includes(roleInfo?.roleCode)) return;
            const { roles, permissions } = await GetUserRoleAndPermission(userInfo?.userId);
            userInfo.roles = roles;
            userInfo.permissions = permissions;
            await RedisSet(key, userInfo);
            await RefreshRoutes(userInfo?.userId);
        });
    } catch (error) {
        logger.error('批量更新在线用户的权限失败:' + error);
        throw error;
    }
};