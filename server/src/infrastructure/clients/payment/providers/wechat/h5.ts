import type { IPaymentProvider, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import { callWechat, buildWechatOrderBody, wechatQuery, wechatRefund, parseWechatNotify } from './base';
import { GenerateUUID } from '@/shared/uuid';

/**
 * 微信 H5 支付
 * 接口：POST /v3/pay/transactions/h5
 * 返回 h5_url 给前端跳转
 */
export class WechatH5Provider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const body = {
            ...buildWechatOrderBody(config, 'h5', paymentNo, params),
            scene_info: {
                payer_client_ip: params.extra?.clientIp ?? '127.0.0.1',
                h5_info: { type: 'Wap' },
            },
        };
        const data = await callWechat(config, 'POST', '/v3/pay/transactions/h5', body);
        return { paymentNo, payload: { h5Url: data.h5_url } };
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