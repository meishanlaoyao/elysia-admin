import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callAlipay, alipayQuery, alipayRefund, parseAlipayNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * 支付宝小程序支付
 * 接口：alipay.trade.create
 * 返回 tradeNo 给小程序端调用 my.tradePay({ tradeNO })
 */
export class AlipayMiniProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const data = await callAlipay(config, 'alipay.trade.create', {
            out_trade_no: paymentNo,
            total_amount: params.amount,
            subject: params.title,
            body: params.description,
            notify_url: params.notifyUrl,
            buyer_id: params.extra?.buyerId, // 小程序必传买家 uid
        });

        return {
            paymentNo,
            thirdTradeNo: data.trade_no,
            payload: { tradeNo: data.trade_no },
        };
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
};