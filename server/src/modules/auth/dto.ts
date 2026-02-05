import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';
import { AddLoginLog } from '@/modules/system-login-log/handle';

export const AccountPasswordLoginDto = {
    body: t.Object({
        username: t.String({ error: '用户名格式错误', minLength: 5 }),
        password: t.String({ error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Object({
        token: t.String(),
    })),
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
    // cookie: t.Object({
    //     refreshToken: t.String({ error: '刷新令牌格式错误', minLength: 5 }),
    // }),
    ...BaseResultDto(t.Object({
        token: t.String(),
    })),
};