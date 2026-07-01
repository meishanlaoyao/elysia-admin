import { t } from 'elysia';
import { BaseResultDto } from '@/types/dto';

export const CreateDto = {
    body: t.Object({
        orderId: t.Number({ description: '订单ID' }),
        paymentId: t.Number({ description: '支付记录ID' }),
        amount: t.Number({ description: '退款金额' }),
        reason: t.Optional(t.String({ description: '退款原因' })),
    }),
    ...BaseResultDto(t.String({ description: '退款单号' })),
};

export const UpdateDto = {
    body: t.Object({
        id: t.Number({ description: '退款ID' }),
        status: t.String({ description: '退款状态' }),
        remark: t.Optional(t.String({ description: '备注' })),
    }),
};