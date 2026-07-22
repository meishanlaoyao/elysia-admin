import { YAML } from 'bun';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { Value } from '@sinclair/typebox/value';
import { appendFatalLog, getDistRoot } from '@/shared/log-stream';
import { ConfigSchema, type IConfig } from './schema';

const appEnv = process.env.NODE_ENV || 'development';
const configPath = process.env.CONFIG_PATH ?? resolve(getDistRoot() ?? import.meta.dirname, `${appEnv}.yaml`);

const text = readFileSync(configPath, 'utf-8');
const raw = YAML.parse(text) as Record<string, unknown>;
(raw as { app: Record<string, unknown> }).app = {
    allowPublicRegister: false,
    trustProxy: false,
    trustedProxyCidrs: [] as string[],
    corsOrigin: true,
    hsts: false,
    geoIpTimeoutMs: 1500,
    ...(raw.app as Record<string, unknown> | undefined),
};
(raw as { log: Record<string, unknown> }).log = {
    level: 'info',
    showRequestParams: true,
    ...(raw.log as Record<string, unknown> | undefined),
};

if (!Value.Check(ConfigSchema, raw)) {
    const detail = [...Value.Errors(ConfigSchema, raw)]
        .map((e) => `  - ${e.path}: ${e.message}`)
        .join('\n');
    const msg = `[config] 配置校验失败: ${configPath}\n${detail}`;
    appendFatalLog(msg);
    console.error(msg);
    process.exit(1);
};

const config = raw as IConfig;

export type { IConfig };
export default config;