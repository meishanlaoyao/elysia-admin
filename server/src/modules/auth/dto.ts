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
        username: t.String({ error: '用户名格式错误', minLength: 5 }),
        password: t.String({ error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(baseAuthDto),
    afterHandle: AddLoginLog,
};

export const RegisterUserDto = {
    body: t.Object({
        username: t.String({ error: '用户名格式错误', minLength: 5 }),
        password: t.String({ error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Null()),
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
        token: t.String({ error: 'token格式错误', minLength: 5 }),
        uid: t.Number({ error: 'uid格式错误', minLength: 1 }),
        password: t.String({ error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Null()),
};

export const RefreshTokenDto = {
    body: t.Object({
        refreshToken: t.String({ error: '刷新令牌格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(baseAuthDto),
};