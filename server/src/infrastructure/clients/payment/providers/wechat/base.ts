import crypto from 'node:crypto';
import { sha256WithRsa, aesGcmDecrypt } from '../crypto';
import type {
    MerchantConfig,
    QueryParams,
    QueryResult,
    RefundParams,
    RefundResult,
    NotifyParams,
    NotifyResult
} from '@/types/pay';

const BASE_URL = 'https://api.mch.weixin.qq.com';

/**
 * 人民币金额字符串（元，最多两位小数）转为分，避免 parseFloat 浮点误差
 */
function yuanStringToCents(amount: string): number {
    const s = String(amount).trim();
    const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
    if (!m) {
        throw new Error(`微信支付金额格式无效（应为非负数字符串，最多两位小数）: ${amount}`);
    }
    const intPart = m[1];
    const frac = (m[2] ?? '').padEnd(2, '0').slice(0, 2);
    const cents = BigInt(intPart) * 100n + BigInt(frac);
    const n = Number(cents);
    if (!Number.isSafeInteger(n)) {
        throw new Error(`微信支付金额超出安全整数范围: ${amount}`);
    }
    return n;
}

/**
 * 按 Wechatpay-Serial 选择平台公钥 PEM；支持 config.platformCerts[serial]，否则回退 config.publicKey（证书轮换）
 */
function resolveWechatNotifyPublicKey(config: MerchantConfig, serialFromHeader: string | undefined): string {
    const serial = serialFromHeader?.trim();
    const map = config.config?.platformCerts as Record<string, string> | undefined;
    if (serial && map && typeof map[serial] === 'string' && map[serial].trim() !== '') {
        return map[serial].trim();
    }
    const fallback = config.publicKey;
    if (fallback == null || String(fallback).trim() === '') {
        throw new Error(
            '微信回调验签缺少平台公钥：请设置 MerchantConfig.publicKey，或在 MerchantConfig.config.platformCerts 中按「证书序列号 → PEM 公钥」配置（与请求头 Wechatpay-Serial 对应）',
        );
    }
    return String(fallback).trim();
}

/**
 * 生成微信 v3 Authorization 请求头
 */
function buildWechatAuth(config: MerchantConfig, method: string, url: string, body: string): string {
    const serialNoRaw = config.config?.serialNo;
    if (serialNoRaw == null || String(serialNoRaw).trim() === '') {
        throw new Error('微信支付缺少商户 API 证书序列号（请在 MerchantConfig.config.serialNo 中配置）');
    }
    const serialNo = String(serialNoRaw).trim();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const urlPath = new URL(url).pathname + (new URL(url).search || '');
    const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
    const signature = sha256WithRsa(message, config.privateKey!);
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
        },
        ...(bodyStr ? { body: bodyStr } : {}),
    });
    const text = await res.text();
    let json: any;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`微信支付响应非 JSON: HTTP ${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
        const detail = json?.message ?? json?.detail ?? text.slice(0, 200);
        throw new Error(`微信支付请求失败: [${json?.code ?? res.status}] ${detail}`);
    }
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
    const extra = params.extra ?? {};
    return {
        ...extra,
        appid: config.appId,
        mchid: config.mchId,
        description: params.title,
        out_trade_no: paymentNo,
        notify_url: params.notifyUrl,
        amount: {
            total: yuanStringToCents(params.amount),
            currency: 'CNY',
        },
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

function getNotifyHeader(headers: Record<string, string>, name: string): string | undefined {
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() === lower) return v;
    }
    return undefined;
}

/**
 * 验证微信回调签名并解密 resource
 * 注意：验签必须使用网关收到的原始 body 字符串（与 Content-Length 一致），不能使用已 JSON.parse 的对象再 stringify。
 */
export function parseWechatNotify(config: MerchantConfig, params: NotifyParams): NotifyResult {
    let raw: string;
    if (typeof params.rawBody === 'string') {
        raw = params.rawBody;
    } else if (Buffer.isBuffer(params.rawBody)) {
        raw = params.rawBody.toString('utf8');
    } else if (params.rawBody !== null && typeof params.rawBody === 'object') {
        throw new Error('微信异步通知验签需要原始请求体字符串，请传入 request.text() 等返回的原始 body，勿传入已解析对象');
    } else {
        raw = String(params.rawBody ?? '');
    }

    const body = JSON.parse(raw);
    const timestamp = getNotifyHeader(params.headers, 'wechatpay-timestamp');
    const nonce = getNotifyHeader(params.headers, 'wechatpay-nonce');
    const signature = getNotifyHeader(params.headers, 'wechatpay-signature');
    const certSerial = getNotifyHeader(params.headers, 'wechatpay-serial');
    if (!timestamp || !nonce || !signature) {
        throw new Error('微信回调缺少验签所需请求头（wechatpay-timestamp / wechatpay-nonce / wechatpay-signature）');
    }
    const message = `${timestamp}\n${nonce}\n${raw}\n`;
    const verify = crypto.createVerify('SHA256withRSA');
    verify.update(message);
    const platformPublicKey = resolveWechatNotifyPublicKey(config, certSerial);
    if (!verify.verify(platformPublicKey, signature, 'base64')) {
        throw new Error('微信回调验签失败');
    }
    // 解密 resource
    if (!body.resource || typeof body.resource !== 'object') {
        throw new Error('微信回调 body 缺少 resource 字段');
    }
    const { ciphertext, nonce: resNonce, associated_data } = body.resource;
    const apiV3Key = config.config?.apiV3Key as string | undefined;
    if (apiV3Key == null || String(apiV3Key).trim() === '') {
        throw new Error('微信回调解密缺少 apiV3Key（请在 MerchantConfig.config.apiV3Key 中配置）');
    }
    const plaintext = aesGcmDecrypt(ciphertext, String(apiV3Key).trim(), resNonce, associated_data ?? '');
    const trade = JSON.parse(plaintext);
    const payerTotal = trade.amount?.payer_total ?? trade.amount?.total ?? 0;
    const paymentNo = trade.out_trade_no as string;
    const attach = trade.attach != null && String(trade.attach).trim() !== '' ? String(trade.attach) : '';
    return {
        orderNo: attach || paymentNo,
        paymentNo,
        thirdTradeNo: trade.transaction_id,
        amount: (payerTotal / 100).toFixed(2),
        status: trade.trade_state === 'SUCCESS' ? 'success' : 'failed',
        extra: trade,
    };
};

/**
 * 通用查询
 */
export async function wechatQuery(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
    const path = `/v3/pay/transactions/out-trade-no/${encodeURIComponent(params.paymentNo)}?mchid=${encodeURIComponent(String(config.mchId ?? ''))}`;
    const data = await callWechat(config, 'GET', path);
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
            refund: yuanStringToCents(params.amount),
            total: yuanStringToCents(params.totalAmount),
            currency: 'CNY',
        },
    });
    return {
        refundNo: params.refundNo,
        thirdRefundNo: data.refund_id,
        status: data.status === 'SUCCESS' ? 'success' : 'pending',
    };
};