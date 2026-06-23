---
title: 常见问题 - Elysia Admin
description: 解答 Elysia Admin 使用过程中的常见问题，包括 PM2 集群模式限制、多实例部署方案及 Nginx 负载均衡配置。
---

# 常见问题

## 为什么不再支持二进制打包？

从引入 BullMQ Sandboxed Processors 之后，二进制打包就不再可行了。主要原因有两个：
- 第一，`config/index.ts` 通过 `readFileSync` 读取 `production.yaml`，二进制文件没有文件系统，读不到外部文件。
- 第二，也是更根本的问题，Sandboxed 模式下 BullMQ 会用 `child_process.spawn` 启动独立子进程来执行每个任务，而二进制包里没有 `bun` 运行时，也没有 `processors/` 目录，子进程根本无法启动。

如果放弃 Sandboxed 模式改回函数模式，二进制是可以打包的，但会失去进程隔离的优势。综合考虑，直接使用 PM2 部署是更合适的方案，稳定性和功能都更完整。

## 为什么无法使用PM2的cluster(集群模式)？
`PM2` 的集群模式并不是自己发明了多进程管理，而是深度依赖 `Node.js` 原生的 `cluster` 模块。当你设置 `exec_mode: 'cluster'` 时，`PM2` 实际上是在调用 `Node.js` 的内部 API 来分叉进程并共享端口（TCP 句柄）。

但是我们的 `Elysia Admin` 项目完全依赖 `Bun` 。 `Bun` 虽然兼容了很多 `Node.js` API，但它并没有完全实现 cluster 模块（或者说实现方式与 Node 不同）。

因此你需要手动多实例：
```js [ecosystem.config.cjs]
module.exports = {
  apps: [
    {
      name: 'Elysia-Admin-1',
      script: 'bun',
      args: 'run index.js',
      interpreter: 'node',
      exec_mode: 'fork', // 必须 fork
      env: {
        PORT: 3001, // 指定不同端口
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Elysia-Admin-2',
      script: 'bun',
      args: 'run index.js',
      interpreter: 'node',
      exec_mode: 'fork',
      env: {
        PORT: 3002, // 指定不同端口
        NODE_ENV: 'production'
      }
    },
    // 可以继续加 3, 4...
  ]
};
```
```txt [nginx]
http {
    upstream elysia_app {
        server 127.0.0.1:3001;
        server 127.0.0.1:3002;
        # 负载均衡策略，默认是轮询
    }

    server {
        listen 80;
        location / {
            proxy_pass http://elysia_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 支付回调收不到通知，是什么原因？

支付网关（支付宝、微信、PayPal）的异步通知是由**网关主动 POST 到你的服务器**，因此回调地址必须满足以下条件：

- **外网可访问**：本地开发环境（如 `localhost`）无法接收回调，需使用内网穿透工具（如 [ngrok](https://ngrok.com/)）或直接部署到公网服务器。
- **使用 HTTPS**：微信支付和支付宝生产环境均要求回调地址为 HTTPS。
- **及时返回 2xx**：网关在收到 2xx 之前会按策略重试，务必在完成业务处理后用 `notifySuccess()` 的返回值作为响应体，并返回 HTTP 200。

## 微信支付调用报错：serialNo 缺失

微信支付 V3 接口要求在请求头 `Authorization` 中携带商户 API 证书序列号。若报错提示 `serialNo` 缺失，请检查商户配置 `MerchantConfig.config.serialNo` 是否已正确填写。

```json
{
  "serialNo": "7132D72A000000XXXXXXXXXXXXXXXXXX",
  "apiV3Key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

`serialNo` 可在微信商户平台「账户中心 → API 安全 → 管理证书」页面查看；`apiV3Key` 在同页面「APIv3 密钥」处设置。**两者缺一不可，缺省会导致所有微信支付接口调用失败。**

## PayPal 为什么默认连接的是沙箱环境？

`providers/paypal/base.ts` 中 API 根地址默认指向 `api-m.sandbox.paypal.com`（沙箱），便于本地开发调试。上线生产环境前，需将地址改为 `https://api-m.paypal.com`，并使用 **Live** 应用的 Client ID / Secret；沙箱与生产密钥**不可混用**，否则会导致鉴权失败。

## 如何做路由拦截与接口中间件？

路由注册与全局守卫分两处，按需求改对应文件即可：

| 需求 | 文件 | 说明 |
| :--- | :--- | :--- |
| 路由拦截 / 注册策略 | [`server/src/modules/index.ts`](../../server/src/modules/index.ts) | `RegisterRoutes()` 自动加载各模块 `route.ts`，按 `meta.isAuth` 拆分为公共路由与需登录路由；需登录的路由统一走 `app.guard` 校验 `authorization` 请求头。若要调整**哪些路由需要登录、如何分组挂载**，在此修改。 |
| 接口中间件（守卫链） | [`server/src/middleware/index.ts`](../../server/src/middleware/index.ts) | `GlobalMiddleware` 在 `onBeforeHandle` 中依次执行：IP 黑名单 → API 熔断 → 路由分析 → 登录认证 → IP 限流 → 权限校验；`GlobalResponseMiddleware` 负责请求日志与操作日志。新增或调整**请求进入业务前**的拦截，在此修改。 |

`CreateApp()`（[`server/src/app.ts`](../../server/src/app.ts)）会先挂载全局中间件，再调用 `RegisterRoutes()` 注册业务路由。单条路由还可通过 `route.ts` 的 `meta`（如 `isAuth`、`permission`、`ipRateLimit`）配合守卫生效。