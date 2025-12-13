import { Context } from 'elysia';
import { BaseResultData } from '@/common/result';
import { GenerateToken } from '@/utils/jwt';
import { BcryptCompare } from '@/common/bcrypt';
import { GetUserByUsername } from '@/routes/system-user/handle';
import { GenerateUUID } from '@/common/uuid';
import { GetNowTime, ConvertTimeToSecond } from '@/common/time';
import { CacheEnum } from '@/common/enum';
import { Set, Del, Keys } from '@/client/redis';
import config from '@/config';

export async function accountPasswordLogin(req: Context) {
    try {
        const { username, password } = req.body as any;
        const user = await GetUserByUsername(username);
        if (!user) return BaseResultData.fail(404, '用户不存在');
        if (!user?.status) return BaseResultData.fail(403, '用户已停用');
        if (user?.delFlag) return BaseResultData.fail(410, '用户已删除');
        if (!BcryptCompare(password, user?.password || '')) return BaseResultData.fail(400, '密码错误');
        const uuid = GenerateUUID();
        const payload = { userId: user.userId };
        const accessToken = await GenerateToken('accessToken', payload);
        const refreshToken = await GenerateToken('refreshToken', { uuid, ...payload });
        const { password: _, ...rest } = user;
        const baseKey = CacheEnum.REFRESH_TOKEN + `${user.userId}:`;
        const oldkeys = await Keys(baseKey);
        const isDel = await Del(oldkeys);
        if (!isDel) return BaseResultData.fail(500, '刷新令牌删除失败');
        const isSet = await Set(baseKey + uuid, payload, ConvertTimeToSecond(config.jwt.refreshToken.expiresIn));
        if (!isSet) return BaseResultData.fail(500, '刷新令牌设置失败');
        const userInfo = { ...rest, loginTime: GetNowTime() };
        const onlineKey = CacheEnum.ONLINE_USER + user.userId;
        const isSetOnline = await Set(onlineKey, userInfo);
        if (!isSetOnline) return BaseResultData.fail(500, '在线用户设置失败');

        // 开发环境
        req.cookie.refreshToken.set({
            domain: 'localhost',
            value: refreshToken,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: ConvertTimeToSecond(config.jwt.refreshToken.expiresIn),
            path: '/'
        });

        // 生产环境
        // req.cookie.refreshToken.set({
        //     domain: 'localhost', // 生成时需要指定域名
        //     value: refreshToken,
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        //     maxAge: ConvertTimeToSecond(config.jwt.refreshToken.expiresIn),
        //     path: '/'
        // });

        return BaseResultData.ok({
            accessToken,
            refreshToken
        });
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function refreshToken(req: Context) {
    try {
        /**
         * 
         */
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}