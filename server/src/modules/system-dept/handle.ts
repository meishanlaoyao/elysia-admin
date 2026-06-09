import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindAll,
    FindOneByKey,
} from '@/core/database/repository';
import { CacheEnum } from '@/constants/enum';
import { WithCache } from '@/core/cache';
import { systemDeptSchema } from '@database/schema/system_dept';
import { ListToTree } from '@/core/function';

export async function create(ctx: AppContext) {
    await InsertOne(systemDeptSchema, ctx);
    return BaseResultData.ok();
};

export async function findTree(ctx: AppContext) {
    const { deptName, } = ctx.query;
    const where = CreateQueryBuilder(systemDeptSchema)
        .eq('delFlag', false)
        .like('deptName', deptName)
        .build();
    const data = await FindAll(systemDeptSchema, where);
    const tree = ListToTree(data, {
        idKey: 'deptId',
        parentKey: 'parentId',
        childrenKey: 'children',
        rootValue: 0,
        sortKey: 'sort',
    });
    return BaseResultData.ok(tree);
};

export async function findOptions() {
    const data = await WithCache(
        CacheEnum.BASE_OPTIONS + 'systemDeptTree',
        async () => {
            const where = CreateQueryBuilder(systemDeptSchema)
                .eq('delFlag', false)
                .build();
            const list = await FindAll(systemDeptSchema, where);
            const tree = ListToTree(list, {
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
};

export async function update(ctx: AppContext) {
    await UpdateByKey(systemDeptSchema, 'deptId', ctx);
    return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(systemDeptSchema, 'deptId', ctx);
    return BaseResultData.ok();
};

// 根据部门ID查询部门信息
export async function GetDeptInfoById(deptId: number) {
    return await FindOneByKey(systemDeptSchema, 'deptId', deptId);
};