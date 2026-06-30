import { z } from 'zod';

/** 应用运行时配置（对应 yaml 的 app 段） */
const AppSchema = z.object({
    /** 应用标识，用于 Redis 键前缀、邮件标题、队列 Redis prefix 等 */
    id: z.string(),
    /** HTTP 监听端口（可被环境变量 PORT 覆盖） */
    port: z.number(),
    /** API 路由前缀，如 /api */
    prefix: z.string(),
    /** 静态资源所在目录，如 /public */
    staticDir: z.string(),
    /** 静态资源前缀，如 /public */
    staticPrefix: z.string(),
    /** 默认缓存过期时间（秒），登录失败计数、WithCache 等复用 */
    baseCacheTime: z.number(),
    /** 忘记密码令牌在 Redis 中的有效期（秒） */
    forgetPasswordExpiresIn: z.number(),
    /** 忘记密码邮件中的前端重置页完整 URL（含域名与 hash 路由） */
    forgetPasswordUrl: z.string(),
    /** 请求体最大字节数，传给 Elysia maxRequestBodySize */
    maxRequestBodySize: z.number(),
    /** 请求超时（秒），传给 Elysia idleTimeout */
    timeout: z.number(),
    /** 同一 IP 密码错误上限，超限后写入 IP 黑名单 */
    maxLoginAttempts: z.number(),
    /** 是否开放注册接口；可用环境变量 ALLOW_PUBLIC_REGISTER 覆盖 */
    allowPublicRegister: z.boolean(),
    /** 是否信任反向代理头（X-Forwarded-For / X-Real-IP）；可用 TRUST_PROXY 覆盖 */
    trustProxy: z.boolean(),
    /** 受信代理直连 IP 白名单（CIDR 或单 IP），仅命中时才解析转发头 */
    trustedProxyCidrs: z.array(z.string()),
    /** CORS 允许来源：true 允许全部，或字符串/字符串数组指定域名 */
    corsOrigin: z.union([z.boolean(), z.string(), z.array(z.string())]),
    /** CORS Methods */
    corsMethods: z.union([z.array(z.string()), z.string()]),
    /** CORS allowedHeaders */
    corsAllowedHeaders: z.union([z.array(z.string()), z.string()]),
    /** IP 归属地查询（ipinfo.io）超时（毫秒），失败时降级为「未知」 */
    geoIpTimeoutMs: z.number(),
}).strict();

/** 单类 JWT 令牌配置 */
const JwtTokenSchema = z.object({
    /** 过期时间，如 15m、7d */
    expiresIn: z.string(),
    /** 签名密钥 */
    secret: z.string(),
}).strict();

/** JWT 双令牌配置 */
const JwtSchema = z.object({
    accessToken: JwtTokenSchema,
    refreshToken: JwtTokenSchema,
}).strict();

/** Redis 连接配置 */
const RedisSchema = z.object({
    host: z.string(),
    port: z.number(),
    password: z.string(),
    username: z.string(),
    db: z.number(),
}).strict();

/** PostgreSQL 连接配置 */
const PgSchema = z.object({
    host: z.string(),
    port: z.number(),
    username: z.string(),
    /** 数据库用户（与 username 并存，连接池使用 username） */
    user: z.string(),
    password: z.string(),
    database: z.string(),
    /** 连接池最大连接数 */
    max: z.number(),
    /** 空闲连接超时（秒） */
    idle_timeout: z.number(),
    /** 连接建立超时（秒） */
    connect_timeout: z.number(),
    ssl: z.boolean(),
}).strict();

/** SMTP 邮件发送配置 */
const SmtpSchema = z.object({
    host: z.string(),
    port: z.number(),
    /** 是否使用 TLS（如 465 端口） */
    secure: z.boolean(),
    auth: z.object({
        user: z.string(),
        pass: z.string(),
    }).strict(),
    /** 是否启用连接池 */
    pool: z.boolean(),
    maxConnections: z.number(),
    maxMessages: z.number(),
    /** 限流时间窗口（毫秒） */
    rateDelta: z.number(),
    /** 每个 rateDelta 内最多发送条数 */
    rateLimit: z.number(),
}).strict();

/** 全局守卫开关 */
const GuardSchema = z.object({
    /** 是否启用 IP 黑名单守卫与缓存同步 */
    ipBlacklist: z.boolean(),
    /** 是否启用 API 熔断守卫 */
    apiSwitch: z.boolean(),
}).strict();

/** 订单业务配置 */
const OrdersSchema = z.object({
    /** 未支付订单超时关单时间（毫秒） */
    timeout: z.number(),
}).strict();

/** 完整应用配置结构，与 development.yaml / production.yaml 对应 */
export const ConfigSchema = z.object({
    app: AppSchema,
    jwt: JwtSchema,
    redis: RedisSchema,
    pg: PgSchema,
    smtp: SmtpSchema,
    guard: GuardSchema,
    orders: OrdersSchema,
}).strict();

export type IConfig = z.infer<typeof ConfigSchema>;