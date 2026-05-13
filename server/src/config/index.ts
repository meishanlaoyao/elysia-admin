import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { YAML } from 'bun';

const appEnv = process.env.NODE_ENV || 'development';

// CONFIG_PATH 环境变量强制指定 yaml 绝对路径
// 未设置时从当前文件目录查找（适用于主进程和 worker 进程）
// processor 子进程必须通过 CONFIG_PATH 传入，见 core/worker.ts
const configPath = process.env.CONFIG_PATH ?? resolve(import.meta.dirname, `${appEnv}.yaml`);

const text = readFileSync(configPath, 'utf-8');
const raw = YAML.parse(text) as any;
raw.app = {
    allowPublicRegister: false,
    trustProxy: false,
    trustedProxyCidrs: [] as string[],
    corsOrigin: true,
    geoIpTimeoutMs: 1500,
    ...raw.app,
};
const config = raw;

/**
 * 运行时配置结构（由对应环境的 `*.yaml` 解析并与代码内默认值合并）。
 * 敏感项（密钥、数据库密码等）应通过环境变量或密钥管理注入，勿提交真实生产值到仓库。
 */
interface IConfig {
    /** HTTP 服务、缓存策略、安全开关等与应用行为直接相关的配置 */
    app: {
        /** 应用展示名/日志前缀；多实例同机部署时建议区分，便于日志检索 */
        id: string;
        /** 监听端口；可被环境变量 `PORT` 覆盖 */
        port: number;
        /** 全局 API 路径前缀（如 `/api`），与前端请求的 baseURL 对齐 */
        prefix: string;
        /** 通用 Redis 缓存默认过期时间（秒），如 `WithCache` 未单独指定 expire 时使用 */
        baseCacheTime: number;
        /** 忘记密码流程中 Redis 重置令牌的存活时间（秒） */
        forgetPasswordExpiresIn: number;
        /** 邮件内「重置密码」链接的前端页面地址（带 hash 的路由等） */
        forgetPasswordUrl: string;
        /** 单次请求体最大字节数，与 Elysia `serve.maxRequestBodySize` 一致，防止大包拖垮服务 */
        maxRequestBodySize: number;
        /** Bun 服务 `idleTimeout`（秒），控制长连接空闲断开时间 */
        timeout: number;
        /** 同一 IP 登录失败达到此次数后写入 IP 黑名单（与 `addPasswordErrorTimes` 配合） */
        maxLoginAttempts: number;
        /** 是否允许 `POST /auth/register` 无鉴权自助注册；可被环境变量 `ALLOW_PUBLIC_REGISTER` 覆盖 */
        allowPublicRegister: boolean;
        /**
         * 为 `true` 时，仅在「直连对端 IP」命中 `trustedProxyCidrs` 后才解析 `X-Forwarded-For` / `X-Real-IP`；
         * 默认 `false` 时只信 socket 直连 IP，避免伪造头绕过限流/封禁。
         */
        trustProxy: boolean;
        /**
         * 可信反向代理网段或单 IP（IPv4 CIDR 或精确地址），与 `trustProxy` 联用；
         * 也可用环境变量 `TRUSTED_PROXY_CIDRS`（逗号分隔）覆盖。
         */
        trustedProxyCidrs: string[];
        /**
         * CORS 的 `Access-Control-Allow-Origin`：`true` 表示开发期宽松反射；
         * 生产建议为具体前端 Origin 字符串或字符串数组。
         */
        corsOrigin: boolean | string | string[];
        /** 调用 ipinfo 等外网 GeoIP 时的 HTTP 超时（毫秒），超时后登录等地区字段降级为「未知」 */
        geoIpTimeoutMs: number;
    },
    /** JWT 签发与校验：access 与 refresh 使用不同密钥与过期策略，降低泄露影响面 */
    jwt: {
        accessToken: {
            /** accessToken 过期时间，jose 支持的时间字符串（如 `15m`） */
            expiresIn: string;
            /** accessToken HMAC 密钥，须足够随机且与 refresh 密钥分离 */
            secret: string;
        },
        refreshToken: {
            /** refreshToken 过期时间 */
            expiresIn: string;
            /** refreshToken HMAC 密钥，须与 access 密钥不同 */
            secret: string;
        },
    },
    /** ioredis 连接参数，供会话、限流、缓存等模块共用 */
    redis: {
        host: string;
        port: number;
        password: string;
        username: string;
        /** Redis 逻辑库编号 */
        db: number;
    },
    /** PostgreSQL（postgres.js + Drizzle）连接池参数 */
    pg: {
        host: string;
        port: number;
        /** 连接用户名（与 `user` 二选一语义由驱动/迁移脚本决定，保持与 yaml 一致即可） */
        username: string;
        user: string;
        password: string;
        database: string;
        /** 连接池最大连接数 */
        max: number;
        /** 空闲连接回收时间（秒） */
        idle_timeout: number;
        /** 建立连接的超时时间（秒） */
        connection_timeout: number;
        /** 是否启用 TLS（云厂商托管库常为 true） */
        ssl: boolean;
    },
    /** 发信（忘记密码等）使用的 SMTP 客户端配置 */
    smtp: {
        host: string;
        port: number;
        auth: {
            /** SMTP 登录用户（通常为发件邮箱） */
            user: string;
            /** SMTP 授权码/应用密码，勿写死生产值 */
            pass: string;
        };
        /** 是否使用 nodemailer 连接池 */
        pool: boolean;
        maxConnections: number;
        maxMessages: number;
        /** 速率限制：统计窗口长度（毫秒） */
        rateDelta: number;
        /** 速率限制：每个 `rateDelta` 窗口内最多发送邮件数 */
        rateLimit: number;
    },
    /** 全局中间件中的防护类开关 */
    guard: {
        /** 是否启用 IP 黑名单中间件（命中则 403） */
        ipBlacklist: boolean;
        /** 是否启用「API 熔断/降级」开关（依赖 Redis 中的 fallback 标记） */
        apiSwitch: boolean;
    },
    /** 业务域订单相关超时（毫秒），供订单模块或队列使用 */
    orders: {
        timeout: number;
    },
};

export default config as IConfig;