import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { systemRoleSchema } from '@/schema/system_role';

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