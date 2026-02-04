import { t } from 'elysia';
import { InsertSystemUser, SelectSystemUser } from "@/schema/system_user";
import { CrudDto } from '@/common/dto';
import { BaseResultDto } from '@/common/dto';

export const CreateDto = {
    body: t.Object({
        username: t.String({ description: "用户名" }),
        password: t.String({ description: "密码" }),
        nickname: t.Optional(t.String({ description: "昵称" })),
        email: t.Optional(t.String({ description: "邮箱" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        roles: t.Optional(t.Array(t.Number({ description: "角色ID" }))),
        deptId: t.Optional(t.Number({ description: "部门ID" })),
        sex: t.Optional(t.String({ description: "性别" })),
    })
};

export const ListDto = CrudDto.list(
    t.Omit(SelectSystemUser, ['password']),
    {
        username: t.Optional(t.String({ description: "用户名" })),
        nickname: t.Optional(t.String({ description: "昵称" })),
        email: t.Optional(t.String({ description: "邮箱" })),
        phone: t.Optional(t.String({ description: "手机号" })),
        sex: t.Optional(t.String({ description: "性别" })),
        status: t.Optional(t.String({ description: "状态" })),
    }
);

export const UpdateDto = CrudDto.update(SelectSystemUser, 'userId', {
    roles: t.Optional(t.Array(t.Number({ description: "角色ID" }))),
});