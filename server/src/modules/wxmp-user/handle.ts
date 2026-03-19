import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { wxmpUserSchema } from 'database/schema/wxmp_user';
import {
    InsertOneAndRes,
    FindOneByKey,
    UpdateByKey,
    UpdateByKeyAndRes,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';
import { Get } from '@/core/database/redis';
import { GenerateUUID } from '@/shared/uuid';
import { CacheEnum } from '@/constants/enum';
import { WxmpLogin } from '@/infrastructure/clients/wechat';

export async function findList(ctx: Context) {
    try {
        return BaseResultData.ok();
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
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
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
                username: '微信用户' + uuid.slice(0, 8),
            });
        };
        return user;
    } catch (error) {
        return new Error('小程序登陆失败');
    }
};