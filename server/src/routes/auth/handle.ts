import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { GenerateToken, VerifyToken } from '@/utils/jwt';
import { BcryptCompare } from '@/common/bcrypt';
import { GetUserBy, RegisterUser, SetUserPassword } from '@/routes/system-user/handle';
import { GenerateUUID } from '@/common/uuid';
import { GetNowTime, ConvertTimeToSecond } from '@/common/time';
import { CacheEnum } from '@/common/enum';
import { Get, Set, Del, Keys } from '@/client/redis';
import { SendMail } from '@/client/smtp';
import { GenerateForgetPasswordHtmlTemplate } from '@/utils/htmltemplate';
import config from '@/config';

// 设置刷新令牌 Cookie
function setRefreshTokenCookie(req: Context, refreshToken: string) {
    const maxAge = ConvertTimeToSecond(config.jwt.refreshToken.expiresIn);

    // 开发环境
    req.cookie.refreshToken.set({
        domain: 'localhost',
        value: refreshToken,
        httpOnly: true,
        sameSite: 'lax',
        maxAge,
        path: '/'
    });

    // 生产环境
    // req.cookie.refreshToken.set({
    //     domain: 'localhost', // 生成时需要指定域名
    //     value: refreshToken,
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none',
    //     maxAge,
    //     path: '/'
    // });
};

// 生成并存储令牌
async function generateAndStoreTokens(payload: any) {
    const uuid = GenerateUUID();
    const accessToken = await GenerateToken('accessToken', payload);
    const refreshToken = await GenerateToken('refreshToken', { uuid, ...payload });
    const refreshKey = CacheEnum.REFRESH_TOKEN + `${payload.userId}:${uuid}`;
    const isSet = await Set(refreshKey, payload, ConvertTimeToSecond(config.jwt.refreshToken.expiresIn));
    if (!isSet) {
        return { error: BaseResultData.fail(500, '刷新令牌设置失败') };
    }
    return { accessToken, refreshToken };
};

export async function accountPasswordLogin(req: Context) {
    try {
        const { username, password } = req.body as any;
        const user = await GetUserBy('username', username);
        if (!user) return BaseResultData.fail(404, '用户不存在');
        if (!user?.status) return BaseResultData.fail(403, '用户已停用');
        if (user?.delFlag) return BaseResultData.fail(410, '用户已删除');
        if (!BcryptCompare(password, user?.password || '')) return BaseResultData.fail(400, '密码错误');
        const { password: _, ...rest } = user;
        const payload = { userId: user.userId };
        const baseKey = CacheEnum.REFRESH_TOKEN + `${user.userId}:`;
        const oldkeys = await Keys(baseKey);
        if (oldkeys.length) {
            const isDel = await Del(oldkeys);
            if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
        };
        const tokens = await generateAndStoreTokens(payload);
        if ('error' in tokens) return tokens.error;
        const userInfo = { ...rest, loginTime: GetNowTime() };
        const onlineKey = CacheEnum.ONLINE_USER + user.userId;
        const isSetOnline = await Set(onlineKey, userInfo);
        if (!isSetOnline) return BaseResultData.fail(500, '在线用户设置失败');
        setRefreshTokenCookie(req, tokens.refreshToken);
        return BaseResultData.ok({ token: tokens.accessToken });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function refreshToken(req: Context) {
    try {
        const cookie = String(req.cookie?.refreshToken?.value || '');
        if (!cookie) return BaseResultData.fail(404, '刷新令牌不存在');
        const payload = await VerifyToken('refreshToken', cookie);
        if (!payload) return BaseResultData.fail(400, '刷新令牌无效');
        const oldKey = CacheEnum.REFRESH_TOKEN + `${payload.userId}:${payload.uuid}`;
        const oldPayload = await Get(oldKey);
        if (!oldPayload) return BaseResultData.fail(400, '刷新令牌无效');
        const isDel = await Del(oldKey);
        if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
        const tokens = await generateAndStoreTokens(oldPayload);
        if ('error' in tokens) return tokens.error;
        setRefreshTokenCookie(req, tokens.refreshToken);
        return BaseResultData.ok({ token: tokens.accessToken });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function registerUser(req: Context) {
    try {
        const { username, password } = req.body as any;
        await RegisterUser(username, password)
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function forgetPassword(req: Context) {
    try {
        const { email } = req.body as any;
        const user = await GetUserBy('email', email);
        if (user?.email) {
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

export async function resetPassword(req: Context) {
    try {
        const { uid, token, password } = req.body as any;
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