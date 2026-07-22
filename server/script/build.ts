import { randomBytes } from 'node:crypto';
import { rmSync, mkdirSync, existsSync, cpSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import appConfig from '@/config';
import { logger } from '@/shared/logger';
import { generateRegistry } from './generate-registry';
import {
  discoverProcessorEntries,
  generateBuildEntryStubs,
  removeBuildEntryStubs,
  runUnifiedBuild,
  copyBullmqCjs,
} from './build-shared';

/** HS256 建议 ≥32 字节随机串 */
function randomJwtSecret(): string {
  return randomBytes(32).toString('base64url');
}

/** 仅改写 dist 内 jwt.accessToken / refreshToken 的 secret，不改源码配置 */
function injectJwtSecrets(yamlPath: string): void {
  const accessSecret = randomJwtSecret();
  const refreshSecret = randomJwtSecret();
  let inJwt = false;
  let section: 'access' | 'refresh' | null = null;
  let accessDone = false;
  let refreshDone = false;

  const lines = readFileSync(yamlPath, 'utf-8').split('\n').map((line) => {
    if (/^jwt:\s*$/.test(line)) {
      inJwt = true;
      section = null;
      return line;
    }
    if (inJwt && /^\S/.test(line)) {
      inJwt = false;
      section = null;
    }
    if (inJwt) {
      if (/^\s+accessToken:\s*$/.test(line)) section = 'access';
      else if (/^\s+refreshToken:\s*$/.test(line)) section = 'refresh';
      else if (section && /^\s+secret:\s*/.test(line)) {
        const secret = section === 'access' ? accessSecret : refreshSecret;
        if (section === 'access') accessDone = true;
        else refreshDone = true;
        section = null;
        return line.replace(/secret:\s*("[^"]*"|'[^']*'|\S+)/, `secret: "${secret}"`);
      }
    }
    return line;
  });
  if (!accessDone || !refreshDone) {
    throw new Error('production.yaml 中未找到 jwt.accessToken.secret 或 jwt.refreshToken.secret');
  };
  writeFileSync(yamlPath, lines.join('\n'), 'utf-8');
};

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

// 主进程 + Worker + Processor 单次构建，共享 chunk
const processorEntries = discoverProcessorEntries();
const entrypoints = generateBuildEntryStubs(processorEntries);
await runUnifiedBuild(entrypoints, distDir);

logger.info('✓ 主进程构建完成 → dist/index.js');
logger.info('✓ Worker 构建完成 → dist/workers.js');
if (processorEntries.length === 0) {
  logger.warn('未发现 Processor（queues/*/processor.ts），跳过 processors 构建');
} else {
  for (const p of processorEntries) {
    logger.info(`✓ Processor 构建完成 → dist/processors/${p.name}.js`);
  };
};

// BullMQ 沙箱 bootstrap
copyBullmqCjs(distDir);
logger.info('✓ BullMQ sandbox bootstrap → dist/dist/cjs/');

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

// 配置文件：复制后注入强随机 JWT secret（仅 dist，不改源码）
const productionYamlPath = join(distDir, 'production.yaml');
cpSync('./src/config/production.yaml', productionYamlPath);
injectJwtSecrets(productionYamlPath);
logger.info('✓ production.yaml 已复制，JWT secret 已随机注入');

// PM2 配置：业务/启动失败日志由 pino + appendFatalLog 写入 ./logs/YYYYMMDD/，不再采集 stdout/stderr
const nullLog = process.platform === 'win32' ? 'NUL' : '/dev/null';
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
      error_file: '${nullLog}',
      out_file: '${nullLog}',
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
        NODE_ENV: 'production',
        APP_ROLE: 'worker'
      },
      error_file: '${nullLog}',
      out_file: '${nullLog}',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};`;
writeFileSync(join(distDir, 'ecosystem.config.cjs'), ecosystemConfig, 'utf-8');

// 清理临时文件
const generatedFiles = ['./src/core/route-registry.generated.ts'];
generatedFiles.forEach(file => { if (existsSync(file)) rmSync(file); });
removeBuildEntryStubs();
logger.info('✓ 清理临时生成文件');
logger.success(`构建完成 → ${appConfig.app.id}:${appConfig.app.port}`);