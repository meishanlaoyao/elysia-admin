import { Elysia } from "elysia";
import { GetNowTime } from "@/common/time";
import config from "@/config";
import { RegisterRoutes } from '@/routes';
import { BaseResultData } from '@/common/result';

const { port, id, prefix } = config.app;
const app = new Elysia({ prefix });

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
}))

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

app.listen(port);
console.log(`${id} is running at http://localhost:${port}${prefix}
OpenAPI JSON: http://localhost:${port}${prefix}/openapi/json
OpenAPI: http://localhost:${port}${prefix}/openapi
StartTime: ${GetNowTime()}
PID: ${process.pid}`);