import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

export const UpdateWxmpUserInfoDto = {
    body: t.Object({
        nickname: t.String({ description: '昵称' }),
        sex: t.String({ description: '性别' }),
        avatar: t.String({ description: '头像' }),
    }),
    ...BaseResultDto,
};