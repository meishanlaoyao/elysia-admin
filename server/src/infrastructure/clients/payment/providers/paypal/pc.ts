import { GenerateUUID } from '@/shared/uuid';
import { callPaypal, paypalQuery, paypalRefund, parsePaypalNotify } from './base';
import type {
    IPaymentProvider,
    MerchantConfig,
    PaymentCreateParams,
    PaymentCreateResult,
    QueryParams,
    QueryResult,
    RefundParams,
    RefundResult,
    NotifyParams,
    NotifyResult
} from '@/types/pay';

/**
 * PayPal PC 支付（Smart Payment Buttons）
 * 接口：POST /v2/checkout/orders
 * 返回 orderId 给前端 JS SDK 调用 paypal.Buttons({ createOrder })
 *
 * 说明：`notifyUrl` 不会传给 PayPal 下单接口；支付结果异步通知须在 PayPal 开发者后台配置 Webhook，
 * 与本项目的 `parsePaypalNotify` / `webhookId` 配合使用。
 */
export class PaypalPcProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = params.paymentNo || GenerateUUID();
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

    /** Webhook 应答：PayPal 要求 HTTP 2xx，正文可为空 */
    notifySuccess(): string {
        return '';
    }
};