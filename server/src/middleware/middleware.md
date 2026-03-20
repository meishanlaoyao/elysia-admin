## 中间件处理

这里中间件做了一些处理，所以的话，在请求处理逻辑上面可以取到一些额外的数据。

```ts
import { GetClientIp } from '@/shared/ip';

export async function xxx(ctx: Context) {
    try {
        const user = (ctx as any)?.user; // 当前请求接口的用户信息
        const routeInfo = (ctx as any)?.routeInfo; // 当前请求接口的路由信息
        const ip = GetClientIp(ctx); // 当前请求接口的IP地址
        const routeKey = (ctx as any)?.routeKey; // 当前请求接口的路由键

    } catch (error) {
        return BaseResultData.fail(500, error);
    }
}
```