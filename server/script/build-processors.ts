import { mkdirSync, cpSync } from 'node:fs';
import { logger } from '@/shared/logger';
import { bunBuildBaseArgs, discoverProcessorEntries } from './build-shared';

const processorEntries = discoverProcessorEntries();
if (processorEntries.length === 0) {
    logger.error('未在 src/infrastructure/queue/queues/*/processor.ts 发现任何 Processor');
    process.exit(1);
};
mkdirSync('./dist/processors', { recursive: true });
const processorBuildResult = Bun.spawnSync([
    ...bunBuildBaseArgs,
    '--outdir', './dist/processors',
    '--entry-naming', '[dir].[ext]',
    '--chunk-naming', 'chunk-[hash].[ext]',
    ...processorEntries.map((p) => p.entry),
]);
if (processorBuildResult.exitCode !== 0) {
    logger.error('Processor 构建失败: ' + processorBuildResult.stderr.toString());
    process.exit(1);
};
for (const p of processorEntries) {
    logger.success(`✓ dist/processors/${p.name}.js`);
};
// 复制 BullMQ 沙箱 bootstrap 文件（需要完整 cjs 目录，main.js 有相对路径依赖）
const bullmqCjsDir = './node_modules/bullmq/dist/cjs';
const distCjsDir = './dist/cjs';
mkdirSync(distCjsDir, { recursive: true });
cpSync(bullmqCjsDir, distCjsDir, { recursive: true });
logger.success('✓ BullMQ sandbox bootstrap → dist/cjs/');
logger.success('所有 Processor 构建完成');