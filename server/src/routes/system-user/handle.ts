import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { systemUserSchema } from '@/schema/system_user';
import { BcryptHash } from '@/common/bcrypt';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
    FindAll
} from '@/common/db';

export async function create(req: Context) {
    try {
        const data = req.body as typeof systemUserSchema.$inferInsert;
        data.password = BcryptHash(data.password);
        await InsertOne(systemUserSchema, data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findAll() {
    try {
        const where = CreateQueryBuilder(systemUserSchema).eq('delFlag', false).build();
        const data = await FindAll(systemUserSchema, where);
        return BaseResultData.ok(data.map(({ password, ...item }) => ({ ...item })));
    } catch (error) {
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
            username,
            nickname,
            email,
            phone,
            sex
        } = req.query;
        const whereCondition = CreateQueryBuilder(systemUserSchema)
            .eq('delFlag', false)
            .eq('email', email)
            .eq('phone', phone)
            .eq('sex', sex)
            .like('username', username)
            .like('nickname', nickname)
            .dateRange('createTime', startTime, endTime)
            .build();
        const { list, total } = await FindPage(systemUserSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });
        const safeList = list.map(({ password, ...item }) => ({ ...item }));
        return BaseResultData.ok({ list: safeList, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOne(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = await FindOneByKey(systemUserSchema, systemUserSchema.userId, id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        const { password, ...item } = data;
        return BaseResultData.ok(item);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(req: Context) {
    try {
        const id = Number(req.params.id);
        const data = req.body as typeof systemUserSchema.$inferSelect;
        if (data.password) data.password = BcryptHash(data.password);
        await UpdateByKey(systemUserSchema, systemUserSchema.userId, id, data);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(req: Context) {
    try {
        const ids = req.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemUserSchema, systemUserSchema.userId, ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};