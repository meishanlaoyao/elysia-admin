import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Value } from '@sinclair/typebox/value';
import { YAML } from 'bun';
import { ConfigSchema, type IConfig } from './schema';

const appEnv = process.env.NODE_ENV || 'development';

const configPath = process.env.CONFIG_PATH ?? resolve(import.meta.dirname, `${appEnv}.yaml`);

const text = readFileSync(configPath, 'utf-8');
const raw = YAML.parse(text) as Record<string, unknown>;
(raw as { app: Record<string, unknown> }).app = {
    allowPublicRegister: false,
    trustProxy: false,
    trustedProxyCidrs: [] as string[],
    corsOrigin: true,
    geoIpTimeoutMs: 1500,
    ...(raw.app as Record<string, unknown> | undefined),
};

if (!Value.Check(ConfigSchema, raw)) {
    const detail = [...Value.Errors(ConfigSchema, raw)]
        .map((e) => `  - ${e.path}: ${e.message}`)
        .join('\n');
    console.error(`[config] 配置校验失败: ${configPath}\n${detail}`);
    process.exit(1);
};

const config = raw as IConfig;

export type { IConfig };
export default config;