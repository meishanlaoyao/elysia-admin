---
title: 支付集成 - Elysia Admin 指南
description: 介绍 Elysia Admin 中支付宝、微信支付、PayPal 的统一支付适配层，包括 Pay 路由、商户配置、下单查询退款与异步回调，以及与商户配置表、业务支付模块的配合方式。
---

# 支付集成

对接支付宝、微信、PayPal 时，各家的 API、签名、回调格式都不一样。项目在 `server/src/infrastructure/clients/payment/` 封装了统一入口 `Pay(channel, platform)`，用「渠道 + 终端」路由到具体实现，对外暴露同一套 `create` / `query` / `refund` / `notify` / `notifySuccess` 方法。

类型定义在 `server/src/types/pay.ts`。业务模块 `business-payments` 已从 `business_merchant_configs` 读商户配置并调用 `Pay`，可作为参考实现。

```mermaid
flowchart LR
    Biz[handle.ts] --> Pay["Pay(channel, platform)"]
    Pay --> Reg[registry 解析]
    Reg --> AP[alipay/*]
    Reg --> WC[wechat/*]
    Reg --> PP[paypal/*]
```

## 渠道与终端

`channel` 为支付渠道，`platform` 为终端类型。只有下表中打勾的组合才能调用，否则会抛出「不支持的支付组合」。

| channel | app | h5 | mini | pc |
|---------|:---:|:--:|:----:|:--:|
| alipay  | ✅  | ✅ | ✅   | ✅ |
| wechat  | ✅  | ✅ | ✅   | ✅ |
| paypal  | ❌  | ✅ | ❌   | ✅ |

TypeScript 类型：`PaymentChannel`、`PaymentPlatform`（`@/types/pay`）。

## 快速入门

```ts
import { Pay } from '@/infrastructure/clients/payment';
import type { MerchantConfig } from '@/types/pay';

const client = Pay('alipay', 'mini');
```

| 方法 | 作用 |
|------|------|
| `create` | 发起支付，返回本地 `paymentNo` 与前端调起参数 `payload` |
| `query` | 主动查询支付状态 |
| `refund` | 发起退款 |
| `notify` | 解析异步回调（验签、解密） |
| `notifySuccess` | 返回各平台要求的成功应答字符串 |

各方法第一个参数均为 `MerchantConfig`，第二个为业务入参（`PaymentCreateParams`、`QueryParams` 等）。

## 商户配置

`MerchantConfig` 定义在 `@/types/pay`。私钥与密钥只存服务端，不要下发前端。

| 字段 | 说明 |
|------|------|
| `appId` | 支付宝/微信 AppID，或 PayPal Client ID |
| `mchId` | 微信商户号 |
| `privateKey` | 商户私钥 PEM，或 PayPal Client Secret |
| `publicKey` | 支付宝公钥 / 微信平台证书公钥（回调验签） |
| `config` | 扩展 JSON，各渠道专用字段见下文 |

多商户场景：从 `business_merchant_configs` 按 `merchantId`、`channel` 查出记录，把 `app_id`、`mch_id`、`private_key`、`public_key`、`config` 映射为 `MerchantConfig` 传入 `Pay`。

**支付宝私钥**：支持 PKCS#8（`BEGIN PRIVATE KEY`）与 PKCS#1（`BEGIN RSA PRIVATE KEY`）；纯 Base64 无 PEM 头时会按 PKCS#1 自动补全。

**微信验签**：除顶层 `publicKey` 外，可在 `config.platformCerts` 按证书序列号维护多把平台公钥，对应回调头 `Wechatpay-Serial`，便于证书轮换。

### 支付宝 config

`buildAlipayRequest` 会读取 `notifyUrl`、`returnUrl`，至少配置异步通知地址。

```json
{
  "notifyUrl": "https://your.domain/api/business/payments/notify",
  "returnUrl": "https://your.domain/h5/pay/result"
}
```

- `notifyUrl`：支付结果异步通知，需外网 HTTPS 可访问
- `returnUrl`：同步跳转页（PC/H5 支付完成后回跳）；纯 App API 可为空

若业务 `create` 入参里也传了 `notifyUrl` / `returnUrl`，请与库中配置保持一致，避免网关公共参数与下单入参矛盾。

### 微信 config

V3 接口**必须**有 `serialNo` 和 `apiV3Key`，缺省会直接报错。

```json
{
  "serialNo": "7132D72A000000XXXXXXXXXXXXXXXXXX",
  "apiV3Key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refundNotifyUrl": "https://your.domain/api/business/payments/refund-notify",
  "platformCerts": {
    "序列号A": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "序列号B": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
  }
}
```

- `serialNo`：商户 API 证书序列号，用于请求头 `Authorization`
- `apiV3Key`：32 字节 APIv3 密钥，解密回调 `resource` 密文
- `refundNotifyUrl`：可选，退款结果通知
- `platformCerts`：可选，按序列号选公钥验签；未命中时用顶层 `publicKey`

下单 body 核心字段（`appid`、`mchid`、`out_trade_no`、`notify_url`、`amount`）不会被 `extra` 覆盖；`extra` 仅用于补充字段（如小程序 `openid`）。

### PayPal config

REST 用 `appId` + `privateKey`（Client ID / Secret）。回调验签依赖 Webhook ID。

```json
{
  "webhookId": "1AB23C45DE6789012"
}
```

注意：

- `webhookId` 缺省将无法完成回调验签
- 当前 `providers/paypal/base.ts` 默认 API 根地址为**沙箱** `api-m.sandbox.paypal.com`；生产环境需改为 `https://api-m.paypal.com`，并使用 Live 密钥
- `PaymentCreateParams.notifyUrl` **不会**传给 PayPal 下单；支付结果靠 PayPal 后台 Webhook + 本项目 `notify` + `webhookId`

## 发起支付 create

```ts
const result = await Pay('alipay', 'mini').create(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    title: '商品名称',
    description: '商品描述',       // 可选
    amount: '99.00',               // 字符串，单位元；微信会安全转为分
    currency: 'CNY',               // 可选；PayPal 常用 USD
    notifyUrl: 'https://your.domain/pay/notify',
    returnUrl: 'https://your.domain/pay/return',  // 可选
    extra: {},
});
```

返回值 `PaymentCreateResult`：

| 字段 | 说明 |
|------|------|
| `paymentNo` | 本地支付单号，建议写入支付流水表 |
| `thirdTradeNo` | 部分渠道下单阶段即返回第三方单号 |
| `payload` | 交给前端调起支付，形态随渠道/终端变化 |

`paymentNo` 可选传入：业务已有流水号时带上；否则服务端生成。支付宝各端、微信各端、PayPal H5/PC 均支持。

### extra 常见必填

| 渠道 / 终端 | 字段 | 说明 |
|-------------|------|------|
| alipay + mini | `extra.buyerId` | 买家支付宝用户标识 |
| wechat + mini | `extra.openid` | 用户 openid，缺省报错 |
| wechat + h5 | `extra.clientIp` | 用户出口 IP，建议填写 |
| paypal + h5 | `extra.cancelUrl` | 取消支付跳转；不传则用 `returnUrl` |

### payload 形态摘要

| 终端 | 常见 payload |
|------|----------------|
| 支付宝 App | 原生 SDK 订单串 |
| 支付宝 H5 / PC | `{ payUrl }` |
| 支付宝小程序 | `{ tradeNo }` → `my.tradePay` |
| 微信 App / 小程序 | App 调起参数 / `wx.requestPayment` 参数 |
| 微信 H5 | `{ h5Url }` |
| 微信 PC | `{ codeUrl }` 扫码 |
| PayPal H5 | `{ approveUrl, orderId }` |
| PayPal PC | `{ orderId }` 供 JS SDK |

## 查询 query

```ts
const result = await Pay('wechat', 'mini').query(merchantConfig, {
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '4200001...',  // 依渠道含义不同
});
```

`result.status`：`'pending' | 'success' | 'failed' | 'closed'`。成功时关注 `paidAt`、`thirdTradeNo`。

| 渠道 | `thirdTradeNo` |
|------|----------------|
| 支付宝 / 微信 | 可选，有助于精确查询 |
| PayPal | **必填**，须为 PayPal Order ID（`payload.orderId`），不能仅用本地 `paymentNo` |

## 退款 refund

```ts
const result = await Pay('alipay', 'app').refund(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '2024...',
    refundNo: 'REFUND_20240101_001',
    amount: '10.00',
    totalAmount: '99.00',
    reason: '用户申请退款',
    extra: {
        // PayPal：captureId 必填；currency 建议与捕获币种一致
    },
});
```

- 微信：金额字符串解析为元再转分，避免浮点误差
- PayPal：`extra.captureId` 必填；`extra.currency` 建议填写，缺省 USD

## 异步回调

支付网关 POST 到你配置的 `notifyUrl`。路由里读取**原始 body** 和**请求头**，交给 `notify` 验签解析；业务校验金额与幂等后更新订单，用 `notifySuccess()` 返回值作为 HTTP 响应体。

微信特别注意：必须用原始 body 字符串，不要用已 `JSON.parse` 再 `stringify` 的对象代替。

```ts
// 推荐：从 request 读原始 body（适配所有渠道）
const rawBody = await request.text();
const headers: Record<string, string> = {};
request.headers.forEach((v, k) => { headers[k] = v; });

const client = Pay('wechat', 'mini');
try {
    const result = await client.notify(merchantConfig, { rawBody, headers });
    if (result.status === 'success') {
        // 更新订单、支付流水（注意幂等与金额校验）
    }
    return new Response(client.notifySuccess(), { status: 200 });
} catch {
    return new Response('fail', { status: 400 });
}
```

成功响应格式（`notifySuccess()`）：

| 渠道 | 返回值 |
|------|--------|
| alipay | `success` |
| wechat | `{"code":"SUCCESS","message":"成功"}` |
| paypal | 空字符串 `''`（HTTP 2xx 即可） |

验签失败应返回非 2xx，以便渠道按策略重试。

```mermaid
sequenceDiagram
    participant GW as 支付网关
    participant API as 业务路由
    participant Pay as Pay(...).notify

    GW->>API: POST 原始 body + headers
    API->>Pay: notify(merchantConfig, ...)
    Pay->>Pay: 验签 / 解密
    Pay-->>API: NotifyResult
    API->>GW: 200 + notifySuccess()
```

### PayPal 回调补充

- 验签依赖 `paypal-*` 请求头，适配层对大小写不敏感
- 支付成功类事件以 `PAYMENT.CAPTURE.*` 为主；`thirdTradeNo` 一般为 Capture ID
- 需要 Order ID 时看 `extra.paypalOrderId`
- `orderNo` 来自 `custom_id` / `invoice_id`；`paymentNo` 与 `reference_id` 对齐

## 完整示例：支付宝小程序

```ts
import { Pay } from '@/infrastructure/clients/payment';
import type { MerchantConfig } from '@/types/pay';

const merchantConfig: MerchantConfig = {
    appId: '2021000000000000',
    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
    publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
    config: {
        notifyUrl: 'https://your.domain/pay/notify/alipay',
        returnUrl: 'https://your.domain/pay/return',
    },
};

const { paymentNo, payload } = await Pay('alipay', 'mini').create(merchantConfig, {
    orderNo: order.orderNo,
    title: order.title,
    amount: order.amount,
    notifyUrl: 'https://your.domain/pay/notify/alipay',
    extra: { buyerId: user.alipayUid },
});

// 1. 将 paymentNo 写入 business_payments 流水表
// 2. 将 payload.tradeNo 返回小程序，调用 my.tradePay({ tradeNO: payload.tradeNo })

// 回调路由（原始 body）：
// const result = await Pay('alipay', 'mini').notify(merchantConfig, { rawBody, headers });
// return Pay('alipay', 'mini').notifySuccess();
```

业务侧完整流程（订单校验、商户配置、事务写流水）见 `server/src/modules/business-payments/handle.ts` 的 `payOrder` 与 `payOrderNotify`。

## 扩展新渠道

在 `server/src/infrastructure/clients/payment/providers/` 下新增目录，实现 `IPaymentProvider`（`@/types/pay`）。

在 `payment/index.ts` 的 `registry` 注册 `channel -> platform -> provider` 映射。

在 `server/src/types/pay.ts` 扩展 `PaymentChannel` 联合类型。

完成后即可 `Pay('新渠道', '某平台')` 获得统一调用方式。

## 常见问题

- **不支持的支付组合**：对照渠道终端表，PayPal 不支持 app/mini
- **微信 API 报错缺 serialNo / apiV3Key**：检查 `config` JSON 是否完整
- **回调验签失败**：微信用原始 body；支付宝公钥是否配对；PayPal `webhookId` 是否与后台一致
- **PayPal 沙箱/生产混用**：沙箱密钥不能打生产网关
- **金额不一致**：支付金额以数据库订单为准，不要用前端传来的金额（见 `business-payments` 注释）
