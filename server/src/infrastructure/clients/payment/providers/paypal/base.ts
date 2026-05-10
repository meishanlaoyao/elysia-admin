import crypto from 'node:crypto';
import type {
    MerchantConfig,
    QueryParams,
    QueryResult,
    RefundParams,
    RefundResult,
    NotifyParams,
    NotifyResult
} from '@/types/pay';

const GATEWAYS = {
    SANDBOX_ENV: 'https://api-m.sandbox.paypal.com',
    PRODUCTION_ENV: 'https://api-m.paypal.com',
};

const BASE_URL = GATEWAYS.SANDBOX_ENV;

/** PayPal 传入的请求头大小写不统一，按名称不区分大小写查找 */
function getPaypalHeader(headers: Record<string, string>, name: string): string | undefined {
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() === lower) return v;
    }
    return undefined;
}

async function parseJsonResponse(res: Response): Promise<any> {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`PayPal 响应非 JSON: HTTP ${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
    }
}

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
    const json = await parseJsonResponse(res);
    if (!res.ok) {
        throw new Error(`PayPal 获取 token 失败: ${json.error_description ?? json.message ?? JSON.stringify(json)}`);
    }
    return json.access_token;
};

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
    const json = await parseJsonResponse(res);
    if (!res.ok) {
        throw new Error(`PayPal 请求失败: [${json.name ?? res.status}] ${json.message ?? JSON.stringify(json)}`);
    }
    return json as T;
};

/**
 * 通用查询（thirdTradeNo 须为创建订单接口返回的 PayPal Order ID，不能仅凭商户 paymentNo 查询）
 */
export async function paypalQuery(config: MerchantConfig, params: QueryParams): Promise<QueryResult> {
    const orderId = params.thirdTradeNo?.trim();
    if (!orderId) {
        throw new Error(
            'PayPal 查询需要提供 thirdTradeNo（应为创建订单返回的 PayPal Order ID；若仅有商户 paymentNo，请先通过本地映射取得对应 Order ID）',
        );
    }
    const data = await callPaypal(config, 'GET', `/v2/checkout/orders/${encodeURIComponent(orderId)}`);
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
};

/**
 * 通用退款（需要先拿到 capture_id）
 */
export async function paypalRefund(config: MerchantConfig, params: RefundParams): Promise<RefundResult> {
    // captureId 存在 extra.captureId 里
    const captureId = params.extra?.captureId;
    if (!captureId) throw new Error('PayPal 退款需要提供 captureId');
    const currency =
        params.extra?.currency != null && String(params.extra.currency).trim() !== ''
            ? String(params.extra.currency).trim().toUpperCase()
            : 'USD';
    const data = await callPaypal(config, 'POST', `/v2/payments/captures/${captureId}/refund`, {
        amount: { value: params.amount, currency_code: currency },
        note_to_payer: params.reason,
        invoice_id: params.refundNo,
    });
    return {
        refundNo: params.refundNo,
        thirdRefundNo: data.id,
        status: data.status === 'COMPLETED' ? 'success' : 'pending',
    };
};

function mapPaypalCaptureNotifyStatus(eventType: string, resource: Record<string, any>): 'success' | 'failed' {
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        return resource?.status === 'COMPLETED' ? 'success' : 'failed';
    }
    if (
        eventType === 'PAYMENT.CAPTURE.DENIED' ||
        eventType === 'PAYMENT.CAPTURE.DECLINED' ||
        eventType === 'PAYMENT.CAPTURE.PENDING' ||
        eventType === 'PAYMENT.CAPTURE.REFUNDED'
    ) {
        return 'failed';
    }
    return 'failed';
}

/**
 * 验证 PayPal Webhook 签名并解析
 * 需要在 config.config.webhookId 中配置 Webhook ID
 */
export async function parsePaypalNotify(config: MerchantConfig, params: NotifyParams): Promise<NotifyResult> {
    const raw = typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString('utf8');
    const body = JSON.parse(raw);

    const webhookIdRaw = config.config?.webhookId;
    if (webhookIdRaw == null || String(webhookIdRaw).trim() === '') {
        throw new Error('PayPal Webhook 验签缺少 webhookId（请在 MerchantConfig.config.webhookId 中配置）');
    }

    // 调用 PayPal 验签接口
    const token = await getAccessToken(config);
    const verifyRes = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth_algo: getPaypalHeader(params.headers, 'paypal-auth-algo'),
            cert_url: getPaypalHeader(params.headers, 'paypal-cert-url'),
            transmission_id: getPaypalHeader(params.headers, 'paypal-transmission-id'),
            transmission_sig: getPaypalHeader(params.headers, 'paypal-transmission-sig'),
            transmission_time: getPaypalHeader(params.headers, 'paypal-transmission-time'),
            webhook_id: String(webhookIdRaw).trim(),
            webhook_event: body,
        }),
    });
    const verifyJson = await parseJsonResponse(verifyRes);
    if (!verifyRes.ok) {
        throw new Error(`PayPal Webhook 验签接口 HTTP 失败: ${verifyJson.message ?? JSON.stringify(verifyJson)}`);
    }
    if (verifyJson.verification_status !== 'SUCCESS') {
        throw new Error('PayPal 回调验签失败');
    }

    const resource = body.resource ?? {};
    const eventType = body.event_type as string;
    const relatedIds = resource.supplementary_data?.related_ids ?? {};
    const paypalOrderId =
        typeof relatedIds.order_id === 'string' ? relatedIds.order_id : undefined;

    /** 下单时 purchase_units[].custom_id 多为业务订单号 orderNo */
    const orderNoRaw =
        resource.custom_id ??
        resource.invoice_id ??
        paypalOrderId ??
        resource.id ??
        '';

    /** 下单时 purchase_units[].reference_id 对应本地 paymentNo（若回调中带 reference_id） */
    const paymentNoRef =
        typeof resource.reference_id === 'string' && resource.reference_id.trim() !== ''
            ? resource.reference_id.trim()
            : undefined;

    const status =
        eventType?.startsWith('PAYMENT.CAPTURE.') === true
            ? mapPaypalCaptureNotifyStatus(eventType, resource)
            : 'failed';

    const extra = {
        ...resource,
        ...(paypalOrderId ? { paypalOrderId } : {}),
        _paypalEventType: eventType,
    };

    return {
        orderNo: String(orderNoRaw),
        ...(paymentNoRef !== undefined ? { paymentNo: paymentNoRef } : {}),
        thirdTradeNo: resource.id != null ? String(resource.id) : '',
        amount: resource.amount?.value != null ? String(resource.amount.value) : '0',
        status,
        extra,
    };
};