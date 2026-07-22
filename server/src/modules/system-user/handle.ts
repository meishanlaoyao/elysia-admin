import type { AppContext } from '@/types/app-context';
import { eq } from 'drizzle-orm';
import { CacheEnum } from '@/constants/enum';
import { BaseResultData } from '@/core/result';
import { Get, Keys, Del, Set as RedisSet } from '@/core/database/redis';
import { systemUserSchema, systemUserRoleSchema } from '@database/schema/system_user';
import { BcryptHash, BcryptCompare } from '@/shared/bcrypt';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    UpdateByKeyAndRes,
    CreateQueryBuilder,
    FindPage,
    SoftDeleteByKeys,
} from '@/core/database/repository';
import { 
    GetUserRoleIds,
    GetUserRoleAndPermission, 
    InvalidateUserPermissionCache, 
    GetOrLoadUserPermissions 
} from '@/modules/system-role/handle';
import { ParseDateFields } from '@/types/dto';
import { RunTransaction } from '@/core/database/transaction';
import { logServerError } from '@/shared/server-error';
import { DeleteOnlineUserL1 } from '@/shared/online-user-l1';
import { GetDeptInfoById } from '@/modules/system-dept/handle';

export async function create(ctx: AppContext) {
    const { roles, ...rest } = ctx.body as any;
    const data = rest as typeof systemUserSchema.$inferInsert;
    data.password = await BcryptHash(data.password);
    await RunTransaction(async (tx) => {
        const [user] = await tx.insert(systemUserSchema).values(data).returning();
        if (!roles?.length) return;
        await tx.insert(systemUserRoleSchema).values(roles.map((roleId: number) => ({
            userId: user.userId,
            roleId
        })));
    });
    return BaseResultData.ok();
};

export async function findList(ctx: AppContext) {
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
};

export async function findPerm(ctx: AppContext) {
    const userId = ctx?.user?.userId as string;
    const user = await Get(CacheEnum.ONLINE_USER + userId);
    if (!user) return BaseResultData.fail(404);
    const permissions = await GetOrLoadUserPermissions(userId);
    const { loginLocation, ipaddr, userType, loginTime, ...rest } = user;
    return BaseResultData.ok({ ...rest, permissions });
};

export async function findBasic(ctx: AppContext) {
    const userId = ctx?.user?.userId as string;
    const res = await FindOneByKey(systemUserSchema, 'userId', userId);
    if (!res || res.delFlag) return BaseResultData.fail(404);
    const { password, ...item } = res;
    let dept = undefined;
    if (item.deptId) dept = await GetDeptInfoById(item.deptId);
    return BaseResultData.ok({ ...item, deptName: dept?.deptName });
};

export async function findOne(ctx: AppContext) {
    const id = ctx.params.id;
    const data = await FindOneByKey(systemUserSchema, 'userId', id);
    const roles = await GetUserRoleIds(id);
    if (!data || data.delFlag) return BaseResultData.fail(404);
    const { password, ...item } = data;
    return BaseResultData.ok({ ...item, roles });
};

export async function update(ctx: AppContext) {
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
    if (user.status === false) {
        await InvalidateUserSession(user.userId);
    } else if (roles !== undefined) {
        await InvalidateUserPermissionCache(user.userId);
        const online = await Get(CacheEnum.ONLINE_USER + user.userId);
        if (online) {
            const { roles: newRoles } = await GetUserRoleAndPermission(user.userId);
            online.roles = newRoles;
            delete online.permissions;
            await RedisSet(CacheEnum.ONLINE_USER + user.userId, online);
        };
    };
    return BaseResultData.ok();
};

export async function updateBasic(ctx: AppContext) {
    const data = ctx.body as typeof systemUserSchema.$inferSelect;
    const userId = ctx?.user?.userId as string;
    const { password, ...rest } = data;
    const user = rest as typeof systemUserSchema.$inferSelect;
    await UpdateByKey(systemUserSchema, 'userId', null, { ...user, userId });
    return BaseResultData.ok();
};

export async function updatePassword(ctx: AppContext) {
    const { oldPassword, newPassword } = ctx.body as any;
    const userId = ctx?.user?.userId as string;
    const user = await GetUserBy('userId', userId);
    if (!user || user.delFlag) return BaseResultData.fail(404);
    const isSame = await BcryptCompare(oldPassword, user.password);
    if (!isSame) return BaseResultData.fail(400, '旧密码错误');
    await SetUserPassword(userId, newPassword);
    return BaseResultData.ok();
};

export async function remove(ctx: AppContext) {
    const ids = String(ctx.params.ids ?? '').split(',').filter(Boolean);
    await SoftDeleteByKeys(systemUserSchema, 'userId', ctx);
    for (const userId of ids) await InvalidateUserSession(userId);
    return BaseResultData.ok();
};

// 获得用户信息
export async function GetUserBy(key: string, val: any) {
    try {
        return await FindOneByKey(systemUserSchema, key, val);
    } catch (error) {
        logServerError('获得用户信息失败', error);
        return null;
    }
};

// 注册用户
export async function RegisterUser(username: string, password: string): Promise<void> {
    const exists = await GetUserBy('username', username);
    if (exists) {
        const e = new Error('用户名已存在') as Error & { httpStatus?: number };
        e.httpStatus = 409;
        throw e;
    };
    const hash = await BcryptHash(password);
    try {
        await InsertOne(systemUserSchema, null, { username, password: hash });
    } catch (error: any) {
        const code = error?.cause?.code ?? error?.code;
        if (code === '23505') {
            const e = new Error('用户名已存在') as Error & { httpStatus?: number };
            e.httpStatus = 409;
            throw e;
        };
        logServerError('注册用户失败', error);
        throw error;
    };
};

// 设置用户密码
export async function SetUserPassword(userId: string, password: string): Promise<void> {
    const hash = await BcryptHash(password);
    const row = await UpdateByKeyAndRes(systemUserSchema, 'userId', null, { password: hash, userId });
    if (!row) {
        const e = new Error('密码更新失败') as Error & { httpStatus?: number };
        e.httpStatus = 500;
        throw e;
    };
    await InvalidateUserSession(userId);
};

/** 失效用户会话：清理 ONLINE_USER、权限、refresh、菜单缓存与 refresh 墓碑 */
export async function InvalidateUserSession(userId: string): Promise<void> {
    await Del(CacheEnum.ONLINE_USER + userId);
    await Del(CacheEnum.USER_PERM + userId);
    DeleteOnlineUserL1(userId);
    const refreshKeys = await Keys(CacheEnum.REFRESH_TOKEN + `${userId}:`);
    if (refreshKeys.length) await Del(refreshKeys);
    const usedKeys = await Keys(CacheEnum.REFRESH_USED + `${userId}:`);
    if (usedKeys.length) await Del(usedKeys);
    await Del(CacheEnum.ADMIN_MENU + userId);
};