import { t } from 'elysia';
import { CrudDto } from '@/types/dto';
import { InsertSystemDept, SelectSystemDept } from "@database/schema/system_dept";

export const CreateDto = CrudDto.create(
    InsertSystemDept,
    SelectSystemDept,
    ['deptName', 'parentId']
);

export const UpdateDto = CrudDto.update(SelectSystemDept, 'deptId');

export const TreeDto = {
    query: t.Object({
        deptName: t.Optional(t.String({ description: "部门名称" })),
    })
};