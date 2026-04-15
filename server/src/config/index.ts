import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { YAML } from 'bun';

const appEnv = process.env.NODE_ENV || 'development';

// CONFIG_PATH 环境变量强制指定 yaml 绝对路径
// 未设置时从当前文件目录查找（适用于主进程和 worker 进程）
// processor 子进程必须通过 CONFIG_PATH 传入，见 core/worker.ts
const configPath = process.env.CONFIG_PATH
    ?? resolve(import.meta.dirname, `${appEnv}.yaml`);

const text = readFileSync(configPath, 'utf-8');
const config = YAML.parse(text);

interface IConfig {
    app: {
        id: string;
        port: number;
        prefix: string;
        baseCacheTime: number;
        forgetPasswordExpiresIn: number;
        forgetPasswordUrl: string;
        maxRequestBodySize: number;
        timeout: number;
        maxLoginAttempts: number;
    },
    jwt: {
        accessToken: {
            expiresIn: string;
            secret: string;
        },
        refreshToken: {
            expiresIn: string;
            secret: string;
        },
    },
    redis: {
        host: string;
        port: number;
        password: string;
        username: string;
        db: number;
    },
    pg: {
        host: string;
        port: number;
        username: string;
        user: string;
        password: string;
        database: string;
        max: number;
        idle_timeout: number;
        connection_timeout: number;
        ssl: boolean;
    },
    smtp: {
        host: string;
        port: number;
        auth: {
            user: string;
            pass: string;
        },
        pool: boolean;
        maxConnections: number;
        maxMessages: number;
        rateDelta: number;
        rateLimit: number;
    },
    guard: {
        ipBlacklist: boolean;
        apiSwitch: boolean;
    },
    orders: {
        timeout: number;
    },
};

export default config as IConfig;