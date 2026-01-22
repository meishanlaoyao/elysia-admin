import { Elysia } from "elysia";
import { BunAdapter } from 'elysia/adapter/bun';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { GetNowTime } from "@/utils/time";
import config from "@/config";
import { RegisterRoutes } from '@/routes';
import { BaseResultData } from '@/common/result';
import { InitSeedData } from '@/utils/seed';

const { port, id, prefix, maxRequestBodySize, timeout } = config.app;
const app = new Elysia({
    prefix,
    normalize: true,
    adapter: BunAdapter,
    aot: true,
    nativeStaticResponse: true,
    serve: {
        maxRequestBodySize,
        idleTimeout: timeout,
    }
});
app.use(cors());
app.use(await staticPlugin());
app.derive(async ({ request, headers, server }) => {
    const ip = server?.requestIP(request)?.address || '未知';
    const auth = headers['authorization'] || null;
    // console.log("ip地址", ip, headers);

    return {}
})

// 生产环境 记得注释掉文档
import { openapi } from '@elysiajs/openapi';
app.use(openapi({
    documentation: {
        info: {
            title: `${id} API`,
            version: '1.0.0',
            description: `${id} description`,
        },
    },
}));

// 捕获错误
app.onError(({ code, error }) => {
    // 处理验证错误
    if (code === 'VALIDATION') {
        if (error.message == '请先登陆后访问') {
            return BaseResultData.fail(401, error.message);
        };
        return BaseResultData.fail(400, error.message);
    };
});

// 注册路由
RegisterRoutes(app as Elysia);

// 初始化种子数据
InitSeedData();

app.listen(port);
console.log(`${id} is running at http://localhost:${port}${prefix}
OpenAPI JSON: http://localhost:${port}${prefix}/openapi/json
OpenAPI: http://localhost:${port}${prefix}/openapi
StartTime: ${GetNowTime()}
PID: ${process.pid}`);