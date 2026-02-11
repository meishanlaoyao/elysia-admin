import { rmSync, mkdirSync, existsSync, cpSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import appConfig from '@/config';
import { logger } from '@/shared/logger';
import { generateRegistry } from './generate-registry';

const distDir = './dist';
const publicDir = './public';

if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
}
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
const ecosystemConfig = `// PM2 配置文件
// 使用方式: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [{
    name: '${appConfig.app.id}', // 应用名称
    script: 'bun', // 启动脚本
    args: 'index.js', // 启动参数
    instances: 1, // 实例数量（cluster 模式下可设置多个）
    exec_mode: 'fork', // 执行模式：fork（单进程）或 cluster（集群）
    watch: false, // 不监听文件变化
    max_memory_restart: '500M', // 内存超过 500M 自动重启
    env: {
      NODE_ENV: 'production', // 生产环境
      PORT: ${appConfig.app.port} // 应用端口
    },
    error_file: './logs/err.log', // 错误日志文件
    out_file: './logs/out.log', // 输出日志文件
    log_date_format: 'YYYY-MM-DD HH:mm:ss', // 日志时间格式
    merge_logs: true, // 合并日志
    autorestart: true, // 自动重启
    max_restarts: 10, // 最大重启次数
    min_uptime: '10s' // 最小运行时间
  }]
};
`;
writeFileSync(join(distDir, 'ecosystem.config.cjs'), ecosystemConfig, 'utf-8');

// 清理生成的临时文件
const generatedFiles = [
    './src/core/task-registry.generated.ts',
    './src/core/route-registry.generated.ts'
];
generatedFiles.forEach(file => {
    if (existsSync(file)) {
        rmSync(file);
    }
});
logger.info('✓ 清理临时生成文件');

logger.success(`构建完成 → ${appConfig.app.id}:${appConfig.app.port}`);
