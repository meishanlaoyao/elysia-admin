import { t } from 'elysia';
import { CrudDto, BaseResultDto, BaseListQueryDto } from '@/types/dto';
import { SelectBusinessOrders } from '@database/schema/business_orders';

export const CreateDto = {
    ...BaseResultDto(t.String({ description: '订单号' })),
};

export const ListDto = {
    query: BaseListQueryDto({
        orderNo: t.Optional(t.String({ description: '订单号' })),
        status: t.Optional(t.String({ description: '状态' })),
        paymentMethod: t.Optional(t.String({ description: '支付方式' })),
    })
};

export const UpdateDto = CrudDto.update(SelectBusinessOrders, 'id');