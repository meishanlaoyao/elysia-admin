import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { wxmpUserSchema } from 'database/schema/wxmp_user';
import { ParseDateFields } from '@/types/dto';
import {
    InsertOneAndRes,
    FindOneByKey,
    UpdateByKey,
    UpdateByKeyAndRes,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { GenerateUUID } from '@/shared/uuid';
import { WxmpLogin } from '@/infrastructure/clients/wechat';

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
            phone,
            sex,
            status
        } = ctx.query;
        const whereCondition = CreateQueryBuilder(wxmpUserSchema)
            .eq('delFlag', false)
            .eq('sex', sex)
            .eq('status', status)
            .like('username', username)
            .like('nickname', nickname)
            .like('phone', phone)
            .dateRange('createTime', startTime, endTime)
            .build();
        const { list, total } = await FindPage(wxmpUserSchema, whereCondition, {
            pageNum,
            pageSize,
            orderByColumn,
            sortRule
        });
        const safeList = list.map(({ openId, sessionKey, unionId, ...item }) => ({ ...item }));
        return BaseResultData.ok({ list: safeList, total });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findbBasic(ctx: Context) {
    try {
        const userId = (ctx as any)?.user?.userId as string;
        const res = await FindOneByKey(wxmpUserSchema, 'userId', userId);
        if (!res) return BaseResultData.fail(404, '用户不存在');
        const { openId, unionId, sessionKey, ...user } = res;
        return BaseResultData.ok(user);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateBasic(ctx: Context) {
    try {
        const userId = (ctx as any)?.user?.userId as string;
        const data = ctx.body as typeof wxmpUserSchema.$inferSelect;
        await UpdateByKeyAndRes(wxmpUserSchema, 'userId', { ...data, userId }, true);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        const data = ParseDateFields(ctx.body);
        await UpdateByKey(wxmpUserSchema, 'userId', data, true);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        const ids = ctx.params.ids.split(',') as string[];
        await SoftDeleteByKeys(wxmpUserSchema, 'userId', ids);
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 处理认证模块的登陆逻辑
export async function HandleWxmpUserLogin(code: string, phone?: string) {
    const { session_key, openid } = await WxmpLogin(code);
    const wxmpUser = await FindOneByKey(wxmpUserSchema, 'openId', openid) || null;
    try {
        let user: any = null;
        if (wxmpUser) {
            // 更新用户信息
            wxmpUser.sessionKey = session_key;
            user = await UpdateByKeyAndRes(wxmpUserSchema, 'userId', wxmpUser, true);
        } else {
            // 添加用户信息
            const uuid = GenerateUUID();
            user = await InsertOneAndRes(wxmpUserSchema, {
                openId: openid,
                sessionKey: session_key,
                phone,
                nickname: '微信用户' + uuid.slice(0, 8),
            });
        };
        return user;
    } catch (error) {
        return new Error('小程序登陆失败');
    }
};