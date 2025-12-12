import { t } from 'elysia';
import { InsertSystemUser, SelectSystemUser } from "@/schema/system_user";
import { BaseResultDto, BaseListQueryDto } from '@/common/dto';

export const CreateDto = {
    body: t.Pick(InsertSystemUser, ['username', 'password', 'email', 'phone']),
    ...BaseResultDto(SelectSystemUser),
};

export const ListDto = {
    query: BaseListQueryDto({
        username: t.Optional(t.String({ description: "用户名" })),
        nickname: t.Optional(t.String({ description: "昵称" })),
        email: t.Optional(t.String({ description: "邮箱" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        sex: t.Optional(t.String({ description: "性别" })),
    }),
    ...BaseResultDto(t.Array(SelectSystemUser)),
};

export const UpdateDto = {
    body: SelectSystemUser,
    ...BaseResultDto(SelectSystemUser),
};