import { t } from 'elysia';
import { CrudDto, BaseResultDto } from '@/types/dto';
import { InsertSystemRole, SelectSystemRole } from "@database/schema/system_role";

export const CreateDto = CrudDto.create(
    InsertSystemRole,
    SelectSystemRole,
    ['roleName', 'roleCode']
);

export const UpdateDto = CrudDto.update(SelectSystemRole, 'roleId');

export const UpdatePermissionDto = {
    body: t.Object({
        roleId: t.Number({ description: "角色ID" }),
        permissions: t.Array(
            t.Object({
                menuId: t.Number({ description: "菜单ID" }),
                menuBtnId: t.Optional(t.Number({ description: "按钮ID（可选，有值表示按钮权限）" }))
            }),
            { description: "权限列表" }
        )
    }),
    ...BaseResultDto(t.Null())
};

export const ListDto = CrudDto.list(
    SelectSystemRole,
    {
        roleName: t.Optional(t.String({ description: "角色名称" })),
        roleCode: t.Optional(t.String({ description: "角色编码" })),
        status: t.Optional(t.String({ description: "角色状态" })),
    }
);