import crypto from 'node:crypto';
import { sha256WithRsa } from '../crypto';
import { GenerateUUID } from '@/shared/uuid';
import { callWechat, buildWechatOrderBody, wechatQuery, wechatRefund, parseWechatNotify } from './base';
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
 * 微信 App 支付
 * 接口：POST /v3/pay/transactions/app
 * 返回 prepayId + 签名给 App 端调起
 */
export class WechatAppProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        const paymentNo = GenerateUUID();
        const body = buildWechatOrderBody(config, 'app', paymentNo, params);
        const data = await callWechat(config, 'POST', '/v3/pay/transactions/app', body);
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const message = `${config.appId}\n${timestamp}\n${nonce}\n${data.prepay_id}\n`;
        const sign = sha256WithRsa(message, config.privateKey!);
        return {
            paymentNo,
            payload: {
                appid: config.appId,
                partnerid: config.mchId,
                prepayid: data.prepay_id,
                package: 'Sign=WXPay',
                noncestr: nonce,
                timestamp,
                sign,
            },
        };
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