import { rmSync, mkdirSync, existsSync, cpSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import appConfig from '@/config';
import { logger } from '@/shared/logger';
import { generateRegistry } from './generate-registry';

const distDir = './dist';
const publicDir = './public';

if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

// 构建前生成注册文件
generateRegistry({
  modulesPath: './src/modules',
  fileName: 'route',
  outputPath: './src/core/route-registry.generated.ts',
  exportName: 'allRoutes'
});
generateRegistry({
  modulesPath: './src/modules',
  fileName: 'task',
  outputPath: './src/core/task-registry.generated.ts',
  exportName: 'allTasks'
});

const buildResult = Bun.spawnSync([
  'bun',
  'build',
  '--minify-whitespace',
  '--minify-syntax',
  '--target',
  'bun',
  '--outfile',
  './dist/index.js',
  './src/index.ts'
]);
if (buildResult.exitCode !== 0) {
  logger.error('构建失败:' + buildResult.stderr.toString());
  process.exit(1);
};

// Worker 进程打包成单文件
// BullMQ 沙箱模式会先尝试 path.dirname(module.filename)/main.js，
// 找不到再 fallback 到 process.cwd()/dist/cjs/classes/main.js。
// 所以只需把 bullmq 的 main.js / main-worker.js 复制到 dist/cjs/classes/ 即可。
const workerBuildResult = Bun.spawnSync([
  'bun', 'build',
  '--minify-whitespace', '--minify-syntax',
  '--target', 'bun',
  '--outfile', './dist/workers.js',
  './src/infrastructure/queue/runtime/worker.ts'
]);
if (workerBuildResult.exitCode !== 0) {
  logger.error('Worker 构建失败:' + workerBuildResult.stderr.toString());
  process.exit(1);
};
logger.info('✓ Worker 构建完成 → dist/workers.js');

// 复制 BullMQ 沙箱所需的 bootstrap 文件
// main.js 依赖 ../utils 等相对路径，必须保持完整的 cjs 目录结构
const bullmqCjsDir = './node_modules/bullmq/dist/cjs';
const distCjsDir = './dist/cjs';
mkdirSync(distCjsDir, { recursive: true });
cpSync(bullmqCjsDir, distCjsDir, { recursive: true });
logger.info('✓ BullMQ sandbox bootstrap 文件已复制 → dist/cjs/');

// 打包各 Processor 为独立 JS（沙箱模式：BullMQ 用 child_process 独立运行每个 processor）
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
  };
  logger.info(`✓ Processor 构建完成 → dist/processors/${p.name}.js`);
};
// 复制 public 目录
if (existsSync(publicDir)) {
  const publicFiles = readdirSync(publicDir);
  if (publicFiles.length > 0) {
    cpSync(publicDir, join(distDir, 'public'), { recursive: true });
  } else {
    mkdirSync(join(distDir, 'public'), { recursive: true });
  };
} else {
  mkdirSync(join(distDir, 'public'), { recursive: true });
};
// 复制 production.yaml 配置文件
cpSync('./src/config/production.yaml', join(distDir, 'production.yaml'), { recursive: true });

const ecosystemConfig = `// PM2 配置文件
// 使用方式: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: '${appConfig.app.id}',
      script: 'bun',
      args: 'run index.js',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: ${appConfig.app.port}
      },
      error_file: './logs/app/err.log',
      out_file: './logs/app/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: '${appConfig.app.id}-workers',
      script: 'bun',
      args: 'run workers.js',
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/workers/err.log',
      out_file: './logs/workers/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};`;
writeFileSync(join(distDir, 'ecosystem.config.cjs'), ecosystemConfig, 'utf-8');

// 清理生成的临时文件
const generatedFiles = ['./src/core/task-registry.generated.ts', './src/core/route-registry.generated.ts'];
generatedFiles.forEach(file => { if (existsSync(file)) rmSync(file); });
logger.info('✓ 清理临时生成文件');
logger.success(`构建完成 → ${appConfig.app.id}:${appConfig.app.port}`);