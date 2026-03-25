import { t } from 'elysia';
import { CrudDto } from '@/types/dto';
import { InsertBusinessMerchant, SelectBusinessMerchant } from '@database/schema/business_merchant';

export const CreateDto = CrudDto.create(
    InsertBusinessMerchant,
    SelectBusinessMerchant,
    ['name', 'channel']
);

export const ListDto = CrudDto.list(
    SelectBusinessMerchant,
    {
        name: t.Optional(t.String({ description: '商户名称' })),
    }
);

export const UpdateDto = CrudDto.update(SelectBusinessMerchant, 'id');