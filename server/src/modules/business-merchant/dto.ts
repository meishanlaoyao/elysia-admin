import { t } from 'elysia';
import { CrudDto, BaseListQueryDto } from '@/types/dto';
import {
    InsertBusinessMerchant,
    SelectBusinessMerchant,
    InsertBusinessMerchantConfigs,
    SelectBusinessMerchantConfigs
} from '@database/schema/business_merchant';

export const CreateDto = CrudDto.create(
    InsertBusinessMerchant,
    SelectBusinessMerchant,
    ['name', 'channel']
);

export const CreateConfigDto = CrudDto.create(
    InsertBusinessMerchantConfigs,
    SelectBusinessMerchantConfigs,
    ['merchantId', 'channel']
);

export const ListDto = {
    query: BaseListQueryDto({
        name: t.Optional(t.String({ description: '商户名称' })),
        status: t.Optional(t.Boolean({ description: '状态' })),
    })
};

export const UpdateDto = CrudDto.update(SelectBusinessMerchant, 'id');

export const UpdateConfigDto = CrudDto.update(SelectBusinessMerchantConfigs, 'id');