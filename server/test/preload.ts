/**
 * bun test 默认 NODE_ENV=test，会查找不存在的 test.yaml。
 * 在加载被测模块前固定为 development 配置路径。
 */
import { resolve } from 'node:path';

process.env.NODE_ENV = 'development';
process.env.CONFIG_PATH = resolve(import.meta.dir, '../src/config/development.yaml');