import { t } from 'elysia';
import { InsertSystemApi, SelectSystemApi } from "@database/schema/system_api";
import { CrudDto } from '@/types/dto';

export const CreateDto = CrudDto.create(
    InsertSystemApi,
    SelectSystemApi,
    ['apiName', 'apiPath', 'apiMethod']
);

export const UpdateDto = CrudDto.update(SelectSystemApi, 'apiId');

export const ListDto = CrudDto.list(
    SelectSystemApi,
    {
        apiName: t.Optional(t.String({ description: "API名称" })),
        apiPath: t.Optional(t.String({ description: "API路径" })),
        apiMethod: t.Optional(t.String({ description: "API方法" })),
    }
);