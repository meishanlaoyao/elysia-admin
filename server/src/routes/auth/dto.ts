import { t } from 'elysia';
import { BaseResultDto } from '@/common/dto';

export const AccountPasswordLoginDto = {
    body: t.Object({
        username: t.String({ error: '用户名格式错误', minLength: 5 }),
        password: t.String({ error: '密码格式错误', minLength: 5 }),
    }),
    ...BaseResultDto(t.Object({
        accessToken: t.String(),
    }))
};