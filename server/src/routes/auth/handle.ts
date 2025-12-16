import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { GenerateToken, VerifyToken } from '@/utils/jwt';
import { BcryptCompare } from '@/common/bcrypt';
import { GetUserByUsername } from '@/routes/system-user/handle';
import { GenerateUUID } from '@/common/uuid';
import { GetNowTime, ConvertTimeToSecond } from '@/common/time';
import { CacheEnum } from '@/common/enum';
import { Get, Set, Del, Keys } from '@/client/redis';
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
        const user = await GetUserByUsername(username);
        if (!user) return BaseResultData.fail(404, '用户不存在');
        if (!user?.status) return BaseResultData.fail(403, '用户已停用');
        if (user?.delFlag) return BaseResultData.fail(410, '用户已删除');
        if (!BcryptCompare(password, user?.password || '')) return BaseResultData.fail(400, '密码错误');
        const { password: _, ...rest } = user;
        const payload = { userId: user.userId };
        const baseKey = CacheEnum.REFRESH_TOKEN + `${user.userId}:`;
        const oldkeys = await Keys(baseKey);
        const isDel = await Del(oldkeys);
        if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
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
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};