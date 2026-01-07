import { t } from 'elysia';
import { CrudDto } from '@/common/dto';
import { InsertSystemMenu, SelectSystemMenu } from "@/schema/system_menu";

export const CreateDto = CrudDto.create(
    InsertSystemMenu,
    SelectSystemMenu,
    ['title', 'path', 'name']
);

export const UpdateDto = CrudDto.update(SelectSystemMenu);

export const ListDto = CrudDto.list(
    SelectSystemMenu,
    {
        title: t.Optional(t.String({ description: "菜单名称" })),
        path: t.Optional(t.String({ description: "路由地址" })),
    }
);