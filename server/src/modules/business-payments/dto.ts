import { t } from 'elysia';
import { BaseListQueryDto } from '@/types/dto';

export const PayOrderDto = {
    body: t.Object({
        orderNo: t.String({ description: '订单号', minLength: 1, error: '订单号不能为空' }),
        paymentMethod: t.String({ description: '支付方式', minLength: 1, error: '支付方式不能为空' }),
        platform: t.String({ description: '支付平台', minLength: 1, error: '支付平台不能为空' }),
    })
};