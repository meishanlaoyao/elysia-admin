import { t } from 'elysia';
import { CrudDto } from '@/common/dto';
import { InsertSystemRole, SelectSystemRole } from "@/schema/system_role";

export const CreateDto = CrudDto.create(
    InsertSystemRole,
    SelectSystemRole,
    ['roleName', 'roleCode']
);

export const UpdateDto = CrudDto.update(SelectSystemRole);

export const ListDto = CrudDto.list(
    SelectSystemRole,
    {
        roleName: t.Optional(t.String({ description: "角色名称" })),
        roleCode: t.Optional(t.String({ description: "角色编码" })),
    }
);