import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';
import { AddLoginLog } from '@/modules/system-login-log/handle';

const baseAuthDto = t.Object({
    accessToken: t.String({ description: '访问令牌' }),
    refreshToken: t.String({ description: '刷新令牌' }),
    accessExpiresIn: t.Number({ description: '访问令牌过期时间（秒）' }),
    refreshExpiresIn: t.Number({ description: '刷新令牌过期时间（秒）' }),
});

export const AccountPasswordLoginDto = {
    body: t.Object({
        username: t.String({ description: '用户名', error: '用户名格式错误', minLength: 5 }),
        password: t.String({ description: '密码', error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(baseAuthDto),
    afterHandle: (ctx: any) => AddLoginLog(ctx, 'admin'),
};

export const RegisterUserDto = {
    body: t.Object({
        username: t.String({ description: '用户名', error: '用户名格式错误', minLength: 5 }),
        password: t.String({ description: '密码', error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Null()),
};

export const WxmpLoginDto = {
    body: t.Object({
        code: t.String({ description: '微信登录code' }),
    }),
    ...BaseResultDto(baseAuthDto),
};

export const WxmpPhoneLoginDto = {
    body: t.Object({
        phoneCode: t.String({ description: 'wx.getPhoneNumber() 返回的手机号授权code' }),
        loginCode: t.String({ description: '微信登录code' }),
    }),
    ...BaseResultDto(baseAuthDto),
    afterHandle: (ctx: any) => AddLoginLog(ctx, 'user'),
};

export const ForgetPasswordDto = {
    body: t.Object({
        email: t.String({
            error: '邮箱格式错误',
            format: 'email',
            minLength: 5
        }),
    }),
    ...BaseResultDto(t.Null()),
};

export const ResetPasswordDto = {
    body: t.Object({
        token: t.String({ description: '重置令牌', error: 'token格式错误', minLength: 5 }),
        uid: t.Number({ description: 'uid', error: 'uid格式错误', minLength: 1 }),
        password: t.String({ description: '密码', error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Null()),
};

export const RefreshTokenDto = {
    body: t.Object({
        refreshToken: t.String({ description: '刷新令牌', error: '刷新令牌格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(baseAuthDto),
};