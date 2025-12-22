import { t } from 'elysia';
import { InsertSystemUser, SelectSystemUser } from "@/schema/system_user";
import { CrudDto } from '@/common/dto';

export const CreateDto = CrudDto.create(
    InsertSystemUser,
    SelectSystemUser,
    ['username', 'password', 'email', 'phone']
);

export const ListDto = CrudDto.list(
    t.Omit(SelectSystemUser, ['password']),
    {
        username: t.Optional(t.String({ description: "用户名" })),
        nickname: t.Optional(t.String({ description: "昵称" })),
        email: t.Optional(t.String({ description: "邮箱" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        sex: t.Optional(t.String({ description: "性别" })),
    }
);

export const UpdateDto = CrudDto.update(SelectSystemUser);