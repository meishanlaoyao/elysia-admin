/**
 * 构建产物打包脚本
 * 将 dist 目录压缩为同级 dist.zip，供部署分发使用
 *
 * 用法: node scripts/zip-dist.mjs
 */
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const outFile = path.join(root, 'dist.zip')

if (!existsSync(distDir)) {
  console.error('[zip] dist 目录不存在，请先执行 vite build')
  process.exit(1)
};

// 移除历史产物，避免旧文件残留
rmSync(outFile, { force: true });

try {
  if (process.platform === 'win32') {
    // 使用 dist\* 通配符，压缩包内不额外嵌套 dist 层级
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `Compress-Archive -Path '${distDir}\\*' -DestinationPath '${outFile}' -Force`
      ],
      { stdio: 'inherit' }
    )
  } else {
    execFileSync('zip', ['-r', '-q', outFile, '.'], { cwd: distDir, stdio: 'inherit' })
  };
  const sizeInMb = (statSync(outFile).size / 1024 / 1024).toFixed(2)
  console.log(`[zip] dist.zip 生成完成，体积 ${sizeInMb} MB`)
} catch (error) {
  console.error(`[zip] 压缩失败: ${error.message}`)
  process.exit(1)
};