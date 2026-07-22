import type { Static } from '@sinclair/typebox';
import { t } from 'elysia';

const strict = { additionalProperties: false } as const;

/** 应用运行时配置（对应 yaml 的 app 段） */
const AppSchema = t.Object({
    /** 应用标识，用于 Redis 键前缀、邮件标题、队列 Redis prefix 等 */
    id: t.String(),
    /** HTTP 监听端口（可被环境变量 PORT 覆盖） */
    port: t.Number(),
    /** API 路由前缀，如 /api */
    prefix: t.String(),
    /** 静态资源所在目录，如 /public */
    staticDir: t.String(),
    /** 静态资源前缀，如 /public */
    staticPrefix: t.String(),
    /** 默认缓存过期时间（秒），登录失败计数、WithCache 等复用 */
    baseCacheTime: t.Number(),
    /** 忘记密码令牌在 Redis 中的有效期（秒） */
    forgetPasswordExpiresIn: t.Number(),
    /** 忘记密码邮件中的前端重置页完整 URL（含域名与 hash 路由） */
    forgetPasswordUrl: t.String(),
    /** 请求体最大字节数，传给 Elysia maxRequestBodySize */
    maxRequestBodySize: t.Number(),
    /** 请求超时（秒），传给 Elysia idleTimeout */
    timeout: t.Number(),
    /** 同一 IP 密码错误上限，超限后写入 IP 黑名单 */
    maxLoginAttempts: t.Number(),
    /** 是否开放注册接口；可用环境变量 ALLOW_PUBLIC_REGISTER 覆盖 */
    allowPublicRegister: t.Boolean(),
    /** 是否信任反向代理头（X-Forwarded-For / X-Real-IP）；可用 TRUST_PROXY 覆盖 */
    trustProxy: t.Boolean(),
    /** 受信代理直连 IP 白名单（CIDR 或单 IP），仅命中时才解析转发头 */
    trustedProxyCidrs: t.Array(t.String()),
    /** CORS 允许来源：true 允许全部，或字符串/字符串数组指定域名 */
    corsOrigin: t.Union([t.Boolean(), t.String(), t.Array(t.String())]),
    /** CORS Methods */
    corsMethods: t.Union([t.Array(t.String()), t.String()]),
    /** CORS allowedHeaders */
    corsAllowedHeaders: t.Union([t.Array(t.String()), t.String()]),
    /** 是否下发 HSTS（仅在 HTTPS / 前置 TLS 终结后开启） */
    hsts: t.Boolean(),
    /** IP 归属地查询（ipinfo.io）超时（毫秒），失败时降级为「未知」 */
    geoIpTimeoutMs: t.Number(),
}, strict);

/** 单类 JWT 令牌配置 */
const JwtTokenSchema = t.Object({
    /** 过期时间，如 15m、7d */
    expiresIn: t.String(),
    /** 签名密钥 */
    secret: t.String(),
}, strict);

/** JWT 双令牌配置 */
const JwtSchema = t.Object({
    accessToken: JwtTokenSchema,
    refreshToken: JwtTokenSchema,
}, strict);

/** Redis 连接配置 */
const RedisSchema = t.Object({
    host: t.String(),
    port: t.Number(),
    password: t.String(),
    username: t.String(),
    db: t.Number(),
}, strict);

/** PostgreSQL 连接配置 */
const PgSchema = t.Object({
    host: t.String(),
    port: t.Number(),
    username: t.String(),
    /** 数据库用户（与 username 并存，连接池使用 username） */
    user: t.String(),
    password: t.String(),
    database: t.String(),
    /** 连接池最大连接数 */
    max: t.Number(),
    /** 空闲连接超时（秒） */
    idle_timeout: t.Number(),
    /** 连接建立超时（秒） */
    connect_timeout: t.Number(),
    ssl: t.Boolean(),
}, strict);

/** SMTP 邮件发送配置 */
const SmtpSchema = t.Object({
    host: t.String(),
    port: t.Number(),
    /** 是否使用 TLS（如 465 端口） */
    secure: t.Boolean(),
    auth: t.Object({
        user: t.String(),
        pass: t.String(),
    }, strict),
    /** 是否启用连接池 */
    pool: t.Boolean(),
    maxConnections: t.Number(),
    maxMessages: t.Number(),
    /** 限流时间窗口（毫秒） */
    rateDelta: t.Number(),
    /** 每个 rateDelta 内最多发送条数 */
    rateLimit: t.Number(),
}, strict);

/** 全局守卫开关 */
const GuardSchema = t.Object({
    /** 是否启用 IP 黑名单守卫与缓存同步 */
    ipBlacklist: t.Boolean(),
    /** 是否启用 API 熔断守卫 */
    apiSwitch: t.Boolean(),
}, strict);

/** 订单业务配置 */
const OrdersSchema = t.Object({
    /** 未支付订单超时关单时间（毫秒） */
    timeout: t.Number(),
}, strict);

/** 日志配置 */
const LogSchema = t.Object({
    /** pino 日志级别：trace / debug / info / warn / error / fatal */
    level: t.String(),
    /** 是否在 HTTP 请求日志中记录 query / body / params */
    showRequestParams: t.Boolean(),
}, strict);

/** 完整应用配置结构，与 development.yaml / production.yaml 对应 */
export const ConfigSchema = t.Object({
    app: AppSchema,
    jwt: JwtSchema,
    redis: RedisSchema,
    pg: PgSchema,
    smtp: SmtpSchema,
    guard: GuardSchema,
    orders: OrdersSchema,
    log: LogSchema,
}, strict);

export type IConfig = Static<typeof ConfigSchema>;