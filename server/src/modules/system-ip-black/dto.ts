import { t } from 'elysia';
import { InsertSystemIpBlack, SelectSystemIpBlack } from "database/schema/system_ip_black";
import { CrudDto } from '@/types/dto';

export const CreateDto = CrudDto.create(
    InsertSystemIpBlack,
    SelectSystemIpBlack,
    ['ipAddress']
);

export const UpdateDto = CrudDto.update(SelectSystemIpBlack, 'ipBlackId');

export const FindAllDto = CrudDto.findAll(
    SelectSystemIpBlack,
    {
        ipAddress: t.Optional(t.String({ description: "IP地址" })),
        status: t.Optional(t.String({ description: "状态" })),
    }
);