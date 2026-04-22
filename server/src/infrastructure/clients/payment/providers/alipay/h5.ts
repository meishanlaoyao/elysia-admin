import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callAlipay, alipayQuery, alipayRefund, parseAlipayNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * 支付宝 H5（手机网站）支付
 * 接口：alipay.trade.wap.pay
 * 返回跳转 URL 给前端
 */
export class AlipayH5Provider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const data = await callAlipay(config, 'alipay.trade.wap.pay', {
            out_trade_no: paymentNo,
            total_amount: params.amount,
            subject: params.title,
            body: params.description,
            notify_url: params.notifyUrl,
            return_url: params.returnUrl,
            quit_url: params.returnUrl,
        });

        return { paymentNo, payload: { payUrl: data.trade_no } };
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
