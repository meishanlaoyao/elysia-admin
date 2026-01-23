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
app.derive(async (ctx) => {
    const auth = ctx.headers['authorization'] || null;

    return {}
});

// 开发文档
if (process.env.NODE_ENV !== 'production') {
    const { openapi } = await import('@elysiajs/openapi');
    app.use(openapi({
        documentation: {
            info: {
                title: `${id} API`,
                version: '1.0.0',
                description: `${id} description`,
            },
        },
    }));
};

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

// 全局响应层
app.onAfterResponse((ctx) => {
    // 操作日志
});

// 初始化种子数据
InitSeedData();

app.listen(port);

let startLogStr = `${id} is running at http://localhost:${port}${prefix}
`;
if (process.env.NODE_ENV !== 'production') {
    startLogStr += `OpenAPI JSON: http://localhost:${port}${prefix}/openapi/json
OpenAPI: http://localhost:${port}${prefix}/openapi
`;
};
startLogStr += `StartTime: ${GetNowTime()}
NODE_ENV: ${process.env.NODE_ENV}
PID: ${process.pid}`;
console.log(startLogStr);