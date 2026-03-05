import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { GenerateToken, VerifyToken } from '@/shared/jwt';
import { BcryptCompare } from '@/shared/bcrypt';
import { GetUserBy, RegisterUser, SetUserPassword } from '@/modules/system-user/handle';
import { GenerateUUID } from '@/shared/uuid';
import { GetNowTime, ConvertTimeToSecond } from '@/shared/time';
import { CacheEnum } from '@/constants/enum';
import { Get, Set, Del, Keys } from '@/core/database/redis';
import { SendMail } from '@/infrastructure/clients/smtp';
import { GenerateForgetPasswordHtmlTemplate } from '@/shared/htmltemplate';
import config from '@/config';
import { GetUserRoleAndPermission } from '@/modules/system-role/handle';
import { InsertIpBlack } from '@/modules/system-ip-black/handle';
import { GetClientInfo, GetClientIp } from '@/shared/ip';
import { GetPhoneNumber } from '@/infrastructure/clients/wechat';
import type { IAccountType } from '@/types/common';

export async function accountPasswordLogin(ctx: Context) {
    try {
        const { username, password } = ctx.body as any;
        const user = await GetUserBy('username', username);
        if (!user) return BaseResultData.fail(404, '用户不存在');
        if (!user?.status) return BaseResultData.fail(403, '用户已停用');
        if (user?.delFlag) return BaseResultData.fail(410, '用户已删除');
        if (!BcryptCompare(password, user?.password || '')) {
            await addPasswordErrorTimes(ctx);
            return BaseResultData.fail(400, '密码错误');
        };
        const payload = { userId: user.userId };
        const baseKey = CacheEnum.REFRESH_TOKEN + `${user.userId}:`;
        const oldkeys = await Keys(baseKey);
        if (oldkeys.length) {
            const isDel = await Del(oldkeys);
            if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
        };
        const tokens = await generateAndStoreTokens(payload);
        if ('error' in tokens) return tokens.error;
        const { roles, permissions } = await GetUserRoleAndPermission(user.userId);
        const clientInfo = await GetClientInfo(ctx);
        if (!clientInfo) return BaseResultData.fail(500, '获取客户端信息失败');
        (ctx as any).clientInfo = clientInfo;
        const userInfo = {
            userId: user.userId, // 用户 ID [必须]
            username: user.username,
            email: user.email,
            phone: user.phone,
            sex: user.sex,
            avatar: user.avatar,
            loginLocation: clientInfo.loginLocation, // 登录地点 [必须]
            ipaddr: clientInfo.ipaddr, // 客户端 IP 地址 [必须]
            roles, // 角色列表 [必须]
            permissions, // 权限列表 [必须]
            userType: 'admin' as IAccountType, // 用户类型 [必须]
            loginTime: GetNowTime(), // 登录时间 [必须]
        };
        const onlineKey = CacheEnum.ONLINE_USER + user.userId;
        const isSetOnline = await Set(onlineKey, userInfo);
        if (!isSetOnline) return BaseResultData.fail(500, '在线用户设置失败');
        (ctx.headers as any).userId = user.userId || '';
        return BaseResultData.ok(tokens);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function refreshToken(ctx: Context) {
    try {
        const { refreshToken } = ctx.body as any;
        if (!refreshToken) return BaseResultData.fail(404, '刷新令牌不存在');
        const payload = await VerifyToken('refreshToken', refreshToken);
        if (!payload) return BaseResultData.fail(400, '刷新令牌无效');
        const oldKey = CacheEnum.REFRESH_TOKEN + `${payload.userId}:${payload.uuid}`;
        const oldPayload = await Get(oldKey);
        if (!oldPayload) return BaseResultData.fail(400, '刷新令牌无效');
        const isDel = await Del(oldKey);
        if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
        const tokens = await generateAndStoreTokens(oldPayload);
        if ('error' in tokens) return tokens.error;
        return BaseResultData.ok(tokens);
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function wxmpPhoneLogin(ctx: Context) {
    try {
        const { code } = ctx.body as any;
        const info = await GetPhoneNumber(code);

        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function registerUser(ctx: Context) {
    try {
        const { username, password } = ctx.body as any;
        await RegisterUser(username, password)
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function forgetPassword(ctx: Context) {
    try {
        const { email } = ctx.body as any;
        const user = await GetUserBy('email', email);
        if (user?.email && user?.status && !user?.delFlag) {
            const key = CacheEnum.FORGET_PASSWORD + user.userId;
            const oldKeys = await Keys(`${key}:*`);
            if (oldKeys.length) await Del(oldKeys);
            const uuid = GenerateUUID();
            const cacheKey = `${key}:${uuid}`;
            const isSet = await Set(cacheKey, { userId: user.userId }, config.app.forgetPasswordExpiresIn);
            if (!isSet) return BaseResultData.fail(500);
            try {
                const resetUrl = `${config.app.forgetPasswordUrl}?token=${uuid}&uid=${user.userId}`;
                const html = GenerateForgetPasswordHtmlTemplate(resetUrl, user?.nickname || '');
                const isSend = await SendMail({
                    to: email,
                    subject: `[${config.app.id}] - 重置密码`,
                    html,
                });
                if (!isSend) {
                    await Del(cacheKey);
                    return BaseResultData.fail(500);
                }
            } catch (mailError) {
                await Del(cacheKey);
                return BaseResultData.fail(500, mailError);
            }
        };
        return BaseResultData.ok(null, '如果该邮箱存在，我们已发送重置邮件');
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function resetPassword(ctx: Context) {
    try {
        const { uid, token, password } = ctx.body as any;
        const key = CacheEnum.FORGET_PASSWORD + uid + ':' + token;
        const payload = await Get(key);
        if (!payload) return BaseResultData.fail(400, '重置令牌无效');
        const isDel = await Del(key);
        if (!isDel) return BaseResultData.fail(500, '重置令牌删除失败');
        await SetUserPassword(uid, password);
        return BaseResultData.ok(null, '密码重置成功');
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

// 生成并存储令牌
async function generateAndStoreTokens(payload: any): Promise<{ accessToken: string, refreshToken: string, accessExpiresIn: number, refreshExpiresIn: number } | { error: any }> {
    const uuid = GenerateUUID();
    const accessToken = await GenerateToken('accessToken', payload);
    const refreshToken = await GenerateToken('refreshToken', { uuid, ...payload });
    const refreshKey = CacheEnum.REFRESH_TOKEN + `${payload.userId}:${uuid}`;
    const accessExpiresIn = ConvertTimeToSecond(config.jwt.accessToken.expiresIn);
    const refreshExpiresIn = ConvertTimeToSecond(config.jwt.refreshToken.expiresIn);
    const isSet = await Set(refreshKey, payload, refreshExpiresIn);
    if (!isSet) return { error: BaseResultData.fail(500, '刷新令牌设置失败') };
    return { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn };
};

// 添加密码错误次数
async function addPasswordErrorTimes(ctx: Context) {
    const ip = GetClientIp(ctx);
    let strCount = await Get(CacheEnum.ADMIN_LOGIN_ERROR_COUNT + ip);
    let count = Number(strCount) || 0;
    count++;
    if (count >= config.app.maxLoginAttempts) {
        await InsertIpBlack({
            ipAddress: ip,
            remark: '登录失败次数超过' + config.app.maxLoginAttempts + '次'
        });
        await Del(CacheEnum.ADMIN_LOGIN_ERROR_COUNT + ip);
        return;
    };
    await Set(CacheEnum.ADMIN_LOGIN_ERROR_COUNT + ip, count, config.app.baseCacheTime);
};