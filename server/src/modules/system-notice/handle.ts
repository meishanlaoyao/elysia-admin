import type { AppContext } from '@/types/app-context';
import { BaseResultData } from '@/core/result';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { systemNoticeSchema } from '@database/schema/system_notice';

export async function create(ctx: AppContext) {
    await InsertOne(systemNoticeSchema, ctx);
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
        title,
        noticeType,
        status,
    } = ctx.query;
    const whereCondition = CreateQueryBuilder(systemNoticeSchema)
        .eq('delFlag', false)
        .ilike('title', title)
        .eq('noticeType', noticeType)
        .eq('status', status)
        .dateRange('createTime', startTime, endTime)
        .build();
    const res = await FindPage(systemNoticeSchema, whereCondition, {
        pageNum,
        pageSize,
        orderByColumn,
        sortRule,
    });
    return BaseResultData.ok(res);
};

export async function findOne(ctx: AppContext) {
    const id = Number(ctx.params.id);
    const data = await FindOneByKey(systemNoticeSchema, 'noticeId', id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    return BaseResultData.ok(data);
};

export async function update(ctx: AppContext) {
    await UpdateByKey(systemNoticeSchema, 'noticeId', ctx);
    return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
    await SoftDeleteByKeys(systemNoticeSchema, 'noticeId', ctx);
    return BaseResultData.ok();
};