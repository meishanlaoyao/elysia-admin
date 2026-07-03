import { mkdirSync } from 'node:fs';
import { logger } from '@/shared/logger';
import {
  discoverProcessorEntries,
  runProcessorBuild,
  copyBullmqCjs,
  removeBuildEntryStubs,
} from './build-shared';

const distDir = './dist';
const processorEntries = discoverProcessorEntries();

if (processorEntries.length === 0) {
  logger.error('未在 src/infrastructure/queue/queues/*/processor.ts 发现任何 Processor');
  process.exit(1);
};
mkdirSync(`${distDir}/processors`, { recursive: true });
await runProcessorBuild(processorEntries, distDir);
copyBullmqCjs(distDir);
removeBuildEntryStubs();
for (const p of processorEntries) {
  logger.success(`✓ dist/processors/${p.name}.js`);
};
logger.success('✓ BullMQ sandbox bootstrap → dist/dist/cjs/');
logger.success('所有 Processor 构建完成');