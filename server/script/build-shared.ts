import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PROCESSORS_ROOT = './src/infrastructure/queue/queues';

export interface ProcessorEntry {
    name: string;
    entry: string;
};

/** 扫描 queues/{name}/processor.ts，新增队列只需加目录，无需改构建脚本 */
export function discoverProcessorEntries(root = PROCESSORS_ROOT): ProcessorEntry[] {
    if (!existsSync(root)) return [];
    return readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((name) => existsSync(join(root, name, 'processor.ts')))
        .sort()
        .map((name) => ({
            name,
            entry: `./src/infrastructure/queue/queues/${name}/processor.ts`,
        }));
};

/** Bun build 基础参数：完整 minify + code splitting */
export const bunBuildBaseArgs = [
    'bun', 'build',
    '--minify',
    '--splitting',
    '--target', 'bun',
] as const;