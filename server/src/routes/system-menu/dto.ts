import { t } from 'elysia';
import { CrudDto } from '@/common/dto';
import { InsertSystemMenu, SelectSystemMenu, InsertSystemMenuBtn, SelectSystemMenuBtn } from "@/schema/system_menu";

export const CreateMenuDto = CrudDto.create(
    InsertSystemMenu,
    SelectSystemMenu,
    ['title', 'path', 'name']
);

export const CreateMenuBtnDto = CrudDto.create(
    InsertSystemMenuBtn,
    SelectSystemMenuBtn,
    ['menuId', 'title', 'permission']
);

export const UpdateMenuDto = CrudDto.update(SelectSystemMenu);

export const FindAllMenuDto = {
    query: t.Object({
        title: t.Optional(t.String({ description: "菜单名称" })),
        path: t.Optional(t.String({ description: "路由地址" })),
    })
};