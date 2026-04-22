import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { buildAlipayRequest, alipayQuery, alipayRefund, parseAlipayNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * 支付宝 App 支付
 * 接口：alipay.trade.app.pay
 * 返回 orderString 给 App 端直接调起支付
 */
export class AlipayAppProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        // app.pay 直接返回签名串，不需要请求网关，客户端拿到后直接调起
        const orderString = buildAlipayRequest(config, 'alipay.trade.app.pay', {
            out_trade_no: paymentNo,
            total_amount: params.amount,
            subject: params.title,
            body: params.description,
            notify_url: params.notifyUrl,
        });

        return { paymentNo, payload: orderString };
    }

    async query(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
        return alipayQuery(config, params);
    }

    async refund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
        return alipayRefund(config, params);
    }

    async notify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> {
        return parseAlipayNotify(config, params);
    }

    notifySuccess(): string {
        return 'success';
    }
}
