import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll,
    InsertMany,
    HardDelete
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { CacheEnum } from '@/common/enum';
import { WithCache } from '@/common/cache';
import { systemRoleSchema, systemRoleMenuSchema } from '@/schema/system_role';
import { systemUserRoleSchema } from '@/schema/system_user';
import { GetMenuPermissionByRoleIds } from '@/routes/system-menu/handle';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemRoleSchema.$inferInsert;
        await InsertOne(systemRoleSchema, data);
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
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemRoleSchema, 'roleId', data, true);
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

        // 删除该角色的所有权限关联（硬删除）
        await HardDelete(systemRoleMenuSchema, eq(systemRoleMenuSchema.roleId, roleId));

        // 批量插入新的权限关联
        if (permissions && permissions.length > 0) {
            const insertData = permissions.map(perm => ({
                roleId,
                menuId: perm.menuId,
                menuBtnId: perm.menuBtnId || null
            }));
            await InsertMany(systemRoleMenuSchema, insertData);
        }

        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemRoleSchema, 'roleId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
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
        const userRoleWhere = CreateQueryBuilder(systemUserRoleSchema).eq('userId', userId).build();
        const userRoleData = await FindAll(systemUserRoleSchema, userRoleWhere);
        const roleIds = userRoleData.map(item => item.roleId).filter(Boolean) as number[];
        if (!roleIds?.length) return backData;
        const roleWhere = CreateQueryBuilder(systemRoleSchema).in('roleId', roleIds).build();
        const roleData = await FindAll(systemRoleSchema, roleWhere);
        backData.roles = roleData.map(item => item.roleCode);
        backData.permissions = await GetMenuPermissionByRoleIds(roleIds);
        return backData;
    } catch (error) {
        console.error('获取用户角色和权限失败:', error);
        return backData;
    }
};