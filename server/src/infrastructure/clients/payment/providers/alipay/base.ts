import { rsaSign, rsaVerify, buildSortedQueryString } from '../crypto';
import type { MerchantConfig, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';

const GATEWAY = 'https://openapi.alipay.com/gateway.do';

/**
 * 构造支付宝公共请求参数并签名，返回完整的 POST body（application/x-www-form-urlencoded）
 */
export function buildAlipayRequest(
    config: MerchantConfig,
    method: string,
    bizContent: Record<string, any>,
): string {
    const params: Record<string, string> = {
        app_id: config.appId!,
        method,
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        version: '1.0',
        biz_content: JSON.stringify(bizContent),
    };

    const signStr = buildSortedQueryString(params);
    params.sign = rsaSign(signStr, config.privateKey!);

    return new URLSearchParams(params).toString();
}

/**
 * 发送支付宝请求并返回解析后的响应
 */
export async function callAlipay<T = any>(
    config: MerchantConfig,
    method: string,
    bizContent: Record<string, any>,
): Promise<T> {
    const body = buildAlipayRequest(config, method, bizContent);
    const res = await fetch(GATEWAY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body,
    });

    const json = await res.json() as Record<string, any>;
    // 响应 key 格式：alipay_trade_xxx_response
    const responseKey = method.replace(/\./g, '_') + '_response';
    const data = json[responseKey];

    if (!data) throw new Error(`支付宝响应异常: ${JSON.stringify(json)}`);
    if (data.code !== '10000') throw new Error(`支付宝业务错误: [${data.code}] ${data.sub_msg || data.msg}`);

    return data as T;
}

/**
 * 验证支付宝异步通知签名并解析
 */
export function parseAlipayNotify(config: MerchantConfig, params: NotifyParams): NotifyResult {
    const raw = typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString('utf8');
    const urlParams = new URLSearchParams(raw);
    const map: Record<string, string> = {};
    urlParams.forEach((v, k) => { map[k] = v; });

    const { sign, sign_type, ...rest } = map;
    const signStr = buildSortedQueryString(rest);

    if (!rsaVerify(signStr, sign, config.publicKey!)) {
        throw new Error('支付宝回调验签失败');
    }

    const status = map.trade_status === 'TRADE_SUCCESS' || map.trade_status === 'TRADE_FINISHED'
        ? 'success' as const
        : 'failed' as const;

    return {
        orderNo: map.out_trade_no,
        thirdTradeNo: map.trade_no,
        amount: map.total_amount,
        status,
        extra: map as any,
    };
}

/**
 * 通用查询
 */
export async function alipayQuery(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
    const data = await callAlipay(config, 'alipay.trade.query', {
        out_trade_no: params.paymentNo,
        ...(params.thirdTradeNo ? { trade_no: params.thirdTradeNo } : {}),
    });

    const statusMap: Record<string, QueryResult['status']> = {
        WAIT_BUYER_PAY: 'pending',
        TRADE_CLOSED: 'closed',
        TRADE_SUCCESS: 'success',
        TRADE_FINISHED: 'success',
    };

    return {
        status: statusMap[data.trade_status] ?? 'pending',
        thirdTradeNo: data.trade_no,
        paidAt: data.send_pay_date ? new Date(data.send_pay_date) : undefined,
        extra: data,
    };
}

/**
 * 通用退款
 */
export async function alipayRefund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
    const data = await callAlipay(config, 'alipay.trade.refund', {
        out_trade_no: params.paymentNo,
        trade_no: params.thirdTradeNo,
        refund_amount: params.amount,
        out_request_no: params.refundNo,
        refund_reason: params.reason,
    });

    return {
        refundNo: params.refundNo,
        thirdRefundNo: data.trade_no,
        status: data.fund_change === 'Y' ? 'success' : 'failed',
    };
}
