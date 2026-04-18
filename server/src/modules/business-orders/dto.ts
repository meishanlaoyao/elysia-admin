import { t } from 'elysia';
import { CrudDto, BaseResultDto, BaseListQueryDto } from '@/types/dto';
import { SelectBusinessOrders } from '@database/schema/business_orders';

export const CreateDto = {
    ...BaseResultDto(t.String({ description: '订单号' })),
};

export const PayOrderDto = {
    body: t.Object({
        orderNo: t.String({ description: '订单号', minLength: 1, errorMessage: '订单号不能为空' }),
        paymentMethod: t.String({ description: '支付方式', minLength: 1, errorMessage: '支付方式不能为空' }),
        platform: t.String({ description: '支付平台', minLength: 1, errorMessage: '支付平台不能为空' }),
    })
};

export const ListDto = {
    query: BaseListQueryDto({
        orderNo: t.Optional(t.String({ description: '订单号' })),
        status: t.Optional(t.String({ description: '状态' })),
        paymentMethod: t.Optional(t.String({ description: '支付方式' })),
    })
};

export const UpdateDto = CrudDto.update(SelectBusinessOrders, 'id');