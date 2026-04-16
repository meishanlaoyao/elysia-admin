---
title: 中间件 - Elysia Admin 指南
description: 介绍 Elysia Admin 中间件的使用方式，包括请求预处理（IP黑名单、认证、限流、权限）和响应后处理（操作日志、响应时间统计）的实现方法。
head:
  - - meta
    - name: keywords
      content: Elysia Admin 中间件, 请求拦截, IP黑名单, 认证守卫, 限流, 权限校验, 操作日志
  - - meta
    - property: og:title
      content: 中间件 - Elysia Admin 指南
  - - meta
    - property: og:description
      content: 掌握 Elysia Admin 中间件体系，实现请求预处理与响应后处理的完整生命周期管理。
---

# 中间件

本章将介绍在 `Elysia Admin` 中，中间件（Middleware）用于在请求生命周期的不同阶段注入自定义逻辑。所有的中间件通常定义在 `server/src/middleware` 目录下。

## 请求预处理

如果你需要在执行具体业务逻辑之前对请求进行拦截或预处理（例如：IP 黑名单校验、认证授权等），可以使用 `onBeforeHandle` 钩子。

```ts
/**
 * 全局请求预处理中间件
 * @param app Elysia 实例
 */
export function GlobalMiddleware(app: Elysia) {
    app.onBeforeHandle(async (ctx) => {
        // IP 黑名单校验
        if (guard.ipBlacklist) await executeGuard(IpBlackGuard, ctx, '通过了黑名单IP守卫-->');
        // API 熔断开关
        if (guard.apiSwitch) await executeGuard(ApiGuard, ctx, '通过了API熔断守卫-->');
        
        // 依次执行路由分析、认证、限流及权限校验
        await executeGuard(AnalysisRoute, ctx, '通过了路由分析器-->');
        await executeGuard(AuthGuard, ctx, '通过了认证守卫-->');
        await executeGuard(IpRateLimitGuard, ctx, '通过了ip限流守卫-->');
        await executeGuard(PermissionGuard, ctx, '通过了权限守卫-->');
    });
};
```

## 响应后处理

如果你需要对响应结果进行统一处理，或者在响应发送后执行异步任务（例如：记录操作日志、统计响应时间等），可以结合 `onRequest` 和 `onAfterResponse` 钩子。

```ts
/**
 * 全局响应层中间件
 * @param app Elysia 实例
 */
export function GlobalResponseMiddleware(app: Elysia) {
    // 记录请求开始时间
    app.onRequest((ctx) => {
        (ctx as any).startTime = Date.now();
    });

    // 响应完成后执行
    app.onAfterResponse(async (ctx) => {
        // 非生产环境下打印请求日志
        process.env.NODE_ENV !== 'production' && logger.logRequest(ctx);
        
        // 记录操作日志及 IP 限流数据
        await AddOperLog(ctx);
        await IpRateLimitRecord(ctx);
    });
};
```

## 获取上下文数据

在 Controller 层的请求处理函数中，你可以方便地从 `Context` 对象中获取由中间件注入的额外上下文信息：

```ts
import { GetClientIp } from '@/shared/ip';

/**
 * 示例业务处理函数
 * @param ctx 请求上下文
 */
export async function handleRequest(ctx: Context) {
    try {
        const startTime = (ctx as any)?.startTime; // 当前请求的开始时间
        const user = (ctx as any)?.user;           // 当前请求的用户信息
        const routeInfo = (ctx as any)?.routeInfo; // 当前匹配的路由详情
        const routeKey = (ctx as any)?.routeKey;   // 当前路由的唯一键
        const ip = GetClientIp(ctx);               // 当前请求的客户端 IP 地址

        // 执行后续业务逻辑...
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```