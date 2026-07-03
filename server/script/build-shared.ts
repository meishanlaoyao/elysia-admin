import { existsSync, readdirSync, rmSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '@/shared/logger';

const PROCESSORS_ROOT = './src/infrastructure/queue/queues';

export const BUILD_ENTRIES_DIR = './script/.build-entries';

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

/** 仅生成 processor stub 入口 */
export function generateProcessorStubs(processorEntries: ProcessorEntry[]): string[] {
    if (existsSync(BUILD_ENTRIES_DIR)) {
        rmSync(BUILD_ENTRIES_DIR, { recursive: true, force: true });
    };
    mkdirSync(join(BUILD_ENTRIES_DIR, 'processors'), { recursive: true });
    const entrypoints: string[] = [];
    for (const p of processorEntries) {
        const stubPath = join(BUILD_ENTRIES_DIR, 'processors', `${p.name}.ts`);
        writeFileSync(
            stubPath,
            `export { default } from '../../../src/infrastructure/queue/queues/${p.name}/processor.ts';\n`,
            'utf-8',
        );
        entrypoints.push(stubPath);
    };
    return entrypoints;
};

/** 生成 stub 入口，控制 dist 输出路径 */
export function generateBuildEntryStubs(processorEntries: ProcessorEntry[]): string[] {
    const processorStubs = generateProcessorStubs(processorEntries);
    writeFileSync(
        join(BUILD_ENTRIES_DIR, 'index.ts'),
        "import '../../src/index.ts';\n",
        'utf-8',
    );
    writeFileSync(
        join(BUILD_ENTRIES_DIR, 'workers.ts'),
        "import '../../src/infrastructure/queue/runtime/worker.ts';\n",
        'utf-8',
    );
    return [
        join(BUILD_ENTRIES_DIR, 'index.ts'),
        join(BUILD_ENTRIES_DIR, 'workers.ts'),
        ...processorStubs,
    ];
};

/** 删除临时 stub 目录 */
export function removeBuildEntryStubs(): void {
    if (existsSync(BUILD_ENTRIES_DIR)) {
        rmSync(BUILD_ENTRIES_DIR, { recursive: true, force: true });
    };
};

async function runBunBuild(entrypoints: string[], outdir: string): Promise<void> {
    const result = await Bun.build({
        entrypoints,
        outdir,
        root: BUILD_ENTRIES_DIR,
        target: 'bun',
        minify: true,
        splitting: true,
        naming: { chunk: 'chunk-[hash].[ext]' },
    });
    if (!result.success) {
        for (const log of result.logs) {
            logger.error(log.message);
        };
        process.exit(1);
    };
};

/** 仅构建 processors（dev 增量） */
export async function runProcessorBuild(processorEntries: ProcessorEntry[], outdir: string): Promise<void> {
    const entrypoints = generateProcessorStubs(processorEntries);
    await runBunBuild(entrypoints, outdir);
};

/** 单次统一构建：index + workers + processors 共享 chunk */
export async function runUnifiedBuild(entrypoints: string[], outdir: string): Promise<void> {
    await runBunBuild(entrypoints, outdir);
};

/** 复制 BullMQ 沙箱 bootstrap → {distDir}/dist/cjs/ */
export function copyBullmqCjs(distDir: string): void {
    const src = './node_modules/bullmq/dist/cjs';
    const dest = join(distDir, 'dist/cjs');
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
};