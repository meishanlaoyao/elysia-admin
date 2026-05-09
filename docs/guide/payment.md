---
title: 支付集成 - Elysia Admin 指南
description: 介绍 Elysia Admin 中支付宝、微信支付、PayPal 的统一支付适配层，包括 Pay 路由、商户配置、下单查询退款与异步回调，以及与商户配置表、业务支付模块的配合方式。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 支付, 支付宝, 微信支付, PayPal, Pay, 商户配置, 异步回调
  - - meta
    - property: og:title
      content: 支付集成 - Elysia Admin 指南
  - - meta
    - property: og:description
      content: 使用 Pay(channel, platform) 统一接入多渠道多终端支付，完成下单、查询、退款与验签回调。
---

# 支付集成

本章介绍 `Elysia Admin` 中的支付适配层：在服务端用 `Pay(channel, platform)` 将支付宝、微信支付、PayPal 按「渠道 + 终端」路由到具体实现，统一暴露 `create`、`query`、`refund`、`notify`、`notifySuccess` 五类能力。

实现代码位于 `server/src/infrastructure/clients/payment/`；支付相关的 TypeScript 类型集中在 `server/src/types/pay.ts`。

业务侧已提供订单支付等接口时（例如 `business-payments` 模块），会从 `business_merchant_configs` 等表读取商户配置后调用 `Pay(...).create(...)`。下文侧重「如何调用适配层」；更细的字段说明与示例可与源码目录下的 `README.md` 对照阅读。

## 支持的渠道与平台

并非每种渠道都支持全部终端，调用前请按下表选择合法组合；否则会抛出「不支持的支付组合」错误。

| channel | app | h5 | mini | pc |
| :------ | :-: | :-: | :--: | :-: |
| alipay  | ✅  | ✅  | ✅   | ✅  |
| wechat  | ✅  | ✅  | ✅   | ✅  |
| paypal  | ❌  | ✅  | ❌   | ✅  |

渠道、终端类型在类型系统中分别为 `PaymentChannel`、`PaymentPlatform`（定义见 `@/types/pay`）。

## 快速开始

```ts [ts]
import { Pay } from '@/infrastructure/clients/payment';
import type { MerchantConfig } from '@/types/pay';
```

`Pay(channel, platform)` 返回一个对象，包含以下方法：

| 方法 | 作用 |
| :--- | :--- |
| `create` | 发起支付，得到本地支付单号与前端调起/跳转所需参数 |
| `query` | 主动查询支付状态 |
| `refund` | 发起退款 |
| `notify` | 解析异步回调（验签、解密） |
| `notifySuccess` | 返回各平台要求的「成功应答」字符串，用于 HTTP 响应体 |

各方法的第一个参数均为 `MerchantConfig`，第二个参数为对应业务的入参结构（见 `PaymentCreateParams`、`QueryParams` 等）。

## 商户配置（MerchantConfig）

类型定义在 `@/types/pay` 的 `MerchantConfig`。常见字段与用途如下：

| 字段 | 说明 |
| :--- | :--- |
| `appId` | 支付宝/微信 AppID，或 PayPal 的 Client ID |
| `mchId` | 微信商户号 |
| `privateKey` | 商户私钥（如支付宝/微信 RSA PKCS8 PEM），或 PayPal 的 Client Secret |
| `publicKey` | 支付宝公钥或微信平台证书公钥等，用于验签 |
| `config` | 扩展配置（JSON），常见如微信 `serialNo`、`apiV3Key`、`refundNotifyUrl`，PayPal `webhookId` 等 |

生产环境中私钥与密钥仅存放在服务端，切勿下发前端。

> [!TIP]
> 多商户场景下，通常从数据库表 `business_merchant_configs` 按 `merchantId`、`channel` 查询出一条记录，将 `app_id`、`mch_id`、`private_key`、`public_key`、`config` 等字段映射为 `MerchantConfig` 后传入 `Pay` 各方法。

### `config` 扩展字段示例（按渠道）

数据库里的 `config` 一般为 JSON 对象，映射到 `MerchantConfig.config`。下方字段名需与代码中一致（驼峰命名）。未列出的键会被忽略或由各渠道自行扩展。

#### 支付宝（`channel: 'alipay'`）

适配层在组装网关公共参数时会读取 `config.notifyUrl`、`config.returnUrl`（见 `providers/alipay/base.ts` 中 `buildAlipayRequest`）。**至少应配置异步通知地址**，否则解构配置时可能异常。

```json
{
  "notifyUrl": "https://your.domain/api/business/payments/notify",
  "returnUrl": "https://your.domain/h5/pay/result"
}
```

说明：

- `notifyUrl`：支付宝服务器异步通知（支付结果）地址，需外网可访问、建议使用 HTTPS。
- `returnUrl`：同步跳转页（如电脑网站支付、手机网站支付完成后的回跳）；纯 API / 小程序场景可填空字符串或省略，按业务需要填写。

#### 微信支付（`channel: 'wechat'`）

V3 接口依赖商户 API 证书序列号、APIv3 密钥；退款可选单独退款结果通知地址。

```json
{
  "serialNo": "7132D72A000000XXXXXXXXXXXXXXXXXX",
  "apiV3Key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refundNotifyUrl": "https://your.domain/api/business/payments/refund-notify"
}
```

说明：

- `serialNo`：商户 API 证书序列号（与商户私钥匹配），用于 `Authorization` 头里的 `serial_no`。
- `apiV3Key`：APIv3 密钥（32 位），用于解密支付结果通知里的 `resource` 密文。
- `refundNotifyUrl`：可选；发起退款时若需微信异步通知退款结果，则传给退款接口的 `notify_url`（见 `wechat/base.ts` 中退款请求）。

#### PayPal（`channel: 'paypal'`）

回调验签流程会使用 Webhook 配置中的 ID（见 `providers/paypal/base.ts`）。

```json
{
  "webhookId": "1AB23C45DE6789012"
}
```

说明：

- `webhookId`：在 PayPal 开发者后台为该 REST 应用创建的 Webhook 的 ID，用于校验回调事件是否来自你配置的 Webhook。

---

若业务模块（如订单支付）同时从 `config` 里读取 `notifyUrl`、`returnUrl` 再传给 `Pay().create()`，请保证与库里配置的地址一致，避免「网关公共参数里的通知地址」与「下单入参里的地址」互相矛盾。

## 发起支付：`create`

```ts [ts]
const result = await Pay('alipay', 'mini').create(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    title: '商品名称',
    description: '商品描述', // 可选
    amount: '99.00', // 字符串，单位元
    currency: 'CNY', // 可选；PayPal 常用 USD
    notifyUrl: 'https://your.domain/pay/notify',
    returnUrl: 'https://your.domain/pay/return', // 可选
    extra: {},
});
```

返回值（`PaymentCreateResult`）主要字段：

- `paymentNo`：本地支付单号，建议写入支付流水表并与订单关联。
- `thirdTradeNo`：部分渠道在下单阶段即可返回第三方单号。
- `payload`：交给前端用于调起客户端、跳转 H5、展示二维码等；具体形状随渠道与终端变化。

入参 `PaymentCreateParams` 中 `paymentNo` 为可选：若业务侧复用同一笔待支付流水，可传入已有单号（与订单模块实现保持一致即可）。

### `extra` 中常见必填项

| 渠道 / 终端 | 字段 | 说明 |
| :---------- | :--- | :--- |
| alipay + mini | `extra.buyerId` | 买家支付宝用户标识，必填 |
| wechat + mini | `extra.openid` | 用户 openid，必填 |
| wechat + h5 | `extra.clientIp` | 用户出口 IP，建议填写 |

### 各端 `payload` 形态（摘要）

- **支付宝 App**：`payload` 为可直接交给原生 SDK 的订单串。
- **支付宝 H5 / PC**：常为 `{ payUrl }` 跳转链接。
- **支付宝小程序**：常为 `{ tradeNo }`，供 `my.tradePay` 使用。
- **微信 App / 小程序 / JSAPI**：分别为 App 调起参数、`wx.requestPayment` 参数等。
- **微信 H5**：常为 `{ h5Url }`。
- **微信 PC（Native）**：常为 `{ codeUrl }` 扫码链接。
- **PayPal H5**：常为 `{ approveUrl, orderId }`。
- **PayPal PC**：常为 `{ orderId }` 供前端 JS SDK 使用。

## 查询支付状态：`query`

```ts [ts]
const result = await Pay('wechat', 'mini').query(merchantConfig, {
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '4200001...', // 可选；PayPal 等场景可能必填
});
```

`result.status` 为 `'pending' | 'success' | 'failed' | 'closed'`；成功时可关注 `paidAt`、`thirdTradeNo` 等字段。

## 发起退款：`refund`

```ts [ts]
const result = await Pay('alipay', 'app').refund(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '2024...',
    refundNo: 'REFUND_20240101_001',
    amount: '10.00',
    totalAmount: '99.00',
    reason: '用户申请退款',
    extra: {
        // PayPal 等渠道可能需要 captureId 等，见对应 provider 实现
    },
});
```

## 异步回调：`notify` 与 `notifySuccess`

在支付渠道配置的异步通知 URL 对应的路由中，读取**原始请求体**与**请求头**，交给 `notify` 完成验签与解析；业务校验通过后更新订单与支付流水状态，并使用 `notifySuccess()` 的返回值作为成功时的 HTTP 响应体。

```ts [ts]
app.post('/pay/notify/wechat', async ({ request }) => {
    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => {
        headers[k] = v;
    });

    const client = Pay('wechat', 'mini');
    try {
        const result = await client.notify(merchantConfig, { rawBody, headers });
        if (result.status === 'success') {
            // 更新订单、支付流水等（注意幂等与金额校验）
        }
        return new Response(client.notifySuccess(), { status: 200 });
    } catch {
        return new Response('fail', { status: 400 });
    }
});
```

各渠道成功响应格式（`notifySuccess()`）：

| 渠道 | 典型返回值 |
| :--- | :--- |
| alipay | `success` |
| wechat | `{"code":"SUCCESS","message":"成功"}` |
| paypal | `OK` |

验签失败时应返回非 2xx，以便渠道按策略重试（具体以各平台文档为准）。

## 完整示例：支付宝小程序下单

```ts [ts]
import { Pay } from '@/infrastructure/clients/payment';
import type { MerchantConfig } from '@/types/pay';

const merchantConfig: MerchantConfig = {
    appId: '2021000000000000',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
    publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
};

const { paymentNo, payload } = await Pay('alipay', 'mini').create(merchantConfig, {
    orderNo: order.orderNo,
    title: order.title,
    amount: order.amount,
    notifyUrl: 'https://your.domain/pay/notify/alipay',
    extra: { buyerId: user.alipayUid },
});

// 将 paymentNo 写入支付流水；将 payload.tradeNo 返回给小程序端调起支付

// 回调路由中：
// const result = await Pay('alipay', 'mini').notify(merchantConfig, { rawBody, headers });
```

## 扩展新支付渠道

1. 在 `server/src/infrastructure/clients/payment/providers/` 下新增目录，实现 `IPaymentProvider`（定义见 `@/types/pay`）。
2. 在 `server/src/infrastructure/clients/payment/index.ts` 的 `registry` 中注册 `channel -> platform -> provider` 映射。
3. 在 `server/src/types/pay.ts` 中将 `PaymentChannel` 联合类型扩展为新渠道名称。

完成后，`Pay('新渠道', '某平台')` 即可获得类型提示与统一调用方式。
