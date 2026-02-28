import { readFile } from 'node:fs/promises';
import { YAML } from 'bun';

const appEnv = process.env.NODE_ENV || 'development';
const text = await readFile(new URL(`./${appEnv}.yaml`, import.meta.url), "utf-8");
const config = YAML.parse(text);

export default config;