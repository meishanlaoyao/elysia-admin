import { GenerateUUID } from '@/shared/uuid';
import { formatPrivateKey, formatPublicKey, buildAlipayRequest, alipayQuery, alipayRefund, parseAlipayNotify, GATEWAY, } from './base';
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
 * 支付宝 PC 网页支付
 * 接口：alipay.trade.page.pay
 * 返回自动提交表单 HTML，前端直接渲染后跳转
 */
export class AlipayPcProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        config.privateKey = formatPrivateKey(config.privateKey || '');
        config.publicKey = formatPublicKey(config.publicKey || '');
        const paymentNo = params.paymentNo || GenerateUUID();
        const body = buildAlipayRequest(
            config,
            'alipay.trade.page.pay',
            {
                out_trade_no: paymentNo,
                total_amount: params.amount,
                subject: params.title,
                body: params.description,
                product_code: 'FAST_INSTANT_TRADE_PAY',
            }
        );
        // page.pay 直接拼接跳转 URL，前端 GET 跳转即可
        const payUrl = `${GATEWAY}?${body}`;
        return { paymentNo, payload: { payUrl } };
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