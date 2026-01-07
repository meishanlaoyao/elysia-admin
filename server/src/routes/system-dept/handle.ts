import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
} from '@/common/db';
import { ParseDateFields } from '@/common/dto';
import { systemDeptSchema } from '@/schema/system_dept';
import { listToTree } from '@/common/function';

export async function create(req: Context) {
    try {
        const data = req.body as typeof systemDeptSchema.$inferInsert;
        await InsertOne(systemDeptSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findTree(req: Context) {
    try {
        const {
            deptName,
        } = req.query;
        const where = CreateQueryBuilder(systemDeptSchema)
            .eq('delFlag', false)
            .like('deptName', deptName)
            .build();
        const data = await FindAll(systemDeptSchema, where);
        const tree = listToTree(data, {
            idKey: 'deptId',
            parentKey: 'parentId',
            childrenKey: 'children',
            rootValue: 0,
            sortKey: 'sort',
        });
        return BaseResultData.ok(tree);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(req: Context) {
    try {
        const data = ParseDateFields(req.body);
        await UpdateByKey(systemDeptSchema, 'deptId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDeptSchema, 'deptId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};