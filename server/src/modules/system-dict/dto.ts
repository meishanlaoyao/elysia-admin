import { t } from 'elysia';
import {
    InsertSystemDictData,
    InsertSystemDictType,
    SelectSystemDictData,
    SelectSystemDictType
} from 'database/schema/system_dict';
import { CrudDto, BaseResultDto } from '@/types/dto';

export const CreateTypeDto = CrudDto.create(
    InsertSystemDictType,
    SelectSystemDictType,
    ['dictName', 'dictType']
);

export const UpdateTypeDto = CrudDto.update(SelectSystemDictType, 'dictId');

export const ListTypeDto = CrudDto.list(
    SelectSystemDictType,
    {
        dictName: t.Optional(t.String({ description: "字典名称" })),
        dictType: t.Optional(t.String({ description: "字典类型" })),
    }
);

export const FindDictDataDto = {
    query: t.Object({
        dictType: t.String({ description: "字典类型", minLength: 1, error: '字典类型不能为空' }),
    }),
};

export const CreateDataDto = CrudDto.create(
    InsertSystemDictData,
    SelectSystemDictData,
    ['dictSort', 'dictValue', 'dictLabel', 'dictType']
);

export const UpdateDataDto = CrudDto.update(SelectSystemDictData, 'dictCode');

export const ListDataDto = CrudDto.list(
    SelectSystemDictData,
    {
        dictType: t.Optional(t.String({ description: "字典类型" })),
        dictLabel: t.Optional(t.String({ description: "字典标签" })),
    }
);