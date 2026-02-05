import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
} from '@/core/database/repository';
import { CacheEnum } from '@/constants/enum';
import { WithCache } from '@/core/cache';
import { ParseDateFields } from '@/types/dto';
import { systemDeptSchema } from 'database/schema/system_dept';
import { listToTree } from '@/core/function';

export async function create(ctx: Context) {
    try {
        const data = ctx.body as typeof systemDeptSchema.$inferInsert;
        await InsertOne(systemDeptSchema, data);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findTree(ctx: Context) {
    try {
        const {
            deptName,
        } = ctx.query;
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

export async function findOptions() {
    try {
        const data = await WithCache(
            CacheEnum.BASE_OPTIONS + 'systemDeptTree',
            async () => {
                const where = CreateQueryBuilder(systemDeptSchema)
                    .eq('delFlag', false)
                    .build();
                const list = await FindAll(systemDeptSchema, where);
                const tree = listToTree(list, {
                    idKey: 'deptId',
                    parentKey: 'parentId',
                    childrenKey: 'children',
                    rootValue: 0,
                    sortKey: 'sort',
                });
                return tree;
            }
        );
        return BaseResultData.ok(data);
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(systemDeptSchema, 'deptId', data, true);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemDeptSchema, 'deptId', ids);
        return BaseResultData.ok();
    }
    catch (error) {
        return BaseResultData.fail(500, error);
    }
};