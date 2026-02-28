import { readFile } from 'node:fs/promises';
import { YAML } from 'bun';

const appEnv = process.env.NODE_ENV || 'development';
const text = await readFile(new URL(`./${appEnv}.yaml`, import.meta.url), "utf-8");
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
    }
};

export default config as IConfig;