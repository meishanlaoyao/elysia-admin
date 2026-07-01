import { rmSync, mkdirSync, existsSync, cpSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import appConfig from '@/config';
import { logger } from '@/shared/logger';
import { generateRegistry } from './generate-registry';
import { bunBuildBaseArgs, discoverProcessorEntries } from './build-shared';

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

// 主进程 + Worker（共享 chunk，Worker 输出后重命名为 workers.js）
const runtimeBuildResult = Bun.spawnSync([
  ...bunBuildBaseArgs,
  '--outdir', distDir,
  '--entry-naming', '[name].[ext]',
  '--chunk-naming', 'chunk-[hash].[ext]',
  './src/index.ts',
  './src/infrastructure/queue/runtime/worker.ts',
]);
if (runtimeBuildResult.exitCode !== 0) {
  logger.error('主进程/Worker 构建失败:' + runtimeBuildResult.stderr.toString());
  process.exit(1);
}
const workerOut = join(distDir, 'worker.js');
const workersOut = join(distDir, 'workers.js');
if (existsSync(workerOut)) {
  renameSync(workerOut, workersOut);
}
logger.info('✓ 主进程构建完成 → dist/index.js');
logger.info('✓ Worker 构建完成 → dist/workers.js');

// BullMQ 沙箱 bootstrap
const bullmqCjsDir = './node_modules/bullmq/dist/cjs';
const releaseCjsDir = `${distDir}/dist/cjs`;
mkdirSync(releaseCjsDir, { recursive: true });
cpSync(bullmqCjsDir, releaseCjsDir, { recursive: true });
logger.info('✓ BullMQ sandbox bootstrap → dist/dist/cjs/');

// Processor（多入口共享 chunk；入口名取队列目录名，自动扫描 queues/*/processor.ts）
mkdirSync(`${distDir}/processors`, { recursive: true });

const processorEntries = discoverProcessorEntries();
if (processorEntries.length === 0) {
  logger.warn('未发现 Processor（queues/*/processor.ts），跳过 processors 构建');
} else {
  const processorBuildResult = Bun.spawnSync([
    ...bunBuildBaseArgs,
    '--outdir', `${distDir}/processors`,
    '--entry-naming', '[dir].[ext]',
    '--chunk-naming', 'chunk-[hash].[ext]',
    ...processorEntries.map((p) => p.entry),
  ]);
  if (processorBuildResult.exitCode !== 0) {
    logger.error('Processor 构建失败: ' + processorBuildResult.stderr.toString());
    process.exit(1);
  }
  for (const p of processorEntries) {
    logger.info(`✓ Processor 构建完成 → dist/processors/${p.name}.js`);
  }
}

// 静态资源
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

// 配置文件
cpSync('./src/config/production.yaml', join(distDir, 'production.yaml'));
logger.info('✓ production.yaml 已复制');

// PM2 配置
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

// 清理临时文件
const generatedFiles = [
  './src/core/task-registry.generated.ts',
  './src/core/route-registry.generated.ts'
];
generatedFiles.forEach(file => { if (existsSync(file)) rmSync(file); });
logger.info('✓ 清理临时生成文件');
logger.success(`构建完成 → ${appConfig.app.id}:${appConfig.app.port}`);