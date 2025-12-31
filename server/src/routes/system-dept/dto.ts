import { t } from 'elysia';
import { CrudDto } from '@/common/dto';
import { InsertSystemDept, SelectSystemDept } from "@/schema/system_dept";

export const CreateDto = CrudDto.create(
    InsertSystemDept,
    SelectSystemDept,
    ['deptName', 'parentId']
);

export const UpdateDto = CrudDto.update(SelectSystemDept);

export const TreeDto = {
    query: t.Object({
        deptName: t.Optional(t.String({ description: "部门名称" })),
    })
};