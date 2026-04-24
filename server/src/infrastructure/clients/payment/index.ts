import type {
    PaymentChannel,
    PaymentPlatform,
    IPaymentProvider,
    MerchantConfig,
    PaymentCreateParams,
    PaymentCreateResult,
    QueryParams,
    QueryResult,
    RefundParams,
    RefundResult,
    NotifyParams,
    NotifyResult,
} from './providers/types';

import { alipayProviders } from './providers/alipay';
import { wechatProviders } from './providers/wechat';
import { paypalProviders } from './providers/paypal';

export type { PaymentChannel, PaymentPlatform, MerchantConfig, PaymentCreateParams, PaymentCreateResult, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult };

// 渠道 -> 平台 -> provider 映射表
const registry: Record<PaymentChannel, Partial<Record<PaymentPlatform, IPaymentProvider>>> = {
    alipay: alipayProviders,
    wechat: wechatProviders,
    paypal: paypalProviders,
};

/**
 * 根据渠道 + 平台解析出对应的 provider
 * @example resolve('alipay', 'mini')
 */
function resolve(channel: PaymentChannel, platform: PaymentPlatform): IPaymentProvider {
    const provider = registry[channel]?.[platform];
    if (!provider) {
        throw new Error(`不支持的支付组合: channel=${channel}, platform=${platform}`);
    };
    return provider;
};

/**
 * 发起支付
 * @example pay('alipay', 'mini')
 */
export function pay(channel: PaymentChannel, platform: PaymentPlatform) {
    const provider = resolve(channel, platform);
    return {
        create: (config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult> =>
            provider.create(config, params),

        query: (config: MerchantConfig, params: QueryParams): Promise<QueryResult> =>
            provider.query(config, params),

        refund: (config: MerchantConfig, params: RefundParams): Promise<RefundResult> =>
            provider.refund(config, params),

        notify: (config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> =>
            provider.notify(config, params),

        notifySuccess: (): string =>
            provider.notifySuccess(),
    };
};