import { buildAlipayRequest, alipayQuery, alipayRefund, parseAlipayNotify, formatPrivateKey, formatPublicKey } from './base';
import { GenerateUUID } from '@/shared/uuid';
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
 * 支付宝 App 支付
 * 接口：alipay.trade.app.pay
 * 返回 orderString 给 App 端直接调起支付
 */
export class AlipayAppProvider implements IPaymentProvider {
    async create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> {
        config.privateKey = formatPrivateKey(config.privateKey || '');
        config.publicKey = formatPublicKey(config.publicKey || '');
        const paymentNo = params.paymentNo || GenerateUUID();
        const orderString = buildAlipayRequest(
            config,
            'alipay.trade.app.pay',
            {
                out_trade_no: paymentNo,
                total_amount: params.amount,
                subject: params.title,
                body: params.description,
                product_code: 'QUICK_MSECURITY_PAY',
                // goods_detail: params.goodsList || [],
            }
        );
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
};