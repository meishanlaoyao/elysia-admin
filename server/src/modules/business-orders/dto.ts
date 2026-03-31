import { t } from 'elysia';
import { CrudDto, BaseResultDto } from '@/types/dto';
import { InsertBusinessOrders, SelectBusinessOrders } from '@database/schema/business_orders';

export const CreateDto = {
    ...BaseResultDto(t.String({ description: '订单号' })),
};