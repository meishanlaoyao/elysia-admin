import { t } from 'elysia';
import {
    InsertSystemDictData,
    InsertSystemDictType,
    SelectSystemDictData,
    SelectSystemDictType
} from '@/schema/system_dict';
import { BaseResultDto, BaseListQueryDto, BaseResultListDto } from '@/common/dto';

export const CreateTypeDto = {
    body: t.Pick(InsertSystemDictType, ['dictName', 'dictType']),
    ...BaseResultDto(SelectSystemDictType),
};

export const CreateDataDto = {
    body: t.Pick(InsertSystemDictData, ['dictSort', 'dictValue', 'dictLabel', 'dictType']),
    ...BaseResultDto(SelectSystemDictData),
};

export const ListTypeDto = {
    query: BaseListQueryDto({
        dictName: t.Optional(t.String({ description: "字典名称" })),
        dictType: t.Optional(t.String({ description: "字典类型" })),
    }),
    ...BaseResultListDto(SelectSystemDictType),
};

export const ListDataDto = {
    query: BaseListQueryDto({
        dictType: t.Optional(t.String({ description: "字典类型" })),
        dictLabel: t.Optional(t.String({ description: "字典标签" })),
    }),
    ...BaseResultListDto(SelectSystemDictData),
};

export const UpdateTypeDto = {
    body: SelectSystemDictType,
    ...BaseResultDto(SelectSystemDictType),
};

export const UpdateDataDto = {
    body: SelectSystemDictData,
    ...BaseResultDto(SelectSystemDictData),
};