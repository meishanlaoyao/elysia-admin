# 支付适配层使用文档

统一封装支付宝、微信支付、PayPal 的支付逻辑，通过 `pay(channel, platform)` 一行代码路由到对应实现。

---

## 支持的渠道与平台

| channel  | app | h5 | mini | pc |
|----------|-----|----|------|----|
| alipay   | ✅  | ✅ | ✅   | ✅ |
| wechat   | ✅  | ✅ | ✅   | ✅ |
| paypal   | ❌  | ✅ | ❌   | ✅ |

---

## 快速开始

```ts
import { pay } from '@/infrastructure/clients/payment';
```

`pay(channel, platform)` 返回一个包含 5 个方法的对象：`create` / `query` / `refund` / `notify` / `notifySuccess`。

所有方法的第一个参数都是 `MerchantConfig`（商户配置），第二个参数是各自的入参。

---

## MerchantConfig 商户配置

```ts
interface MerchantConfig {
    appId?: string;       // 支付宝 APPID / 微信 APPID / PayPal Client ID
    mchId?: string;       // 微信商户号
    privateKey?: string;  // 商户私钥（支付宝/微信 RSA 私钥 PKCS8 PEM / PayPal Client Secret）
    publicKey?: string;   // 平台公钥（支付宝公钥 / 微信平台证书公钥）
    config?: {
        // 微信专用
        serialNo?: string;        // 微信商户证书序列号
        apiV3Key?: string;        // 微信 APIv3 密钥（32位）
        refundNotifyUrl?: string; // 微信退款回调地址
        // PayPal 专用
        webhookId?: string;       // PayPal Webhook ID
        // 其他扩展字段
        [key: string]: any;
    };
}
```

通常从数据库 `business_merchant_configs` 表读取后直接传入即可。

---

## create — 发起支付

```ts
const result = await pay('alipay', 'mini').create(merchantConfig, {
    orderNo: 'ORDER_20240101_001',   // 业务订单号
    title: '商品名称',
    description: '商品描述',          // 可选
    amount: '99.00',                  // 金额，字符串，单位元
    currency: 'CNY',                  // 可选，默认 CNY（PayPal 默认 USD）
    notifyUrl: 'https://your.domain/pay/notify',
    returnUrl: 'https://your.domain/pay/return', // 可选，支付完成跳转
    extra: { ... },                   // 各平台特殊参数，见下方说明
});

// result.paymentNo    — 本地生成的支付单号，存入数据库
// result.thirdTradeNo — 第三方交易号（部分平台在此返回）
// result.payload      — 直接返回给前端的支付参数
```

### extra 特殊参数说明

| 渠道/平台 | 字段 | 说明 |
|-----------|------|------|
| alipay / mini | `extra.buyerId` | 买家支付宝 uid，**必传** |
| wechat / mini | `extra.openid` | 用户 openid，**必传** |
| wechat / h5 | `extra.clientIp` | 用户客户端 IP，建议传 |

### 各平台 payload 格式

**支付宝 App** — `payload` 是 orderString 字符串，App 端直接调起
```ts
// result.payload => "app_id=xxx&method=alipay.trade.app.pay&sign=xxx..."
```

**支付宝 H5 / PC** — 返回跳转 URL
```ts
// result.payload => { payUrl: "https://openapi.alipay.com/gateway.do?..." }
```

**支付宝小程序** — 返回 tradeNo，小程序端调用 `my.tradePay({ tradeNO })`
```ts
// result.payload => { tradeNo: "2024..." }
```

**微信 App** — 返回 App 调起参数
```ts
// result.payload => { appid, partnerid, prepayid, package, noncestr, timestamp, sign }
```

**微信 H5** — 返回跳转链接
```ts
// result.payload => { h5Url: "https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?..." }
```

**微信小程序 / JSAPI** — 返回 `wx.requestPayment` 所需参数
```ts
// result.payload => { appId, timeStamp, nonceStr, package, signType, paySign }
```

**微信 PC（Native）** — 返回二维码链接
```ts
// result.payload => { codeUrl: "weixin://wxpay/bizpayurl?..." }
```

**PayPal H5** — 返回授权跳转链接
```ts
// result.payload => { approveUrl: "https://www.paypal.com/checkoutnow?...", orderId: "..." }
```

**PayPal PC** — 返回 orderId 给前端 JS SDK
```ts
// result.payload => { orderId: "5O190127TN364715T" }
```

---

## query — 查询支付状态

```ts
const result = await pay('wechat', 'mini').query(merchantConfig, {
    paymentNo: 'LOCAL_PAYMENT_NO',    // 本地支付单号
    thirdTradeNo: '4200001...',       // 第三方交易号（可选，PayPal 查询必传）
});

// result.status  => 'pending' | 'success' | 'failed' | 'closed'
// result.thirdTradeNo
// result.paidAt  => Date | undefined
// result.extra   => 原始响应
```

---

## refund — 发起退款

```ts
const result = await pay('alipay', 'app').refund(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '2024...',
    refundNo: 'REFUND_20240101_001',  // 退款单号，业务自己生成
    amount: '10.00',                   // 退款金额
    totalAmount: '99.00',              // 原订单总金额
    reason: '用户申请退款',            // 可选
    extra: {
        captureId: '...',              // PayPal 退款必传，从支付成功回调的 extra 中获取
    },
});

// result.refundNo
// result.thirdRefundNo
// result.status => 'success' | 'pending'
```

---

## notify — 处理异步回调

在你的回调路由 handler 里调用，传入原始请求体和请求头，内部自动完成验签 + 解密。

```ts
// 以 Elysia 为例
app.post('/pay/notify/wechat', async ({ request }) => {
    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });

    const client = pay('wechat', 'mini');

    try {
        const result = await client.notify(merchantConfig, { rawBody, headers });
        // result.orderNo      — 业务订单号
        // result.thirdTradeNo — 第三方交易号
        // result.amount       — 实付金额
        // result.status       — 'success' | 'failed'

        if (result.status === 'success') {
            // 更新订单状态...
        }

        // 返回平台要求的成功响应
        return new Response(client.notifySuccess(), { status: 200 });
    } catch (e) {
        // 验签失败，返回非 200 让平台重试
        return new Response('fail', { status: 400 });
    }
});
```

### notifySuccess — 各平台成功响应格式

| 渠道 | 返回值 |
|------|--------|
| alipay | `"success"` |
| wechat | `'{"code":"SUCCESS","message":"成功"}'` |
| paypal | `"OK"` |

---

## 完整示例：支付宝小程序下单

```ts
import { pay } from '@/infrastructure/clients/payment';
import type { MerchantConfig } from '@/infrastructure/clients/payment';

// 从数据库读取商户配置
const merchantConfig: MerchantConfig = {
    appId: '2021000000000000',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
    publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
};

// 1. 发起支付
const { paymentNo, payload } = await pay('alipay', 'mini').create(merchantConfig, {
    orderNo: order.orderNo,
    title: order.title,
    amount: order.amount,
    notifyUrl: 'https://your.domain/pay/notify/alipay',
    extra: { buyerId: user.alipayUid },
});

// 2. 将 paymentNo 存入 business_payments 表，返回 payload.tradeNo 给小程序端

// 3. 回调处理（另一个路由）
const result = await pay('alipay', 'mini').notify(merchantConfig, { rawBody, headers });
if (result.status === 'success') {
    // 更新 business_payments.status = 'paid'
    // 更新 business_orders.status = 'paid'
}
```

---

## 扩展新渠道

1. 在 `providers/` 下新建目录，实现 `IPaymentProvider` 接口
2. 在 `index.ts` 的 `registry` 中注册

```ts
// providers/stripe/index.ts
export const stripeProviders = { ... };

// index.ts
const registry = {
    alipay: alipayProviders,
    wechat: wechatProviders,
    paypal: paypalProviders,
    stripe: stripeProviders, // 新增
};
```

同时在 `types.ts` 的 `PaymentChannel` 联合类型中加入 `'stripe'` 即可，TypeScript 会自动提示。
