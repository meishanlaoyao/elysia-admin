import type { MerchantConfig, QueryParams, QueryResult, RefundParams, RefundResult, NotifyParams, NotifyResult } from '../types';
import crypto from 'node:crypto';

const BASE_URL = 'https://api-m.paypal.com'; // 生产环境；沙箱用 api-m.sandbox.paypal.com

/**
 * 获取 PayPal Access Token（Client Credentials）
 * config.appId = Client ID，config.privateKey = Client Secret
 */
async function getAccessToken(config: MerchantConfig): Promise<string> {
    const credentials = Buffer.from(`${config.appId}:${config.privateKey}`).toString('base64');
    const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const json = await res.json() as any;
    if (!res.ok) throw new Error(`PayPal 获取 token 失败: ${json.error_description}`);
    return json.access_token;
}

/**
 * 发送 PayPal REST API 请求
 */
export async function callPaypal<T = any>(
    config: MerchantConfig,
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, any>,
): Promise<T> {
    const token = await getAccessToken(config);
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': crypto.randomUUID(), // 幂等 key
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const json = await res.json() as any;
    if (!res.ok) throw new Error(`PayPal 请求失败: [${json.name}] ${json.message}`);
    return json as T;
}

/**
 * 通用查询
 */
export async function paypalQuery(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
    const data = await callPaypal(config, 'GET', `/v2/checkout/orders/${params.thirdTradeNo}`);

    const statusMap: Record<string, QueryResult['status']> = {
        CREATED: 'pending',
        SAVED: 'pending',
        APPROVED: 'pending',
        VOIDED: 'closed',
        COMPLETED: 'success',
        PAYER_ACTION_REQUIRED: 'pending',
    };

    return {
        status: statusMap[data.status] ?? 'pending',
        thirdTradeNo: data.id,
        extra: data,
    };
}

/**
 * 通用退款（需要先拿到 capture_id）
 */
export async function paypalRefund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
    // captureId 存在 extra.captureId 里
    const captureId = params.extra?.captureId;
    if (!captureId) throw new Error('PayPal 退款需要提供 captureId');

    const data = await callPaypal(config, 'POST', `/v2/payments/captures/${captureId}/refund`, {
        amount: { value: params.amount, currency_code: 'USD' },
        note_to_payer: params.reason,
        invoice_id: params.refundNo,
    });

    return {
        refundNo: params.refundNo,
        thirdRefundNo: data.id,
        status: data.status === 'COMPLETED' ? 'success' : 'pending',
    };
}

/**
 * 验证 PayPal Webhook 签名并解析
 * 需要在 config.config.webhookId 中配置 Webhook ID
 */
export async function parsePaypalNotify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> {
    const raw = typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString('utf8');
    const body = JSON.parse(raw);

    // 调用 PayPal 验签接口
    const token = await getAccessToken(config);
    const verifyRes = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_algo: params.headers['paypal-auth-algo'],
            cert_url: params.headers['paypal-cert-url'],
            transmission_id: params.headers['paypal-transmission-id'],
            transmission_sig: params.headers['paypal-transmission-sig'],
            transmission_time: params.headers['paypal-transmission-time'],
            webhook_id: config.config?.webhookId,
            webhook_event: body,
        }),
    });

    const verifyJson = await verifyRes.json() as any;
    if (verifyJson.verification_status !== 'SUCCESS') {
        throw new Error('PayPal 回调验签失败');
    }

    const resource = body.resource;
    const isSuccess = body.event_type === 'PAYMENT.CAPTURE.COMPLETED';

    return {
        orderNo: resource.invoice_id ?? resource.custom_id,
        thirdTradeNo: resource.id,
        amount: resource.amount?.value ?? '0',
        status: isSuccess ? 'success' : 'failed',
        extra: resource,
    };
}
