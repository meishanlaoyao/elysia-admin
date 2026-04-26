/**
 * 支付渠道
 */
export type PaymentChannel = 'alipay' | 'wechat' | 'paypal';

/**
 * 支付平台（终端类型）
 */
export type PaymentPlatform = 'app' | 'h5' | 'mini' | 'pc';

/**
 * 商户配置
 */
export interface MerchantConfig {
    appId?: string | null;
    mchId?: string | null;
    privateKey?: string | null;
    publicKey?: string | null;
    config?: Record<string, any> | any;
    [key: string]: any;
};

/**
 * 发起支付入参
 */
export interface PaymentCreateParams {
    orderNo: string;
    title: string;
    description?: string;
    amount: string;       // 金额，字符串保留精度
    currency?: string | null;
    notifyUrl: string;
    returnUrl?: string;
    extra?: Record<string, any>;
};

/**
 * 发起支付结果
 */
export interface PaymentCreateResult {
    paymentNo: string;    // 本地支付单号
    thirdTradeNo?: string;
    payload: any;         // 返回给前端的支付参数（二维码/签名/跳转链接等）
};

/**
 * 退款入参
 */
export interface RefundParams {
    orderNo: string;
    paymentNo: string;
    thirdTradeNo: string;
    refundNo: string;
    amount: string;
    totalAmount: string;
    reason?: string;
    extra?: Record<string, any>;
};

/**
 * 退款结果
 */
export interface RefundResult {
    refundNo: string;
    thirdRefundNo?: string;
    status: string;
};

/**
 * 查询支付状态入参
 */
export interface QueryParams {
    paymentNo: string;
    thirdTradeNo?: string;
};

/**
 * 查询支付状态结果
 */
export interface QueryResult {
    status: 'pending' | 'success' | 'failed' | 'closed';
    thirdTradeNo?: string;
    paidAt?: Date;
    extra?: Record<string, any>;
};

/**
 * 回调验签入参
 */
export interface NotifyParams {
    rawBody: string | Buffer;
    headers: Record<string, string>;
};

/**
 * 回调解析结果
 */
export interface NotifyResult {
    orderNo: string;
    paymentNo?: string;
    thirdTradeNo: string;
    amount: string;
    status: 'success' | 'failed';
    extra?: Record<string, any>;
};

/**
 * 每个支付平台实现必须遵循的接口
 */
export interface IPaymentProvider {
    /** 发起支付，返回给前端的支付参数 */
    create(config: MerchantConfig, params: PaymentCreateParams): Promise<PaymentCreateResult>;
    /** 主动查询支付状态 */
    query(config: MerchantConfig, params: QueryParams): Promise<QueryResult>;
    /** 发起退款 */
    refund(config: MerchantConfig, params: RefundParams): Promise<RefundResult>;
    /** 验证并解析异步回调通知 */
    notify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult>;
    /** 生成回调成功响应体（各平台格式不同） */
    notifySuccess(): string;
};