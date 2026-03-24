import { Context } from 'elysia';
import { eq } from 'drizzle-orm';
import { Get } from '@/core/database/redis';
import { CacheEnum } from '@/constants/enum';
import { BaseResultData } from '@/core/result';
import { systemUserSchema, systemUserRoleSchema } from '@database/schema/system_user';
import { BcryptHash, BcryptCompare } from '@/shared/bcrypt';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { ParseDateFields } from '@/types/dto';
import { GetUserRoleIds } from '@/modules/system-role/handle';
import { RunTransaction } from '@/core/database/transaction';
import { logger } from '@/shared/logger';
import { GetDeptInfoById } from '@/modules/system-dept/handle';

export async function create(ctx: Context) {
    try {
        const { roles, ...rest } = ctx.body as any;
        const data = rest as typeof systemUserSchema.$inferInsert;
        data.password = BcryptHash(data.password);
        await RunTransaction(async (tx) => {
            const [user] = await tx.insert(systemUserSchema).values(data).returning();
            if (!roles?.length) return;
            await tx.insert(systemUserRoleSchema).values(roles.map((roleId: number) => ({
                userId: user.userId,
                roleId
            })));
        });
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findList(ctx: Context) {
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
            sex,
            status
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(systemUserSchema)
            .eq('delFlag', false)
            .eq('sex', sex)
            .eq('status', status)
            .like('username', username)
            .like('nickname', nickname)
            .like('email', email)
            .like('phone', phone)
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

export async function findPerm(ctx: Context) {
    try {
        const userId = (ctx as any)?.user?.userId as number;
        const user = await Get(CacheEnum.ONLINE_USER + userId);
        if (!user) return BaseResultData.fail(404);
        const { loginLocation, ipaddr, userType, loginTime, ...rest } = user;
        return BaseResultData.ok(rest);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findBasic(ctx: Context) {
    try {
        const userId = (ctx as any)?.user?.userId as number;
        const res = await FindOneByKey(systemUserSchema, 'userId', userId);
        if (!res || res.delFlag) return BaseResultData.fail(404);
        const { password, ...item } = res;
        let dept = undefined;
        if (item.deptId) dept = await GetDeptInfoById(item.deptId);
        return BaseResultData.ok({ ...item, deptName: dept?.deptName });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findOne(ctx: Context) {
    try {
        const id = Number(ctx.params.id);
        const data = await FindOneByKey(systemUserSchema, 'userId', id);
        const roles = await GetUserRoleIds(id);
        if (!data || data.delFlag) return BaseResultData.fail(404);
        const { password, ...item } = data;
        return BaseResultData.ok({ ...item, roles });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        const { password, roles, ...rest } = data;
        const user = rest as typeof systemUserSchema.$inferSelect;
        await RunTransaction(async (tx) => {
            await tx.update(systemUserSchema).set(rest).where(eq(systemUserSchema.userId, user.userId));
            await tx.delete(systemUserRoleSchema).where(eq(systemUserRoleSchema.userId, user.userId));
            if (roles?.length) await tx.insert(systemUserRoleSchema).values(roles.map((roleId: number) => ({
                userId: user.userId,
                roleId
            })));
        });
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateBasic(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        const userId = (ctx as any)?.user?.userId as number;
        const { password, ...rest } = data;
        const user = rest as typeof systemUserSchema.$inferSelect;
        await UpdateByKey(systemUserSchema, 'userId', { ...user, userId }, true);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updatePassword(ctx: Context) {
    try {
        const { oldPassword, newPassword } = ctx.body as any;
        const userId = (ctx as any)?.user?.userId as number;
        const user = await GetUserBy('userId', userId);
        if (!user || user.delFlag) return BaseResultData.fail(404);
        const isSame = BcryptCompare(oldPassword, user.password);
        if (!isSame) return BaseResultData.fail(400, '旧密码错误');
        await SetUserPassword(userId, newPassword);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',').map(Number) as number[];
        await SoftDeleteByKeys(systemUserSchema, 'userId', ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 获得用户信息
export async function GetUserBy(key: string, val: any) {
    try {
        return await FindOneByKey(systemUserSchema, key, val);
    } catch (error) {
        logger.error('获得用户信息失败' + error);
        return null;
    }
};

// 注册用户
export async function RegisterUser(username: string, password: string) {
    try {
        password = BcryptHash(password);
        await InsertOne(systemUserSchema, { username, password });
    } catch (error) {
        logger.error('注册用户失败' + error);
    }
};

// 设置用户密码
export async function SetUserPassword(userId: number, password: string) {
    try {
        password = BcryptHash(password);
        await UpdateByKey(systemUserSchema, 'userId', { password, userId }, true);
    } catch (error) {
        logger.error('设置用户密码失败' + error);
    }
};