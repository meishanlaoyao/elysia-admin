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

业务侧已提供订单支付等接口时（例如 `business-payments` 模块），会从 `business_merchant_configs` 等表读取商户配置后调用 `Pay(...).create(...)`。下文侧重「如何调用适配层」；更细的字段说明可与源码 `providers/*/base.ts` 对照阅读。

## 一、支持的渠道与平台

并非每种渠道都支持全部终端，调用前请按下表选择合法组合；否则会抛出「不支持的支付组合」错误。

| channel | app | h5 | mini | pc |
| :------ | :-: | :-: | :--: | :-: |
| alipay  | ✅  | ✅  | ✅   | ✅  |
| wechat  | ✅  | ✅  | ✅   | ✅  |
| paypal  | ❌  | ✅  | ❌   | ✅  |

渠道、终端类型在类型系统中分别为 `PaymentChannel`、`PaymentPlatform`（定义见 `@/types/pay`）。

## 二、快速入门

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

## 三、商户配置（MerchantConfig）

类型定义在 `@/types/pay` 的 `MerchantConfig`。常见字段与用途如下：

| 字段 | 说明 |
| :--- | :--- |
| `appId` | 支付宝/微信 AppID，或 PayPal 的 Client ID |
| `mchId` | 微信商户号 |
| `privateKey` | 商户私钥 PEM，或 PayPal 的 Client Secret |
| `publicKey` | 支付宝「支付宝公钥」PEM、微信「微信平台证书公钥」PEM（回调验签）；PayPal 此项不按支付宝用法参与 OAuth |
| `config` | 扩展配置（JSON），各渠道专用字段见下文 |

生产环境中私钥与密钥仅存放在服务端，切勿下发前端。

**支付宝私钥格式**：适配层支持 PKCS#8（`-----BEGIN PRIVATE KEY-----`）与 PKCS#1（`-----BEGIN RSA PRIVATE KEY-----`）；若为「仅 Base64、无 PEM 头」的密钥串，会按 PKCS#1 方式自动补全 PEM 头后再签名。

**微信回调验签**：除单个 `publicKey` 外，可在 `config.platformCerts` 中按证书序列号维护多把平台公钥，与回调请求头 `Wechatpay-Serial` 对应，便于微信平台证书轮换（详见下文微信支付配置）。

> [!TIP]
> 多商户场景下，通常从数据库表 `business_merchant_configs` 按 `merchantId`、`channel` 查询出一条记录，将 `app_id`、`mch_id`、`private_key`、`public_key`、`config` 等字段映射为 `MerchantConfig` 后传入 `Pay` 各方法。

### `config` 扩展字段（按渠道）

数据库里的 `config` 一般为 JSON 对象，映射到 `MerchantConfig.config`。字段名需与代码中一致（驼峰命名）。

#### 支付宝（`channel: 'alipay'`）

适配层在组装网关公共参数时会读取 `config.notifyUrl`、`config.returnUrl`（见 `providers/alipay/base.ts` 中 `buildAlipayRequest`）。**至少应配置异步通知地址**，否则部分接口缺少 `notify_url`。

```json
{
  "notifyUrl": "https://your.domain/api/business/payments/notify",
  "returnUrl": "https://your.domain/h5/pay/result"
}
```

说明：

- `notifyUrl`：支付宝服务器异步通知（支付结果）地址，需外网可访问、建议使用 HTTPS。
- `returnUrl`：同步跳转页（如电脑网站支付、手机网站支付完成后的回跳）；纯 API / App 场景可为空字符串；小程序等场景按文档填写。

> [!TIP]
> 若业务模块同时从 `config` 里读取 `notifyUrl`、`returnUrl` 再传给 `Pay().create()`，请保证与库里配置的地址一致，避免「网关公共参数里的通知地址」与「下单入参里的地址」互相矛盾。

#### 微信支付（`channel: 'wechat'`）

V3 接口**必须**配置商户 API 证书序列号 `serialNo`（发起任何 `callWechat` 请求前会校验）；异步通知解密**必须**配置 `apiV3Key`。退款可选单独退款结果通知地址。

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

说明：

- `serialNo`：商户 API 证书序列号（与商户私钥匹配），用于请求头 `Authorization` 中的 `serial_no`。**缺省会导致所有微信 API 调用直接报错。**
- `apiV3Key`：APIv3 密钥（32 字节字符串），用于解密支付结果通知里的 `resource` 密文。**异步回调解密前会校验，缺省将报错。**
- `refundNotifyUrl`：可选；发起退款时传给退款接口的 `notify_url`（见 `wechat/base.ts`）。
- `platformCerts`：可选；键为微信平台证书的 **序列号**（与回调头 `Wechatpay-Serial` 一致），值为对应 PEM 公钥。配置后优先按序列号选公钥验签；未命中时仍使用顶层的 `MerchantConfig.publicKey`。

下单 body 由 `buildWechatOrderBody` 组装：**核心字段**（`appid`、`mchid`、`out_trade_no`、`notify_url`、`amount` 等）不会被 `PaymentCreateParams.extra` 覆盖；`extra` 仅用于补充字段（如小程序 `payer.openid`）。

#### PayPal（`channel: 'paypal'`）

REST 调用使用 Client ID / Secret（对应 `appId`、`privateKey`）。异步回调验签依赖 Webhook ID。

```json
{
  "webhookId": "1AB23C45DE6789012"
}
```

说明：

- `webhookId`：在 PayPal 开发者后台为该应用创建的 **Webhook** 的 ID，用于 `verify-webhook-signature`。**缺省将无法在服务端完成回调验签。**

> [!WARNING]
> 当前 `providers/paypal/base.ts` 中 API 根地址默认指向 **沙箱**（`api-m.sandbox.paypal.com`）。上线生产环境请将网关改为 **`https://api-m.paypal.com`**（或与部署策略一致的可配置项），并使用 **Live** 应用的 Client ID / Secret；沙箱与生产密钥不可混用。

> [!NOTE]
> `PaymentCreateParams.notifyUrl` **不会**传给 PayPal 创建订单接口；支付结果依赖你在 PayPal 后台配置的 **Webhook** 与本项目的 `notify` + `webhookId`。请勿误以为 HTTP `notifyUrl` 会被 PayPal 下单使用。

## 四、发起支付：`create`

```ts [ts]
const result = await Pay('alipay', 'mini').create(merchantConfig, {
    orderNo: 'ORDER_20240101_001',
    title: '商品名称',
    description: '商品描述', // 可选
    amount: '99.00', // 字符串，单位元；微信侧会安全转换为「分」
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

入参 `PaymentCreateParams` 中 `paymentNo` 为可选：若业务侧已有流水号，可传入（支付宝各端、微信各端、**PayPal H5/PC** 均已支持「传入则优先使用，否则服务端生成」）。

### `extra` 中常见必填项与 PayPal 补充

| 渠道 / 终端 | 字段 | 说明 |
| :---------- | :--- | :--- |
| alipay + mini | `extra.buyerId` | 买家支付宝用户标识，必填 |
| wechat + mini | `extra.openid` | 用户 openid，必填（缺省会直接报错） |
| wechat + h5 | `extra.clientIp` | 用户出口 IP，建议填写 |
| paypal + h5 | `extra.cancelUrl` | 可选；用户取消支付时的跳转地址；不传则使用 `returnUrl` |

### 各端 `payload` 形态（摘要）

- **支付宝 App**：`payload` 为可直接交给原生 SDK 的订单串。
- **支付宝 H5 / PC**：常为 `{ payUrl }` 跳转链接。
- **支付宝小程序**：常为 `{ tradeNo }`，供 `my.tradePay` 使用。
- **微信 App / 小程序 / JSAPI**：分别为 App 调起参数、`wx.requestPayment` 参数等。
- **微信 H5**：常为 `{ h5Url }`。
- **微信 PC（Native）**：常为 `{ codeUrl }` 扫码链接。
- **PayPal H5**：常为 `{ approveUrl, orderId }`；若创建订单未返回 `approve` 链接会抛错。
- **PayPal PC**：常为 `{ orderId }` 供前端 JS SDK 使用。

## 五、查询支付状态：`query`

```ts [ts]
const result = await Pay('wechat', 'mini').query(merchantConfig, {
    paymentNo: 'LOCAL_PAYMENT_NO',
    thirdTradeNo: '4200001...', // 依渠道含义不同，见下表
});
```

`result.status` 为 `'pending' | 'success' | 'failed' | 'closed'`；成功时可关注 `paidAt`、`thirdTradeNo` 等字段。

| 渠道 | `thirdTradeNo` 含义 |
| :--- | :--- |
| 支付宝 / 微信 | 可选；传入有助于精确查询（如微信订单号） |
| **PayPal** | **必填**；须为创建订单时返回的 **PayPal Order ID**（`payload.orderId` / 下单结果中的 Order id），**不能**仅用本地 `paymentNo` 查询 |

查询接口会对路径中的单号做 URL 编码，避免单号含特殊字符破坏请求。

## 六、发起退款：`refund`

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
        // PayPal：captureId 必填；currency 建议与捕获币种一致（如 EUR）
    },
});
```

- **微信**：金额按字符串解析为元再转为「分」，避免浮点误差；退款币种由微信订单侧约定。
- **PayPal**：`extra.captureId` 必填（Capture ID）；`extra.currency` 建议填写（如 `USD`、`EUR`），缺省为 `USD`。

## 七、异步回调：`notify` 与 `notifySuccess`

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
| paypal | 空字符串 `''`（保证 HTTP 2xx 即可，正文可为空） |

验签失败时应返回非 2xx，以便渠道按策略重试（具体以各平台文档为准）。

### PayPal 回调解析说明

- 验签依赖请求头中的 `paypal-*` 字段；适配层对 Header 名**大小写不敏感**。
- 支付成功类事件以 `PAYMENT.CAPTURE.*` 为主；`NotifyResult.thirdTradeNo` 一般为 **Capture ID**；业务侧若需 PayPal **Order ID**，请关注解析结果 `extra.paypalOrderId`（来自 `supplementary_data.related_ids` 等，视事件载荷而定）。
- `orderNo` 优先来自 `custom_id` / `invoice_id` 等；`paymentNo` 在回调中带 `reference_id` 时会写入（与下单时 `purchase_units[].reference_id` 对齐）。

## 八、完整示例：支付宝小程序下单

```ts [ts]
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

// 将 paymentNo 写入支付流水；将 payload.tradeNo 返回给小程序端调起支付

// 回调路由中：使用原始 body 调用 notify（勿传入已 JSON.parse 的对象）
// const result = await Pay('alipay', 'mini').notify(merchantConfig, { rawBody, headers });
```

## 九、整体工作原理

走完以上步骤后，下面两张图分别展示适配层的渠道路由机制与异步回调的完整链路，便于调试与排查问题。

### 适配层如何路由到具体渠道

调用 `Pay(channel, platform)` 时，`payment/index.ts` 里的 `registry` 会用「渠道 + 终端」解析出唯一的 `IPaymentProvider`，再进入对应 `providers` 下的实现（例如 `alipay/h5.ts`、`wechat/mini.ts`）。只有第一节表中打勾的组合才会解析成功，否则会抛出「不支持的支付组合」。

```mermaid
flowchart LR
    subgraph Call["调用"]
        Pay["Pay(channel, platform)"]
    end
    subgraph Map["payment/index.ts"]
        Reg["registry 解析"]
    end
    subgraph Prov["providers"]
        AP["alipay/*"]
        WC["wechat/*"]
        PP["paypal/*"]
    end
    Pay --> Reg --> AP
    Reg --> WC
    Reg --> PP
```

解析成功后，返回对象上的 `create`、`query`、`refund`、`notify`、`notifySuccess` 都会落在该 provider 实例上，商户配置 `MerchantConfig` 贯穿各次调用。

### 异步通知在服务端如何走通

网关通过 **POST** 将支付结果推到你配置的异步通知 URL。路由处理函数里应读取**与网关一致的原始 body**（不要用已 `JSON.parse` 的对象再 `stringify` 代替，尤其是微信），连同请求头一并交给 `Pay(...).notify`：适配层内部完成验签、解密（如需），得到统一的 `NotifyResult`；业务校验金额与幂等后更新订单，最后用 `notifySuccess()` 的字符串作为 **HTTP 响应体** 返回 **2xx**，以便网关停止重试。

```mermaid
sequenceDiagram
    participant GW as 支付网关
    participant API as 业务路由
    participant Pay as Pay(...).notify

    GW->>API: POST 回调（原始 body + headers）
    API->>Pay: 传入 rawBody / headers
    Pay->>Pay: 验签、解密（依渠道）
    Pay-->>API: NotifyResult
    API->>GW: HTTP 200 + notifySuccess() 正文
```

各渠道对响应正文格式要求不同（见第七节「异步回调」表格）；业务逻辑失败时通常应返回非 2xx，以免网关误判为「投递成功」。

## 十、扩展新支付渠道

1. 在 `server/src/infrastructure/clients/payment/providers/` 下新增目录，实现 `IPaymentProvider`（定义见 `@/types/pay`）。
2. 在 `server/src/infrastructure/clients/payment/index.ts` 的 `registry` 中注册 `channel -> platform -> provider` 映射。
3. 在 `server/src/types/pay.ts` 中将 `PaymentChannel` 联合类型扩展为新渠道名称。

完成后，`Pay('新渠道', '某平台')` 即可获得类型提示与统一调用方式。
