import crypto from 'node:crypto';
import { sha256WithRsa, aesGcmDecrypt } from '../crypto';
import type { MerchantConfig, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';

const BASE_URL = 'https://api.mch.weixin.qq.com';

/**
 * 生成微信 v3 Authorization 请求头
 */
function buildWechatAuth(config: MerchantConfig, method: string, url: string, body: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const urlPath = new URL(url).pathname + (new URL(url).search || '');
    const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
    const signature = sha256WithRsa(message, config.privateKey!);
    const serialNo = config.config?.serialNo ?? '';
    return `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;
};

/**
 * 发送微信 v3 请求
 */
export async function callWechat<T = any>(
    config: MerchantConfig,
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, any>,
): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const bodyStr = body ? JSON.stringify(body) : '';
    const auth = buildWechatAuth(config, method, url, bodyStr);
    const res = await fetch(url, {
        method,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Wechatpay-Serial': config.config?.serialNo ?? '',
        },
        ...(bodyStr ? { body: bodyStr } : {}),
    });
    const json = await res.json() as any;
    if (!res.ok) {
        throw new Error(`微信支付请求失败: [${json.code}] ${json.message}`);
    };
    return json as T;
};

/**
 * 构造微信支付通用下单 body
 */
export function buildWechatOrderBody(
    config: MerchantConfig,
    tradeType: string,
    paymentNo: string,
    params: { title: string; description?: string; amount: string; notifyUrl: string; extra?: Record<string, any> },
): Record<string, any> {
    return {
        appid: config.appId,
        mchid: config.mchId,
        description: params.title,
        out_trade_no: paymentNo,
        notify_url: params.notifyUrl,
        amount: {
            total: Math.round(parseFloat(params.amount) * 100), // 微信单位：分
            currency: 'CNY',
        },
        ...params.extra,
    };
};

/**
 * 生成微信 JSAPI / 小程序 前端调起签名
 */
export function buildWechatJsapiPayload(config: MerchantConfig, prepayId: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const message = `${config.appId}\n${timestamp}\n${nonce}\nprepay_id=${prepayId}\n`;
    const paySign = sha256WithRsa(message, config.privateKey!);
    return {
        appId: config.appId!,
        timeStamp: timestamp,
        nonceStr: nonce,
        package: `prepay_id=${prepayId}`,
        signType: 'RSA',
        paySign,
    };
};

/**
 * 验证微信回调签名并解密 resource
 */
export function parseWechatNotify(config: MerchantConfig, params: NotifyParams): NotifyResult {
    const raw = typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString('utf8');
    const body = JSON.parse(raw);
    // 验签
    const timestamp = params.headers['wechatpay-timestamp'];
    const nonce = params.headers['wechatpay-nonce'];
    const signature = params.headers['wechatpay-signature'];
    const message = `${timestamp}\n${nonce}\n${raw}\n`;
    const verify = crypto.createVerify('SHA256withRSA');
    verify.update(message);
    if (!verify.verify(config.publicKey!, signature, 'base64')) {
        throw new Error('微信回调验签失败');
    };
    // 解密 resource
    const { ciphertext, nonce: resNonce, associated_data } = body.resource;
    const apiV3Key = config.config?.apiV3Key as string;
    const plaintext = aesGcmDecrypt(ciphertext, apiV3Key, resNonce, associated_data ?? '');
    const trade = JSON.parse(plaintext);
    return {
        orderNo: trade.out_trade_no,
        thirdTradeNo: trade.transaction_id,
        amount: (trade.amount.payer_total / 100).toFixed(2),
        status: trade.trade_state === 'SUCCESS' ? 'success' : 'failed',
        extra: trade,
    };
};

/**
 * 通用查询
 */
export async function wechatQuery(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
    const data = await callWechat(config, 'GET', `/v3/pay/transactions/out-trade-no/${params.paymentNo}?mchid=${config.mchId}`);
    const statusMap: Record<string, QueryResult['status']> = {
        SUCCESS: 'success',
        REFUND: 'success',
        NOTPAY: 'pending',
        CLOSED: 'closed',
        REVOKED: 'closed',
        USERPAYING: 'pending',
        PAYERROR: 'failed',
    };
    return {
        status: statusMap[data.trade_state] ?? 'pending',
        thirdTradeNo: data.transaction_id,
        paidAt: data.success_time ? new Date(data.success_time) : undefined,
        extra: data,
    };
};

/**
 * 通用退款
 */
export async function wechatRefund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
    const data = await callWechat(config, 'POST', '/v3/refund/domestic/refunds', {
        out_trade_no: params.paymentNo,
        out_refund_no: params.refundNo,
        reason: params.reason,
        notify_url: config.config?.refundNotifyUrl,
        amount: {
            refund: Math.round(parseFloat(params.amount) * 100),
            total: Math.round(parseFloat(params.totalAmount) * 100),
            currency: 'CNY',
        },
    });
    return {
        refundNo: params.refundNo,
        thirdRefundNo: data.refund_id,
        status: data.status === 'SUCCESS' ? 'success' : 'pending',
    };
};