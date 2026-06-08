import { z } from 'zod';

const AppSchema = z.object({
    id: z.string(),
    port: z.number(),
    prefix: z.string(),
    baseCacheTime: z.number(),
    forgetPasswordExpiresIn: z.number(),
    forgetPasswordUrl: z.string(),
    maxRequestBodySize: z.number(),
    timeout: z.number(),
    maxLoginAttempts: z.number(),
    allowPublicRegister: z.boolean(),
    trustProxy: z.boolean(),
    trustedProxyCidrs: z.array(z.string()),
    corsOrigin: z.union([z.boolean(), z.string(), z.array(z.string())]),
    geoIpTimeoutMs: z.number(),
}).strict();

const JwtTokenSchema = z.object({
    expiresIn: z.string(),
    secret: z.string(),
}).strict();

const JwtSchema = z.object({
    accessToken: JwtTokenSchema,
    refreshToken: JwtTokenSchema,
}).strict();

const RedisSchema = z.object({
    host: z.string(),
    port: z.number(),
    password: z.string(),
    username: z.string(),
    db: z.number(),
}).strict();

const PgSchema = z.object({
    host: z.string(),
    port: z.number(),
    username: z.string(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
    max: z.number(),
    idle_timeout: z.number(),
    connect_timeout: z.number(),
    ssl: z.boolean(),
}).strict();

const SmtpSchema = z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    auth: z.object({
        user: z.string(),
        pass: z.string(),
    }).strict(),
    pool: z.boolean(),
    maxConnections: z.number(),
    maxMessages: z.number(),
    rateDelta: z.number(),
    rateLimit: z.number(),
}).strict();

const GuardSchema = z.object({
    ipBlacklist: z.boolean(),
    apiSwitch: z.boolean(),
}).strict();

const OrdersSchema = z.object({
    timeout: z.number(),
}).strict();

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