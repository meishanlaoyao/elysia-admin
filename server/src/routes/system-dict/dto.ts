import { t } from 'elysia';
import {
    InsertSystemDictData,
    InsertSystemDictType,
    SelectSystemDictData,
    SelectSystemDictType
} from '@/schema/system_dict';
import { CrudDto } from '@/common/dto';

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

export const FindAllTypeDto = CrudDto.findAll(SelectSystemDictType);

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