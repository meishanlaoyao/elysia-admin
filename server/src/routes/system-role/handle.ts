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
import { systemRoleSchema, systemRoleMenuSchema } from '@/schema/system_role';

export async function create(req: Context) {
    try {
        const data = req.body as typeof systemRoleSchema.$inferInsert;
        await InsertOne(systemRoleSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(req: Context) {
    try {
        const {
            pageNum = 1,
            pageSize = 10,
            orderByColumn = "createTime",
            sortRule = "desc",
            startTime,
            endTime,
            roleName,
            roleCode,
            status,
        } = req.query;
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

export async function findOnePermission(req: Context) {
    try {
        const id = Number(req.params.id);
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

export async function findOne(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await FindOneByKey(systemRoleSchema, 'roleId', id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(req: Context) {
    try {
        const data = ParseDateFields(req.body);
        await UpdateByKey(systemRoleSchema, 'roleId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updatePermission(req: Context) {
    try {
        const { roleId, permissions } = req.body as {
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

export async function remove(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemRoleSchema, 'roleId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};