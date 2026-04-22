import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callPaypal, paypalQuery, paypalRefund, parsePaypalNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * PayPal H5 支付
 * 接口：POST /v2/checkout/orders
 * 返回 approve URL，前端跳转后用户授权，回调后再 capture
 */
export class PaypalH5Provider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const data = await callPaypal(config, 'POST', '/v2/checkout/orders', {
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: paymentNo,
                custom_id: params.orderNo,
                description: params.title,
                amount: {
                    currency_code: params.currency ?? 'USD',
                    value: params.amount,
                },
            }],
            application_context: {
                return_url: params.returnUrl,
                cancel_url: params.returnUrl,
                user_action: 'PAY_NOW',
            },
        });

        const approveLink = data.links?.find((l: any) => l.rel === 'approve')?.href;
        return { paymentNo, thirdTradeNo: data.id, payload: { approveUrl: approveLink, orderId: data.id } };
    }

    async query(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
        return paypalQuery(config, params);
    }

    async refund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
        return paypalRefund(config, params);
    }

    async notify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> {
        return parsePaypalNotify(config, params);
    }

    notifySuccess(): string {
        return 'OK';
    }
}
