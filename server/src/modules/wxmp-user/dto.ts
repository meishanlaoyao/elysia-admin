import { t } from 'elysia';
import { SelectWxmpUser } from 'database/schema/wxmp_user';
import { CrudDto, BaseResultDto } from '@/types/dto';

export const ListDto = CrudDto.list(
    t.Omit(SelectWxmpUser, ['openId', 'sessionKey', 'unionId']),
    {
        username: t.Optional(t.String({ description: "用户名" })),
        nickname: t.Optional(t.String({ description: "昵称" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        sex: t.Optional(t.String({ description: "性别" })),
        status: t.Optional(t.String({ description: "状态" })),
    }
);

export const UpdateDto = CrudDto.update(SelectWxmpUser, 'userId');

export const UpdateWxmpUserInfoDto = {
    body: t.Object({
        nickname: t.String({ description: '昵称' }),
        sex: t.String({ description: '性别' }),
        avatar: t.String({ description: '头像' }),
    }),
    ...BaseResultDto,
};