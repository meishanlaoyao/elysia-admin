import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callPaypal, paypalQuery, paypalRefund, parsePaypalNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * PayPal PC 支付（Smart Payment Buttons）
 * 接口：POST /v2/checkout/orders
 * 返回 orderId 给前端 JS SDK 调用 paypal.Buttons({ createOrder })
 */
export class PaypalPcProvider implements IPaymentProvider {
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
        });
        return { paymentNo, thirdTradeNo: data.id, payload: { orderId: data.id } };
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
};