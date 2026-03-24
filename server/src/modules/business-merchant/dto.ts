import { CrudDto } from '@/types/dto';
import { InsertBusinessMerchant, SelectBusinessMerchant } from '@database/schema/business_merchant';

export const CreateDto = CrudDto.create(
    InsertBusinessMerchant,
    SelectBusinessMerchant,
    ['name', 'channel']
);

export const UpdateDto = CrudDto.update(SelectBusinessMerchant, 'id');