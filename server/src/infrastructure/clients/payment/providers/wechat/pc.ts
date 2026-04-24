import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callWechat, buildWechatOrderBody, wechatQuery, wechatRefund, parseWechatNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * 微信 PC 扫码支付（Native）
 * 接口：POST /v3/pay/transactions/native
 * 返回 code_url 二维码链接，前端生成二维码展示
 */
export class WechatPcProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const body = buildWechatOrderBody(config, 'native', paymentNo, params);
        const data = await callWechat(config, 'POST', '/v3/pay/transactions/native', body);
        return { paymentNo, payload: { codeUrl: data.code_url } };
    }

    async query(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
        return wechatQuery(config, params);
    }

    async refund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
        return wechatRefund(config, params);
    }

    async notify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> {
        return parseWechatNotify(config, params);
    }

    notifySuccess(): string {
        return JSON.stringify({ code: 'SUCCESS', message: '成功' });
    }
};