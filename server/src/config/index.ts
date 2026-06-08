import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { YAML } from 'bun';
import { prettifyError } from 'zod';
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

const result = ConfigSchema.safeParse(raw);
if (!result.success) {
    console.error(`[config] 配置校验失败: ${configPath}\n${prettifyError(result.error)}`);
    process.exit(1);
};

const config: IConfig = result.data;

export type { IConfig };
export default config;