import { mkdirSync, cpSync } from 'node:fs';
import { logger } from '@/shared/logger';

const processors: Array<{ name: string; entry: string }> = [
    { name: 'system-cron', entry: './src/infrastructure/queue/queues/system-cron/processor.ts' },
    { name: 'flow-buffer', entry: './src/infrastructure/queue/queues/flow-buffer/processor.ts' },
    { name: 'trade-order', entry: './src/infrastructure/queue/queues/trade-order/processor.ts' },
];

mkdirSync('./dist/processors', { recursive: true });
for (const p of processors) {
    const result = Bun.spawnSync([
        'bun', 'build',
        '--minify-whitespace', '--minify-syntax',
        '--target', 'bun',
        '--outfile', `./dist/processors/${p.name}.js`,
        p.entry
    ]);
    if (result.exitCode !== 0) {
        logger.error(`Processor "${p.name}" 构建失败: ` + result.stderr.toString());
        process.exit(1);
    }
    logger.success(`✓ dist/processors/${p.name}.js`);
};

// 复制 BullMQ 沙箱 bootstrap 文件（需要完整 cjs 目录，main.js 有相对路径依赖）
const bullmqCjsDir = './node_modules/bullmq/dist/cjs';
const distCjsDir = './dist/cjs';
mkdirSync(distCjsDir, { recursive: true });
cpSync(bullmqCjsDir, distCjsDir, { recursive: true });
logger.success('✓ BullMQ sandbox bootstrap → dist/cjs/');
logger.success('所有 Processor 构建完成');