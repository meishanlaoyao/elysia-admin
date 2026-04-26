import { GenerateUUID } from '@/shared/uuid';
import { callWechat, buildWechatOrderBody, buildWechatJsapiPayload, wechatQuery, wechatRefund, parseWechatNotify } from './base';
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
 * 微信小程序支付（JSAPI）
 * 接口：POST /v3/pay/transactions/jsapi
 * 返回签名参数给小程序端调用 wx.requestPayment
 */
export class WechatMiniProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const body = {
            ...buildWechatOrderBody(config, 'jsapi', paymentNo, params),
            payer: { openid: params.extra?.openid }, // 小程序必传 openid
        };
        const data = await callWechat(config, 'POST', '/v3/pay/transactions/jsapi', body);
        const payload = buildWechatJsapiPayload(config, data.prepay_id);
        return { paymentNo, payload };
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